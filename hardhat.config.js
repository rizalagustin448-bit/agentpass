require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 200 } },
  },
  networks: {
    hardhat: {},
    // BSC mainnet deployment is MANUAL (see README.md) — no keys here.
    bsc: {
      url: "https://bsc-dataseed.bnbchain.org",
      chainId: 56,
    },
  },
};
