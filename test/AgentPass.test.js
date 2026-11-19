const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const GAS = {}; // label -> gasUsed, printed at the end

async function recordGas(label, txPromise) {
  const tx = await txPromise;
  const rc = await tx.wait();
  GAS[label] = Number(rc.gasUsed);
  return rc;
}

describe("AgentPass", function () {
  let agentId, pass, deployer, holder1, holder2, stranger;

  beforeEach(async function () {
    [deployer, holder1, holder2, stranger] = await ethers.getSigners();
    const Mock = await ethers.getContractFactory("MockAgentId");
    agentId = await Mock.deploy();
    await agentId.waitForDeployment();
    const Pass = await ethers.getContractFactory("AgentPass");
    pass = await Pass.deploy(await agentId.getAddress());
    await pass.waitForDeployment();
    await agentId.mint(holder1.address);
    await agentId.mint(holder2.address);
    // stranger holds NO Agent ID
  });

  // ---------- checkIn ----------

  it("checkIn: holder checks in, streak 1, DAILY badge, event", async function () {
    await expect(recordGas("checkIn (first)", pass.connect(holder1).checkIn()))
      .to.emit(pass, "CheckIn")
      .withArgs(holder1.address, 1, BigInt(Math.floor((await time.latest()) / 86400)));
    expect(await pass.streak(holder1.address)).to.equal(1);
    expect(await pass.hasBadge(holder1.address, 1)).to.equal(true);
    expect(await pass.totalHolders()).to.equal(1);
    expect(await pass.totalCheckIns()).to.equal(1);
  });

  it("checkIn: 2x same UTC day reverts", async function () {
    await pass.connect(holder1).checkIn();
    await expect(pass.connect(holder1).checkIn())
      .to.be.revertedWithCustomError(pass, "AlreadyCheckedInToday");
  });

  it("checkIn: next day streak becomes 2", async function () {
    await pass.connect(holder1).checkIn();
    await time.increase(86400);
    await pass.connect(holder1).checkIn();
    expect(await pass.streak(holder1.address)).to.equal(2);
    expect(await pass.totalCheckInsOf(holder1.address)).to.equal(2);
  });

  it("checkIn: streak resets to 1 after a missed day", async function () {
    await pass.connect(holder1).checkIn();
    await time.increase(86400);
    await pass.connect(holder1).checkIn(); // streak 2
    await time.increase(2 * 86400); // skip one full day
    await pass.connect(holder1).checkIn();
    expect(await pass.streak(holder1.address)).to.equal(1);
  });

  it("checkIn: non-holder reverts", async function () {
    await expect(pass.connect(stranger).checkIn())
      .to.be.revertedWithCustomError(pass, "NotAgentIdHolder");
  });

  // ---------- leaveMark ----------

  it("leaveMark: stores message, MARK badge, event", async function () {
    await expect(recordGas("leaveMark", pass.connect(holder1).leaveMark("Halo agent!")))
      .to.emit(pass, "Mark")
      .withArgs(holder1.address, "Halo agent!");
    expect(await pass.lastMark(holder1.address)).to.equal("Halo agent!");
    expect(await pass.marksOf(holder1.address)).to.equal(1);
    expect(await pass.hasBadge(holder1.address, 2)).to.equal(true);
  });

  it("leaveMark: >280 chars reverts", async function () {
    const long = "x".repeat(281);
    await expect(pass.connect(holder1).leaveMark(long))
      .to.be.revertedWithCustomError(pass, "MessageTooLong");
    // exactly 280 is fine
    await pass.connect(holder1).leaveMark("x".repeat(280));
  });

  it("leaveMark: non-holder reverts", async function () {
    await expect(pass.connect(stranger).leaveMark("hi"))
      .to.be.revertedWithCustomError(pass, "NotAgentIdHolder");
  });

  // ---------- tip ----------

  it("tip: forwards 100% of value, TIPPER badge, counters", async function () {
    const amount = ethers.parseEther("0.01");
    const before = await ethers.provider.getBalance(holder2.address);
    await expect(recordGas("tip", pass.connect(holder1).tip(holder2.address, { value: amount })))
      .to.emit(pass, "Tip")
      .withArgs(holder1.address, holder2.address, amount);
    const after = await ethers.provider.getBalance(holder2.address);
    expect(after - before).to.equal(amount); // 100% forwarded
    expect(await ethers.provider.getBalance(await pass.getAddress())).to.equal(0); // no custody
    expect(await pass.hasBadge(holder1.address, 3)).to.equal(true);
    expect(await pass.tipsSent(holder1.address)).to.equal(1);
    expect(await pass.tipsReceived(holder2.address)).to.equal(1);
  });

  it("tip: 0 value reverts", async function () {
    await expect(pass.connect(holder1).tip(holder2.address, { value: 0 }))
      .to.be.revertedWithCustomError(pass, "ZeroTip");
  });

  it("tip: to non-holder reverts", async function () {
    await expect(
      pass.connect(holder1).tip(stranger.address, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWithCustomError(pass, "TipToNonHolder");
  });

  it("tip: from non-holder reverts", async function () {
    await expect(
      pass.connect(stranger).tip(holder1.address, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWithCustomError(pass, "NotAgentIdHolder");
  });

  // ---------- claimBuilder ----------

  it("claimBuilder: records contract, BUILDER badge, event", async function () {
    const target = await agentId.getAddress();
    await expect(recordGas("claimBuilder", pass.connect(holder1).claimBuilder(target)))
      .to.emit(pass, "BuilderClaimed")
      .withArgs(holder1.address, target);
    expect(await pass.builderContract(holder1.address)).to.equal(target);
    expect(await pass.hasBadge(holder1.address, 4)).to.equal(true);
  });

  it("claimBuilder: second claim reverts", async function () {
    await pass.connect(holder1).claimBuilder(await agentId.getAddress());
    await expect(pass.connect(holder1).claimBuilder(await pass.getAddress()))
      .to.be.revertedWithCustomError(pass, "AlreadyClaimed");
  });

  it("claimBuilder: zero address reverts; non-holder reverts", async function () {
    await expect(pass.connect(holder1).claimBuilder(ethers.ZeroAddress))
      .to.be.revertedWithCustomError(pass, "ZeroAddress");
    await expect(pass.connect(stranger).claimBuilder(await agentId.getAddress()))
      .to.be.revertedWithCustomError(pass, "NotAgentIdHolder");
  });

  // ---------- claimEarly ----------

  it("claimEarly: first holder gets EARLY badge", async function () {
    await expect(recordGas("claimEarly", pass.connect(holder1).claimEarly()))
      .to.emit(pass, "EarlyClaimed")
      .withArgs(holder1.address);
    expect(await pass.hasBadge(holder1.address, 5)).to.equal(true);
  });

  it("claimEarly: second claim by same holder reverts", async function () {
    await pass.connect(holder1).claimEarly();
    await expect(pass.connect(holder1).claimEarly())
      .to.be.revertedWithCustomError(pass, "AlreadyClaimed");
  });

  it("claimEarly: 101st unique holder reverts (cap 100)", async function () {
    // 100 fresh wallets, each minted a mock Agent ID, each claims EARLY.
    const wallets = [];
    for (let i = 0; i < 101; i++) {
      const w = ethers.Wallet.createRandom().connect(ethers.provider);
      wallets.push(w);
      await agentId.mint(w.address);
      // fund gas for the claimEarly call
      await deployer.sendTransaction({ to: w.address, value: ethers.parseEther("0.01") });
    }
    for (let i = 0; i < 100; i++) {
      await pass.connect(wallets[i]).claimEarly();
    }
    expect(await pass.totalHolders()).to.equal(100);
    await expect(pass.connect(wallets[100]).claimEarly())
      .to.be.revertedWithCustomError(pass, "EarlyCapReached");
  });

  it("claimEarly: non-holder reverts", async function () {
    await expect(pass.connect(stranger).claimEarly())
      .to.be.revertedWithCustomError(pass, "NotAgentIdHolder");
  });

  // ---------- views ----------

  it("views: badgesOf + profile reflect all actions", async function () {
    await pass.connect(holder1).checkIn();
    await pass.connect(holder1).leaveMark("hi");
    await pass.connect(holder1).tip(holder2.address, { value: 1000 });
    await pass.connect(holder1).claimBuilder(await agentId.getAddress());
    await pass.connect(holder1).claimEarly();
    expect(await pass.badgesOf(holder1.address)).to.deep.equal([true, true, true, true, true]);
    expect(await pass.badgesOf(holder2.address)).to.deep.equal([false, false, false, false, false]);
    const p = await pass.profile(holder1.address);
    expect(p[0]).to.equal(1); // streak
    expect(p[1]).to.equal(1); // totalCheckIns
    expect(p[2]).to.equal(1); // marks
    expect(p[3]).to.equal(1); // tipsSent
    expect(p[4]).to.equal(0); // tipsReceived
    expect(await pass.totalHolders()).to.equal(1); // one unique holder
  });

  after(function () {
    console.log("\n==== GAS (Hardhat local, optimizer runs=200) ====");
    for (const [k, v] of Object.entries(GAS)) console.log(`  ${k}: ${v.toLocaleString("en-US")} gas`);
  });
});
