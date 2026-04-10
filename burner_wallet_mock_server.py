#!/usr/bin/env python3
"""
Mock x402 Server for Testing
- Simulates a real x402-protected endpoint
- Returns HTTP 402 with realistic payment terms
- NO real money involved
- Used to test the detector locally
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import uuid

def generate_mock_payment():
    """Generate a fake but realistic payment request."""
    return {
        "payment_required": {
            "amount": "0.05",
            "currency": "USDC",
            "chain": "base",
            "recipient": "0x1234567890123456789012345678901234567890",
            "description": "Premium market analysis (BTC 1h)",
            "request_id": str(uuid.uuid4()),
            "expires_at": 1743931200,
        }
    }

class MockHandler(BaseHTTPRequestHandler):
    """Return 402 Payment Required on /analyze endpoint."""
    
    def do_GET(self):
        if self.path == "/analyze":
            self.send_response(402, "Payment Required")
            self.send_header("Content-Type", "application/json")
            self.send_header("X-Payment-Required", "x402")
            self.end_headers()
            
            response = generate_mock_payment()
            self.wfile.write(json.dumps(response).encode())
            
            print(f"[Mock] Sent 402 to {self.client_address[0]}")
        else:
            self.send_response(404)
            self.end_headers()
    
    def do_POST(self):
        if self.path == "/analyze":
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()
            print(f"[Mock] Received POST: {body[:100]}")
            
            self.send_response(402, "Payment Required")
            self.send_header("Content-Type", "application/json")
            self.send_header("X-Payment-Required", "x402")
            self.end_headers()
            
            response = generate_mock_payment()
            self.wfile.write(json.dumps(response).encode())
            
            print(f"[Mock] Sent 402 to {self.client_address[0]}")
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Suppress default logging
        pass

if __name__ == "__main__":
    server = HTTPServer(("localhost", 8765), MockHandler)
    
    print("\n" + "="*70)
    print("🟢 Mock x402 Server running on http://localhost:8765")
    print("="*70)
    print("\nEndpoints:")
    print("  GET/POST http://localhost:8765/analyze → Returns HTTP 402")
    print("\nKeep this running in a separate terminal")
    print("Press Ctrl+C to stop\n")
    print("="*70 + "\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Mock] Shutting down...")
        server.shutdown()
