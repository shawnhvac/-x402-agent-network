
const PAYER = '0xC7A6f6b8b4d5151Fe1858e7C428A9963634Bd33c';
const URL_BASE = 'https://base.blockscout.com';

// Direct API for token transfers from payer
const res = await fetch(`${URL_BASE}/api/v2/addresses/${PAYER}/token-transfers?token=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913&limit=10`);
const text = await res.text();
console.log(text.slice(0, 2000));
