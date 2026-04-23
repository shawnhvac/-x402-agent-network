
import { privateKeyToAccount } from 'viem/accounts';
const pk = process.env.EVM_PRIVATE_KEY;
if (!pk) { console.log('NO EVM_PRIVATE_KEY SET'); process.exit(1); }
const account = privateKeyToAccount(pk);
console.log('Address from EVM_PRIVATE_KEY:', account.address);
