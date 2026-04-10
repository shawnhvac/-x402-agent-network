const {ethers} = require('ethers');
const provider = new ethers.JsonRpcProvider('https://polygon.drpc.org');
const wallet = new ethers.Wallet('52c8bc7ee93aa6734bef6c89349951cd7b7c1e9ebd2543897e013d297b254e72', provider);

// USDC contract on Polygon
const usdcAddress = '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359'; // Native USDC
const usdceAddress = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174'; // Bridged USDC.e

const abi = ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'];

(async () => {
  try {
    const usdc = new ethers.Contract(usdcAddress, abi, provider);
    const usdce = new ethers.Contract(usdceAddress, abi, provider);
    
    const [balanceUsdc, balanceUsdce, decimalsUsdc] = await Promise.all([
      usdc.balanceOf(wallet.address),
      usdce.balanceOf(wallet.address),
      usdc.decimals()
    ]);
    
    console.log('Address:', wallet.address);
    console.log('Native USDC:', ethers.formatUnits(balanceUsdc, decimalsUsdc));
    console.log('Bridged USDC.e:', ethers.formatUnits(balanceUsdce, 6));
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
