// AgentPass frontend config — terisi sesudah deploy (19 Nov 2026 ~14:28 WIB).
// AGENTPASS_ADDRESS: alamat kontrak AgentPass yang sudah ter-deploy + terverifikasi di BSC mainnet.
// DEPLOY_BLOCK: nomor blok saat kontrak di-deploy (dari receipt deploy).
const CONFIG = {
  AGENTPASS_ADDRESS: "0xa6Ef7BEb5892b9d07978a554F4ee982439531325", // ter-deploy 19 Nov 2026 ~14:28 WIB
  DEPLOY_BLOCK: 134463283, // dari receipt deploy (tx 0x073d6368d9429499ca45d6e2934c49e623764024e78a47c0ec1ad7ab2475b49b)
  AGENT_ID_ADDRESS: "0x60b9262456de011f7d15a54cdd8c48baaa8b022f",
  CHAIN_ID: 56, // BSC mainnet
  RPC_URL: "https://bsc-dataseed.bnbchain.org",
};
