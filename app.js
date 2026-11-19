// AgentPass frontend — static, no build step. ethers v6 via CDN.
// No QR login, no stored session/key. Every tx is confirmed in the user's wallet.
"use strict";

const AGENTPASS_ABI = [
  "function checkIn()",
  "function leaveMark(string message)",
  "function tip(address to) payable",
  "function claimBuilder(address contractAddr)",
  "function claimEarly()",
  "function hasBadge(address,uint8) view returns (bool)",
  "function badgesOf(address) view returns (bool[5])",
  "function profile(address) view returns (uint256,uint256,uint256,uint256,uint256)",
  "function totalHolders() view returns (uint256)",
  "function totalCheckIns() view returns (uint256)",
  "function lastMark(address) view returns (string)",
  "event CheckIn(address indexed who, uint256 streak, uint256 day)",
  "event Mark(address indexed who, string message)",
  "event BadgeAwarded(address indexed who, uint8 indexed badge)",
];
const AGENTID_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function ownerOf(uint256) view returns (address)",
  "function tokenURI(uint256) view returns (string)",
];

const $ = (id) => document.getElementById(id);
const short = (a) => a ? a.slice(0, 6) + "…" + a.slice(-4) : "";

let provider, signer, account, agentPass, agentId, readProvider;

function setStatus(id, msg, cls) {
  const el = $(id);
  el.textContent = msg;
  el.className = cls || "";
}

async function initRead() {
  readProvider = new ethers.JsonRpcProvider(CONFIG.RPC_URL);
  agentId = new ethers.Contract(CONFIG.AGENT_ID_ADDRESS, AGENTID_ABI, readProvider);
  if (CONFIG.AGENTPASS_ADDRESS !== "0x0000000000000000000000000000000000000000") {
    agentPass = new ethers.Contract(CONFIG.AGENTPASS_ADDRESS, AGENTPASS_ABI, readProvider);
  }
}

async function connect() {
  if (!window.ethereum) { setStatus("walletStatus", "Tidak ada injected wallet (Binance Wallet / MetaMask) terdeteksi.", "bad"); return; }
  try {
    provider = new ethers.BrowserProvider(window.ethereum);
    const net = await provider.getNetwork();
    if (Number(net.chainId) !== CONFIG.CHAIN_ID) {
      try {
        await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
      } catch (e) {
        setStatus("walletStatus", "Pindah ke BSC mainnet (chain 56) di wallet kamu, lalu connect lagi.", "bad");
        return;
      }
    }
    const accounts = await provider.send("eth_requestAccounts", []);
    account = accounts[0];
    signer = await provider.getSigner();
    if (agentPass) agentPass = agentPass.connect(signer);
    setStatus("walletStatus", "Terhubung: " + short(account), "ok");
    $("nameBox").hidden = false;
    await refreshAll();
  } catch (e) {
    setStatus("walletStatus", "Gagal connect: " + (e.reason || e.message), "bad");
  }
}

async function refreshAll() {
  // Agent ID status
  let holds = false;
  try {
    holds = (await agentId.balanceOf(account)) > 0n;
  } catch (e) { /* read error -> treat as unknown */ }
  setStatus("agentIdStatus", holds ? "Agent ID ✓ — kamu pegang Agent ID." : "Agent ID ✗ — alamat ini tidak pegang Agent ID. Fungsi tulis AgentPass tidak bisa dipakai.", holds ? "ok" : "bad");

  for (const id of ["checkInBtn", "markBtn", "tipBtn", "builderCheckBtn", "earlyBtn"]) {
    $(id).disabled = !holds || !agentPass;
  }
  if (!agentPass) {
    $("profile").textContent = "Kontrak AgentPass belum di-deploy (alamat belum diisi di config.js).";
    return;
  }
  // Profile + badges
  try {
    const [streak, total, marks, sent, received] = await agentPass.profile(account);
    const badges = await agentPass.badgesOf(account);
    const holders = await agentPass.totalHolders();
    $("profile").innerHTML =
      `Streak: <b>${streak}</b> hari &nbsp;|&nbsp; Total check-in: <b>${total}</b> &nbsp;|&nbsp; Mark: <b>${marks}</b><br>` +
      `Tip terkirim: <b>${sent}</b> &nbsp;|&nbsp; Tip diterima: <b>${received}</b> &nbsp;|&nbsp; Total pemegang badge: <b>${holders}</b> / 100 Early`;
    document.querySelectorAll(".badge").forEach((el) => {
      el.classList.toggle("on", badges[Number(el.dataset.badge) - 1]);
    });
  } catch (e) {
    $("profile").textContent = "Gagal baca profil: " + (e.reason || e.message);
  }
  loadLeaderboard();
  loadRecentMarks();
}

// ---- .ai name resolution (VERIFIED path) ----
// The Agent ID contract has no enumerable (totalSupply/tokenByIndex revert),
// so address -> name cannot be enumerated on-chain. Instead the USER types
// their label; we verify: tokenId = keccak256(label), ownerOf(tokenId) must
// equal the connected address. tokenURI then gives the metadata URL, whose
// host (agentid.prd.space.id) was read from the live contract, not guessed:
// e.g. tokenURI(keccak256("agent")) = https://agentid.prd.space.id/metadata/agent.json
// Verified 2026-11-19 via bsc-dataseed: "agent" and "binance" resolve, "ai"/"test" revert (unregistered).
async function verifyName() {
  const label = $("aiNameInput").value.trim().toLowerCase().replace(/\.ai$/, "");
  if (!label) { setStatus("nameStatus", "Isi dulu nama .ai kamu.", "bad"); return; }
  setStatus("nameStatus", "Memverifikasi on-chain…");
  try {
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes(label));
    const owner = await agentId.ownerOf(tokenId);
    if (owner.toLowerCase() !== account.toLowerCase()) {
      setStatus("nameStatus", `Nama "${label}.ai" terdaftar, tapi pemiliknya ${short(owner)} — bukan alamat kamu.`, "bad");
      return;
    }
    const uri = await agentId.tokenURI(tokenId);
    let img = "";
    try {
      const meta = await (await fetch(uri)).json();
      img = meta.image || "";
    } catch (e) { /* metadata fetch optional */ }
    setStatus("nameStatus", `Terverifikasi: ${label}.ai milik kamu ✓`, "ok");
    if (img) { const av = $("avatar"); av.src = img; av.hidden = false; }
  } catch (e) {
    setStatus("nameStatus", `Nama "${label}.ai" tidak ditemukan di kontrak Agent ID (belum terdaftar) atau gagal dibaca.`, "bad");
  }
}

// ---- actions ----
async function doCheckIn() {
  setStatus("checkInStatus", "Menunggu konfirmasi di wallet…");
  try {
    const tx = await agentPass.connect(signer).checkIn();
    setStatus("checkInStatus", "Tx terkirim: " + tx.hash + " — menunggu konfirmasi…");
    await tx.wait();
    setStatus("checkInStatus", "Check-in berhasil ✓ Tx: " + tx.hash, "ok");
    await refreshAll();
  } catch (e) { setStatus("checkInStatus", "Gagal: " + (e.reason || e.message), "bad"); }
}

async function doMark() {
  const msg = $("markInput").value;
  if (!msg) { setStatus("markStatus", "Isi pesan dulu.", "bad"); return; }
  if (msg.length > 280) { setStatus("markStatus", "Pesan maks 280 karakter.", "bad"); return; }
  setStatus("markStatus", "Menunggu konfirmasi di wallet…");
  try {
    const tx = await agentPass.connect(signer).leaveMark(msg);
    await tx.wait();
    setStatus("markStatus", "Mark terkirim ✓ Tx: " + tx.hash, "ok");
    await refreshAll();
  } catch (e) { setStatus("markStatus", "Gagal: " + (e.reason || e.message), "bad"); }
}

async function doTip() {
  const to = $("tipTo").value.trim();
  const amount = $("tipAmount").value.trim();
  if (!ethers.isAddress(to)) { setStatus("tipStatus", "Alamat tujuan tidak valid.", "bad"); return; }
  let value;
  try { value = ethers.parseEther(amount); } catch (e) { setStatus("tipStatus", "Jumlah BNB tidak valid.", "bad"); return; }
  if (value === 0n) { setStatus("tipStatus", "Jumlah harus > 0.", "bad"); return; }
  try {
    const holds = (await agentId.balanceOf(to)) > 0n;
    if (!holds) { setStatus("tipStatus", "Penerima tidak pegang Agent ID — tip akan revert.", "bad"); return; }
  } catch (e) { setStatus("tipStatus", "Gagal cek Agent ID penerima: " + (e.reason || e.message), "bad"); return; }
  setStatus("tipStatus", "Menunggu konfirmasi di wallet… (seluruh jumlah diteruskan, tanpa fee)");
  try {
    const tx = await agentPass.connect(signer).tip(to, { value });
    await tx.wait();
    setStatus("tipStatus", `Tip ${amount} BNB terkirim ✓ Tx: ` + tx.hash, "ok");
    await refreshAll();
  } catch (e) { setStatus("tipStatus", "Gagal: " + (e.reason || e.message), "bad"); }
}

// ---- Builder: BscScan verified-source check BEFORE enabling claim ----
let builderVerified = false;
async function checkBuilder() {
  const addr = $("builderAddr").value.trim();
  if (!ethers.isAddress(addr)) { setStatus("builderCheckStatus", "Alamat kontrak tidak valid.", "bad"); return; }
  setStatus("builderCheckStatus", "Memeriksa BscScan…");
  builderVerified = false;
  $("builderClaimBtn").disabled = true;
  try {
    const url = "https://api.bscscan.com/api?module=contract&action=getsourcecode&address=" + addr;
    const res = await (await fetch(url)).json();
    const src = res && res.result && res.result[0];
    if (src && src.SourceCode && src.SourceCode !== "") {
      builderVerified = true;
      $("builderClaimBtn").disabled = false;
      setStatus("builderCheckStatus", `Terverifikasi di BscScan ✓ (${src.ContractName || "kontrak"}) — tombol klaim aktif.`, "ok");
    } else {
      setStatus("builderCheckStatus", "Kontrak ini TIDAK terverifikasi di BscScan (source kosong). Klaim Builder tidak disarankan — badge Builder untuk kontrak terverifikasi.", "bad");
    }
  } catch (e) {
    // Honest fallback: API unreachable (rate-limit / no key / offline).
    setStatus("builderCheckStatus", "PERINGATAN: API BscScan tidak bisa diakses dari browser ini (mungkin rate-limit / butuh API key). Verifikasi tidak bisa dipastikan — klaim tetap diizinkan dengan catatan ini, tapi pastikan sendiri kontrakmu terverifikasi di bscscan.com sebelum klaim.", "warn");
    builderVerified = true; // allow with warning, per spec
    $("builderClaimBtn").disabled = false;
  }
}

async function doBuilderClaim() {
  const addr = $("builderAddr").value.trim();
  setStatus("builderStatus", "Menunggu konfirmasi di wallet…");
  try {
    const tx = await agentPass.connect(signer).claimBuilder(addr);
    await tx.wait();
    setStatus("builderStatus", "Badge Builder diklaim ✓ Tx: " + tx.hash + (builderVerified ? "" : " (tanpa verifikasi BscScan yang terkonfirmasi — lihat peringatan di atas)"), "ok");
    await refreshAll();
  } catch (e) { setStatus("builderStatus", "Gagal: " + (e.reason || e.message), "bad"); }
}

async function doEarly() {
  setStatus("earlyStatus", "Menunggu konfirmasi di wallet…");
  try {
    const tx = await agentPass.connect(signer).claimEarly();
    await tx.wait();
    setStatus("earlyStatus", "Badge Early Agent diklaim ✓ Tx: " + tx.hash, "ok");
    await refreshAll();
  } catch (e) { setStatus("earlyStatus", "Gagal (mungkin kuota 100 sudah penuh atau sudah diklaim): " + (e.reason || e.message), "bad"); }
}

// ---- leaderboard + recent marks from events ----
async function loadLeaderboard() {
  const el = $("leaderboard");
  if (!agentPass || CONFIG.DEPLOY_BLOCK === 0) { el.innerHTML = "<li>Leaderboard aktif setelah kontrak di-deploy (DEPLOY_BLOCK belum diisi).</li>"; return; }
  try {
    const events = await agentPass.queryFilter(agentPass.filters.CheckIn, CONFIG.DEPLOY_BLOCK, "latest");
    const best = new Map();
    for (const ev of events) {
      const who = ev.args.who, s = Number(ev.args.streak);
      if (s > (best.get(who) || 0)) best.set(who, s);
    }
    const top = [...best.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    el.innerHTML = top.length
      ? top.map(([a, s]) => `<li>${short(a)} — streak ${s}</li>`).join("")
      : "<li>Belum ada check-in.</li>";
  } catch (e) { el.innerHTML = "<li>Gagal memuat leaderboard.</li>"; }
}

async function loadRecentMarks() {
  const el = $("markList");
  if (!agentPass || CONFIG.DEPLOY_BLOCK === 0) { el.innerHTML = "<li>—</li>"; return; }
  try {
    const events = await agentPass.queryFilter(agentPass.filters.Mark, CONFIG.DEPLOY_BLOCK, "latest");
    const last = events.slice(-10).reverse();
    el.innerHTML = last.length
      ? last.map((ev) => `<li><b>${short(ev.args.who)}</b>: ${ev.args.message}</li>`).join("")
      : "<li>Belum ada mark.</li>";
  } catch (e) { el.innerHTML = "<li>Gagal memuat mark.</li>"; }
}

$("connectBtn").addEventListener("click", connect);
$("verifyNameBtn").addEventListener("click", verifyName);
$("checkInBtn").addEventListener("click", doCheckIn);
$("markBtn").addEventListener("click", doMark);
$("tipBtn").addEventListener("click", doTip);
$("builderCheckBtn").addEventListener("click", checkBuilder);
$("builderClaimBtn").addEventListener("click", doBuilderClaim);
$("earlyBtn").addEventListener("click", doEarly);

initRead().then(() => { if (CONFIG.AGENTPASS_ADDRESS !== "0x0000000000000000000000000000000000000000") loadLeaderboard(); loadRecentMarks(); });
