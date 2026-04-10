#!/usr/bin/env python3
"""
Burner Wallet x402 Detector — Preview-Only Mode
- No private keys
- No auto-signing
- No wallet access
- Just shows you what payment is needed
- You approve manually in Coinbase Wallet app

Run: python burner_wallet_detector.py
"""

import httpx
import json
import asyncio
from typing import Optional, Dict, Any

class PaymentPreviewOnly:
    """Show payment preview. Stop. Wait for human approval."""
    
    @staticmethod
    def parse_402(response: httpx.Response) -> Optional[Dict[str, Any]]:
        """Extract payment request from 402 response."""
        if response.status_code != 402:
            return None
        try:
            data = response.json()
            if "payment_required" in data:
                return data["payment_required"]
            return data
        except Exception as e:
            print(f"Error parsing: {e}")
            return None
    
    @staticmethod
    def show_preview(payment: Dict[str, Any]):
        """Print the payment in a format you can copy-paste into Coinbase Wallet."""
        
        print("\n" + "="*70)
        print("🛑 PAYMENT PREVIEW — MANUAL APPROVAL REQUIRED")
        print("="*70)
        
        amount = payment.get("amount", "?")
        currency = payment.get("currency", "?")
        chain = payment.get("chain", "?")
        recipient = payment.get("recipient", "?")
        description = payment.get("description", "?")
        request_id = payment.get("request_id", "?")
        
        print(f"\n💰 AMOUNT TO SEND:   {amount} {currency}")
        print(f"🔗 NETWORK:          {chain}")
        print(f"📬 SEND TO:          {recipient}")
        print(f"📝 DESCRIPTION:      {description}")
        print(f"🆔 REQUEST ID:       {request_id}")
        
        print("\n" + "="*70)
        print("📱 MANUAL APPROVAL STEPS")
        print("="*70)
        
        print(f"""
1. Open Coinbase Wallet app on your phone
2. Make sure you're on the {chain} network
3. Click "Send"
4. Enter recipient: {recipient}
5. Enter amount: {amount} {currency}
6. In the memo/note field, paste: {request_id}
7. Review the details match above
8. Click "Send" and confirm
9. Wait for transaction to complete
10. Come back here and paste the transaction hash

EXAMPLE transaction hash: 0xabc123def456...

Do NOT approve if anything looks wrong!
""")
        
        print("="*70)
        print("⏳ WAITING FOR YOUR MANUAL APPROVAL...")
        print("="*70)
        
        # Wait for user to paste tx hash
        tx_hash = input("\n✋ Paste transaction hash here (or press Ctrl+C to cancel): ").strip()
        
        if tx_hash:
            print(f"\n✅ Transaction hash recorded: {tx_hash}")
            print("✅ Payment confirmed externally")
            return tx_hash
        else:
            print("\n❌ No transaction hash provided. Payment not confirmed.")
            return None

async def detect_and_preview(url: str = "http://localhost:8765/analyze"):
    """
    Hit endpoint → Detect 402 → Show preview → Wait for manual approval
    """
    print(f"\n📡 Connecting to: {url}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            
            if response.status_code == 402:
                print("✅ HTTP 402 Payment Required detected!")
                
                payment = PaymentPreviewOnly.parse_402(response)
                if payment:
                    tx_hash = PaymentPreviewOnly.show_preview(payment)
                    if tx_hash:
                        print("\n✅ Ready to proceed with the actual request")
                        print(f"   Transaction: {tx_hash}")
                        # Here's where real code would use the tx_hash
                        # to prove payment and make the actual request
                    return
                else:
                    print("❌ Could not parse payment request")
            else:
                print(f"ℹ️  Got {response.status_code} (not 402)")
    
    except httpx.ConnectError:
        print("\n❌ Connection failed!")
        print("   Make sure the mock server is running:")
        print("   python burner_wallet_mock_server.py")
    except KeyboardInterrupt:
        print("\n\n❌ Cancelled by user")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(detect_and_preview())
