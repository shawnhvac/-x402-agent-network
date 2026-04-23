
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';

// Try etherscan-compatible basescan API
const res = await fetch(`https://api.basescan.org/api?module=account&action=txlist&address=${PAYER}&sort=desc&limit=5`);
const text = await res.text();
console.log('Basescan response (first 800):', text.slice(0, 800));

// Also check internal txns
const res2 = await fetch(`https://api.basescan.org/api?module=account&action=txlistinternal&address=${PAYER}&sort=desc&limit=5`);
const text2 = await res2.text();
console.log('Internal txns (first 500):', text2.slice(0, 500));
