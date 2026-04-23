
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

// Get the specific tx details from blockscout
const tx_hash = '0x0e01db8a11'; // partial from earlier

// Get all txs for payer
const res = await fetch(`https://base.blockscout.com/api/v2/addresses/${PAYER}/transactions?limit=5`);
const data = await res.json();
for (const t of (data.items || [])) {
  console.log('--- TX ---');
  console.log('hash:', t.hash);
  console.log('from:', t.from?.hash, '| to:', t.to?.hash);
  console.log('value:', t.value, '| type:', t.type, '| status:', t.status);
  console.log('timestamp:', t.timestamp);
  
  // Get token transfers for this tx
  const tokRes = await fetch(`https://base.blockscout.com/api/v2/transactions/${t.hash}/token-transfers?limit=10`);
  const tokData = await tokRes.json();
  for (const tt of (tokData.items || [])) {
    console.log('  Transfer:', tt.from?.hash?.slice(0,12), '->', tt.to?.hash?.slice(0,12), '| amount:', tt.total?.value, tt.token?.symbol);
  }
}
