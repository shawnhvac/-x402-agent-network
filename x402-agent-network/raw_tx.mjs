
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const TX = '0xaa7609b5ce24e3b1ef1a2e3c2d1b5d4ac3aaa8b1e0a5fc7bb52ab7cad4aa6e2b';

// Try getting tx by hash
const res = await fetch('https://base.blockscout.com/api/v2/addresses/' + PAYER + '/transactions?limit=5');
const data = await res.json();
console.log('total count:', data.next_page_params);
for (const t of (data.items || []).slice(0,5)) {
  console.log(JSON.stringify({ hash: t.hash, from: t.from?.hash, to: t.to?.hash, value: t.value, status: t.status, type: t.type, ts: t.timestamp }));
}
