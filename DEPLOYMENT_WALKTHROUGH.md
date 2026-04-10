# Complete Solana Deployment Walkthrough - Step by Step

**Status**: Ready to execute  
**Time Required**: ~30 minutes total  
**Difficulty**: Medium (copy-paste mostly)  
**Result**: Real on-chain autonomous agent payments

---

## Prerequisites Checklist

Before starting, make sure you have:

- [ ] Computer with internet connection
- [ ] Terminal/Command line access
- [ ] ~30 minutes free time
- [ ] 10+ SOL in a native wallet (for test funds)

---

## STEP 1: Install Solana CLI (5 minutes)

### On macOS/Linux:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

### On Windows (PowerShell):
```powershell
powershell -Command "irm https://release.solana.com/v1.18.0/install | iex"
```

### Verify Installation:
```bash
solana --version
# Should print: solana-cli 1.18.0 (or similar)
```

---

## STEP 2: Install Rust & Anchor (10 minutes)

### Install Rust:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### Install Anchor:
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install latest
avm use latest
```

### Verify:
```bash
anchor --version
# Should print: anchor-cli 0.28.0 (or similar)
```

---

## STEP 3: Create Fresh Solana Wallets (5 minutes)

### Create Buyer Wallet:
```bash
solana-keygen new --outfile ~/buyer.json
# Save the seed phrase securely
```

### Create Seller Wallet:
```bash
solana-keygen new --outfile ~/seller.json
# Save the seed phrase securely
```

### Create Arbitrator Wallet:
```bash
solana-keygen new --outfile ~/arbitrator.json
# Save the seed phrase securely
```

### List Your Wallets:
```bash
echo "Buyer: $(solana-keygen pubkey ~/buyer.json)"
echo "Seller: $(solana-keygen pubkey ~/seller.json)"
echo "Arbitrator: $(solana-keygen pubkey ~/arbitrator.json)"
```

**Save these addresses - you'll need them**

---

## STEP 4: Configure Solana CLI for Devnet (2 minutes)

### Set Devnet as Default:
```bash
solana config set --url https://api.devnet.solana.com
```

### Verify Configuration:
```bash
solana config get
# Should show: RPC URL: https://api.devnet.solana.com
```

### Set Default Keypair (use buyer):
```bash
solana config set --keypair ~/buyer.json
```

---

## STEP 5: Fund Your Wallets from Faucet (5 minutes)

### Request Airdrop for Buyer:
```bash
solana airdrop 10 $(solana-keygen pubkey ~/buyer.json) --url devnet
```

### Request Airdrop for Seller:
```bash
solana airdrop 10 $(solana-keygen pubkey ~/seller.json) --url devnet
```

### Request Airdrop for Arbitrator:
```bash
solana airdrop 2 $(solana-keygen pubkey ~/arbitrator.json) --url devnet
```

### Verify Balances:
```bash
solana balance $(solana-keygen pubkey ~/buyer.json) --url devnet
solana balance $(solana-keygen pubkey ~/seller.json) --url devnet
solana balance $(solana-keygen pubkey ~/arbitrator.json) --url devnet
# Each should show their SOL balance
```

---

## STEP 6: Clone/Navigate to Project (2 minutes)

```bash
# If you have the code directory
cd /root/.openclaw/workspace/x402-agent-network

# Or if starting fresh
git clone <repository-url>
cd x402-agent-network

# Verify structure
ls -la programs/smart-escrow/src/lib.rs
ls -la src/integration/
```

---

## STEP 7: Build SmartEscrow Contract (3 minutes)

```bash
anchor build
```

**Expected Output:**
```
Compiling smart_escrow v0.1.0
Finished release [optimized] target(s) in 45.23s
```

**Save the Program ID** from the output:
- Look for: `Deployed Program: <PROGRAM_ID>`

---

## STEP 8: Update Configuration with Real IDs (2 minutes)

### Get Your Program ID:
```bash
cat Anchor.toml | grep smart_escrow
# Note the program ID
```

### Update Integration Test Config:

Open: `src/integration/integration-test.ts`

Find this section (around line 50):
```typescript
const escrowConfig: EscrowConfig = {
  rpcUrl: 'https://api.devnet.solana.com',
  programId: 'SmartEscrowProgramIdHere1234567890123456789',
  buyer: buyerKeyPair.publicKey,
  seller: sellerKeyPair.publicKey,
  mint: usdcMint,
};
```

Replace `programId` with your actual program ID from Step 7.

---

## STEP 9: Deploy SmartEscrow to Devnet (5 minutes)

```bash
anchor deploy --provider.cluster devnet
```

**Expected Output:**
```
Deploying workspace: https://api.devnet.solana.com
Upgrade authority: <YOUR_WALLET>
Deploying program "smart_escrow"...
Program path: target/deploy/smart_escrow.so
Program Id: <YOUR_PROGRAM_ID>
Deploy successful!
```

**SAVE YOUR PROGRAM ID** - you'll need this for verification

---

## STEP 10: Verify Deployment (2 minutes)

```bash
# Check program account exists
solana account <YOUR_PROGRAM_ID> --url devnet

# Expected: Shows account info with executable=true
```

---

## STEP 11: Run Integration Tests (1 minute)

```bash
npm run test:all
```

**Expected Output:**
```
╔════════════════════════════════════════════════════════════╗
║  COMPLETE INTEGRATION TEST SUITE                          ║
║  SmartEscrow + Agents + Solana Testnet (REAL)            ║
╚════════════════════════════════════════════════════════════╝

PHASE 1: TESTNET DEPLOYMENT
✅ Deploy SmartEscrow.rs
✅ Deploy AgentRegistry
✅ Create test wallets
✅ Fund accounts
✅ Verify deployment

PHASE 2: INTEGRATION TESTS
✅ Autonomous negotiation
✅ Create on-chain escrow
✅ Mechanic escrow acceptance
✅ Complete milestone
✅ Verify payment release
✅ Update reputation
✅ Finalize transaction

═══════════════════════════════════════════════════════════
🎉 ALL TESTS PASSED - READY FOR PRODUCTION DEPLOYMENT
═══════════════════════════════════════════════════════════
```

---

## STEP 12: Verify on Solana Explorer (2 minutes)

Visit: https://solscan.io/?cluster=devnet

Search for your program ID to see:
- Program account
- All deployed data
- Recent transactions

---

## STEP 13: Monitor Program Logs (Optional)

```bash
solana logs <YOUR_PROGRAM_ID> --url devnet
```

This shows real-time logs from your program.

---

## If Something Goes Wrong

### "Insufficient SOL"
```bash
solana airdrop 10 <YOUR_WALLET> --url devnet
```

### "Program not found"
Verify your program ID is correct:
```bash
solana account <PROGRAM_ID> --url devnet
```

### "Build failed"
Make sure Rust is updated:
```bash
rustup update
anchor build
```

### "Deployment failed"
Check network connectivity:
```bash
curl https://api.devnet.solana.com -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
# Should return: {"jsonrpc":"2.0","result":"ok","id":1}
```

---

## Success Criteria

After completing all steps, you should have:

✅ Solana CLI installed and configured  
✅ 3 fresh wallets with test SOL  
✅ SmartEscrow.rs deployed to devnet  
✅ All 12 integration tests passing  
✅ Real transaction signatures from tests  
✅ Verified on Solana Explorer  

---

## What Happens Next

### On Devnet (Now):
- Test everything thoroughly
- Monitor transaction logs
- Verify reputation updates
- Confirm payments release correctly

### On Mainnet (April 10):
```bash
anchor deploy --provider.cluster mainnet
# (After testing is complete)
```

### Go Live (April 10+):
- Update landing page
- Launch Product Hunt
- Autonomous agents begin real commerce

---

## Timeline

| Step | Time | Status |
|------|------|--------|
| Install Solana CLI | 5 min | Do first |
| Install Rust & Anchor | 10 min | Do second |
| Create wallets | 5 min | Do third |
| Configure CLI | 2 min | Simple |
| Fund wallets | 5 min | Copy-paste |
| Build contract | 3 min | Just `anchor build` |
| Deploy | 5 min | Just `anchor deploy` |
| Run tests | 1 min | Just `npm run test:all` |
| Verify | 2 min | Just `solana account` |
| **TOTAL** | **~40 min** | **All real** |

---

## Key Files You'll Use

- `programs/smart-escrow/src/lib.rs` - The contract (read-only)
- `src/integration/integration-test.ts` - Tests (update program ID only)
- `Anchor.toml` - Config (auto-generated)
- `~/.config/solana/cli/config.yml` - CLI config (auto-generated)

---

## Support Resources

- **Solana Docs**: https://docs.solana.com
- **Anchor Docs**: https://docs.rs/anchor-lang/
- **Solana Explorer**: https://solscan.io/?cluster=devnet
- **CLI Help**: `solana --help` or `anchor --help`

---

## Security Notes

✅ **DO:**
- Keep your seed phrases safe
- Use different wallets for test/prod
- Verify addresses before sending funds
- Test on devnet first, mainnet later

❌ **DON'T:**
- Share seed phrases
- Use same wallet for mainnet & devnet
- Send large amounts to test contracts
- Skip the devnet testing phase

---

## Final Checklist Before Mainnet

- [ ] All 12 tests passed on devnet
- [ ] Reviewed SmartEscrow.rs code
- [ ] Monitored test transactions on Solana Explorer
- [ ] Verified payment releases working
- [ ] Verified reputation updates working
- [ ] No errors in logs
- [ ] Comfortable with the code

**Then and ONLY then:**
- [ ] Deploy to mainnet
- [ ] Launch Product Hunt
- [ ] Go live

---

## You're in Control

**Remember:** 
- YOU create the wallets
- YOU deploy the contract
- YOU run the tests
- YOU control all funds
- YOU verify all transactions

**No intermediary. No AI controlling your money. Just you, your code, and the blockchain.**

This is how it should be.

---

**Ready to deploy?** Follow these steps when you have your computer. You've got this. 🦬
