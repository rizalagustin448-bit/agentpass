const { ethers } = require('/home/hatch/workspace/nonce-mcp/tools/node_modules/ethers');
(async () => {
  const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.bnbchain.org', { chainId: 56, name: 'bsc' }, { staticNetwork: true });
  const personal = '0x13C7F560367AfC703d9885c5597a91A27919ac24';
  const gasPrice = await provider.getGasPrice();
  const bal = await provider.getBalance(personal);
  const nonce = await provider.getTransactionCount(personal, 'pending');
  const gasEst = 1195662n;
  const cost = gasPrice * gasEst;
  const predicted = ethers.getCreateAddress({ from: personal, nonce });
  console.log(JSON.stringify({
    gasPriceGwei: (Number(gasPrice) / 1e9).toString(),
    balanceBNB: ethers.formatEther(bal),
    nonce,
    costBNB: ethers.formatEther(cost),
    remainingBNB: ethers.formatEther(bal - cost),
    fits006: gasPrice <= 60000000n,
    predicted
  }, null, 2));
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
