#!/usr/bin/env python3
"""
x402 Payment Detector PoC
- Hits an x402-protected endpoint
- Detects HTTP 402 response
- Parses payment terms clearly
- STOPS before signing (human approval required)

No wallet, no keys, no execution. Just detection + preview.

Run with: python x402_detector_poc.py --url http://localhost:8765/analyze
"""

import httpx
import json
import argparse
from decimal import Decimal
from typing import Optional, Dict, Any

class PaymentPreview:
    """Parse and display x402 payment terms safely (no execution)."""
    
    @staticmethod
    def parse_402_response(response: httpx.Response) -> Optional[Dict[str, Any]]:
        """Extract payment request from HTTP 402 response."""
        if response.status_code != 402:
            return None
        
        try:
            data = response.json()
            # Handle both direct payment_required and nested structures
            if "payment_required" in data:
                return data["payment_required"]
            return data
        except Exception as e:
            print(f"⚠️  Error parsing 402 response: {e}")
            return None
    
    @staticmethod
    def format_payment_preview(payment_req: Dict[str, Any]) -> str:
        """Format payment details for human review."""
        output = []
        output.append("\n" + "="*70)
        output.append("🔍 PAYMENT PREVIEW — HUMAN APPROVAL REQUIRED")
        output.append("="*70)
        
        # Core payment details
        amount = payment_req.get("amount", "unknown")
        currency = payment_req.get("currency", "unknown")
        chain = payment_req.get("chain", "unknown")
        recipient = payment_req.get("recipient", "unknown")
        description = payment_req.get("description", "no description")
        request_id = payment_req.get("request_id", "unknown")
        
        output.append(f"\n💰 AMOUNT:       {amount} {currency}")
        output.append(f"🔗 CHAIN:        {chain}")
        output.append(f"📬 RECIPIENT:    {recipient}")
        output.append(f"📝 DESCRIPTION:  {description}")
        output.append(f"🆔 REQUEST ID:   {request_id}")
        
        expires_at = payment_req.get("expires_at")
        if expires_at:
            output.append(f"⏰ EXPIRES AT:   {expires_at}")
        
        output.append("\n" + "="*70)
        output.append("✋ HUMAN APPROVAL REQUIRED")
        output.append("="*70)
        output.append("\nTO APPROVE THIS PAYMENT:")
        output.append(f"1. Open https://wallet.coinbase.com or your wallet app")
        output.append(f"2. Ensure you're on {chain} network")
        output.append(f"3. Send {amount} {currency} to {recipient}")
        output.append(f"4. Include request ID in memo/note: {request_id}")
        output.append(f"5. Broadcast transaction")
        output.append("\nTO REJECT:")
        output.append("   Close this script (Ctrl+C) — no payment will be sent.")
        output.append("\n" + "="*70 + "\n")
        
        return "\n".join(output)

async def detect_payment_required(url: str, method: str = "GET", json_data: Optional[Dict] = None):
    """Hit endpoint, detect 402, show preview, stop."""
    print(f"\n📡 Testing endpoint: {url}")
    print(f"📋 Method: {method}")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            if method.upper() == "POST":
                response = await client.post(url, json=json_data or {})
            else:
                response = await client.get(url)
            
            # Check for 402
            if response.status_code == 402:
                print(f"✅ HTTP 402 detected!")
                
                # Parse payment terms
                payment_req = PaymentPreview.parse_402_response(response)
                if payment_req:
                    # Display preview
                    preview = PaymentPreview.format_payment_preview(payment_req)
                    print(preview)
                    
                    # STOP HERE — no execution
                    print("🛑 STOPPING: Awaiting human approval.")
                    print("   No payment executed. No wallet accessed.")
                    print("   No keys required. No transaction broadcast.")
                    return
                else:
                    print("⚠️  Could not parse payment request")
            else:
                print(f"ℹ️  Endpoint returned {response.status_code} (not 402)")
                print(f"Response: {response.text[:200]}")
    
    except httpx.ConnectError:
        print(f"❌ Connection failed. Is the mock server running?")
        print(f"   Start it with: python mock_x402_server.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    """CLI for detector."""
    parser = argparse.ArgumentParser(
        description="x402 Payment Detector — Preview payments before execution"
    )
    parser.add_argument(
        "--url",
        default="http://localhost:8765/analyze",
        help="Endpoint to test (default: mock server)"
    )
    parser.add_argument(
        "--method",
        default="GET",
        choices=["GET", "POST"],
        help="HTTP method (default: GET)"
    )
    parser.add_argument(
        "--json",
        type=json.loads,
        help="JSON body for POST (e.g., '{\"ticker\": \"BTC\"}')"
    )
    
    args = parser.parse_args()
    
    import asyncio
    asyncio.run(detect_payment_required(args.url, args.method, args.json))

if __name__ == "__main__":
    main()
