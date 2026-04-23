
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const URL_BASE = 'https://base.blockscout.com';

// Direct API for token transfers from payer
const res = await fetch(`${URL_BASE}/api/v2/addresses/${PAYER}/token-transfers?token=${USDC}&filter=from`);
const data = await res.json();
console.log('Items:', data.items?.length);
for (const tt of (data.items || [])) {
  console.log(JSON.stringify({
    tx: tt.tx_hash?.slice(0,14),
    from: tt.from?.hash?.slice(0,14),
    to: tt.to?.hash,
    amount: tt.total?.value,
    decimals: tt.total?.decimals,
    ts: tt.timestamp
  }));
}
