#!/usr/bin/env python3
"""
Mock x402 Server — Simulates a real x402-protected endpoint.
Returns HTTP 402 with valid x402 payment terms (no real money required).

Run with: python mock_x402_server.py
Then hit: curl -v http://localhost:8765/analyze
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import uuid
from decimal import Decimal

# Mock payment request (what a real x402 endpoint returns on 402)
def generate_402_response():
    """Generate a realistic x402 Payment Required response."""
    return {
        "payment_required": {
            "amount": "0.05",  # 5 cents USDC
            "currency": "USDC",
            "chain": "base",
            "recipient": "0xabcdef1234567890abcdef1234567890abcdef12",  # Mock address
            "description": "Premium market analysis (BTC/1h)",
            "expires_at": 1743931200,  # April 4, 2026
            "request_id": str(uuid.uuid4()),
        }
    }

class X402MockHandler(BaseHTTPRequestHandler):
    """HTTP handler that returns 402 on /analyze endpoint."""
    
    def do_GET(self):
        """Handle GET requests — return 402 on /analyze."""
        if self.path == "/analyze":
            # Return HTTP 402 with x402 payment terms
            self.send_response(402, "Payment Required")
            self.send_header("Content-Type", "application/json")
            self.send_header("X-Payment-Required", "x402")
            self.end_headers()
            
            response = generate_402_response()
            self.wfile.write(json.dumps(response).encode())
            
            print(f"[Mock Server] Sent 402 response to {self.client_address[0]}")
            print(f"[Mock Server] Payment request: {json.dumps(response, indent=2)}")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
    
    def do_POST(self):
        """Handle POST requests — return 402 on /analyze."""
        if self.path == "/analyze":
            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length).decode()
            print(f"[Mock Server] Received POST body: {body}")
            
            # Return 402 with x402 payment terms
            self.send_response(402, "Payment Required")
            self.send_header("Content-Type", "application/json")
            self.send_header("X-Payment-Required", "x402")
            self.end_headers()
            
            response = generate_402_response()
            self.wfile.write(json.dumps(response).encode())
            
            print(f"[Mock Server] Sent 402 response to {self.client_address[0]}")
            print(f"[Mock Server] Payment request: {json.dumps(response, indent=2)}")
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b"Not found")
    
    def log_message(self, format, *args):
        """Suppress default logging; we log custom messages instead."""
        pass

def run_mock_server(port=8765):
    """Start the mock x402 server."""
    server = HTTPServer(("localhost", port), X402MockHandler)
    print(f"\n{'='*70}")
    print(f"🟢 Mock x402 Server running on http://localhost:{port}")
    print(f"{'='*70}")
    print(f"\nEndpoints:")
    print(f"  GET/POST http://localhost:{port}/analyze → Returns HTTP 402")
    print(f"\nTest with curl:")
    print(f"  curl -v http://localhost:{port}/analyze")
    print(f"  curl -v -X POST -H 'Content-Type: application/json' \\")
    print(f"       -d '{{\"ticker\":\"BTC\"}}' http://localhost:{port}/analyze")
    print(f"\nPress Ctrl+C to stop.\n")
    print(f"{'='*70}\n")
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[Mock Server] Shutting down...")
        server.shutdown()

if __name__ == "__main__":
    run_mock_server()
