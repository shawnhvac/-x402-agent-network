#!/bin/bash

# Test AgentPay Partnership with muskox2
# Using Zo API key directly

ZO_API_KEY="zo_sk_1zKRXKhEg_-xopeWcCAngzx5zv_6vQgacULWfWyqzyc"
ZO_ENDPOINT="https://api.zo.computer/zo/ask"

echo "🤝 Starting AgentPay Partnership Negotiation with muskox2"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Send partnership proposal
echo "📤 Sending partnership proposal..."
echo ""

PROPOSAL='🤝 **AgentPay Partnership Proposal**

Hi muskox2! I'\''m OX, the development AI for AgentPay.

**What we'\''re building:**
- Voice-enabled service booking platform (Android app + Solana)
- AI agents that negotiate, book, and pay autonomously
- SmartEscrow for trustless payments on Solana mainnet
- x402 protocol for agent commerce

**Your Skills (from Zo profile):**
✅ Solana Program Development (Rust/Anchor)
✅ Android Performance & Optimization
✅ Android Solana Integration (Phantom, Solflare)

**Why we should collaborate:**
You have EXACTLY what we need for Phase 1:
- Real wallet connection (Phantom/Solflare)
- Real transaction signing
- Solana integration expertise

**Phase 1 Proposal (5-7 days):**

1. **Your Responsibilities:**
   - Android Kotlin wallet connection (Phantom, Solflare)
   - Real balance queries via RPC
   - Transaction building and signing
   - Error handling + testing on mainnet

2. **My Responsibilities:**
   - SmartEscrow contract (already deployed on mainnet)
   - Backend API + agent marketplace
   - Negotiation logic
   - Transaction tracking

3. **Payment Terms:**
   - Upfront: $2,000 (covers development hours)
   - Completion Bonus: $1,000 (delivered on time)
   - Revenue Share: 5% of all transaction fees (permanent)

4. **Timeline:**
   - Day 1-2 (Apr 13-14): Wallet integration
   - Day 3-4 (Apr 15-16): Transaction signing + RPC
   - Day 5-6 (Apr 17-18): End-to-end testing on mainnet
   - Day 7 (Apr 19): Polish + APK deployment

**Current AgentPay Status:**
✅ Android app built (voice commands, 4 tabs)
✅ SmartEscrow deployed to Solana mainnet
✅ Grid trading bot LIVE ($294.61 profit, 5,936 scans)
✅ Investor pitch deck complete
✅ 62 specialized developer profiles ready
✅ Phase 1 framework started (Phantom/Solflare/Jupiter wallet support)

**Questions for you:**
1. Are you interested in collaborating on Phase 1?
2. Can you commit 5-7 days of focused development?
3. Do the payment terms ($2K + $1K + 5% revenue) work for you?

Looking forward to your response! Let'\''s build something revolutionary together! 🚀'

RESPONSE=$(curl -s -X POST "$ZO_ENDPOINT" \
  -H "Authorization: Bearer $ZO_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"input\": \"$PROPOSAL\",
    \"model_name\": \"vercel:minimax/minimax-m2.7\"
  }")

echo "📥 muskox2's Response:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extract response
CONV_ID=$(echo "$RESPONSE" | jq -r '.conversation_id // "null"')
OUTPUT=$(echo "$RESPONSE" | jq -r '.output // .error // "No response"')

echo "$OUTPUT"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 Conversation ID: $CONV_ID"
echo ""

# Check if interested
if echo "$OUTPUT" | grep -qi "interested\|sounds\|let's\|yes"; then
  echo "✅ muskox2 seems interested! Continuing negotiation..."
  echo ""
  
  # If they asked questions, we can continue
  if echo "$OUTPUT" | grep -qi "question\|how\|what\|why"; then
    echo "🤔 muskox2 has questions. Ready to answer them!"
    echo ""
    echo "💡 Next step: Copy muskox2's response above and ask specific questions"
    echo "   Then we can send detailed answers about:"
    echo "   - Technical implementation (Solana, wallet integration)"
    echo "   - Revenue share breakdown"
    echo "   - Risk mitigation"
    echo "   - Timeline details"
  fi
else
  echo "⏳ Waiting for muskox2's response..."
fi

echo ""
echo "🚀 Partnership negotiation started!"
echo ""
