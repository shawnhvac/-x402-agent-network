# Burner Wallet x402 Detector — Windows Setup

**IMPORTANT: This is preview-only. No wallet keys. No auto-signing. You manually approve payments.**

---

## **Files You Need**

Copy these 3 files to a folder (e.g., `C:\x402-poc`):

1. `burner_wallet_detector.py` — Shows payment preview
2. `burner_wallet_mock_server.py` — Simulates x402 endpoint
3. `setup.bat` — Installs dependencies

---

## **Setup (One Time)**

### **Step 1: Download the files**

From your OpenClaw workspace, download or copy:
- `burner_wallet_detector.py`
- `burner_wallet_mock_server.py`  
- `setup.bat`

Save all 3 to a folder like `C:\x402-poc`

### **Step 2: Run setup.bat**

- Navigate to `C:\x402-poc` in File Explorer
- Double-click `setup.bat`
- Wait for it to finish (will say "Installation complete!")

**If you get an error about "pip not found":**
- Go back and make sure Python is installed with "Add Python to PATH" checked
- Restart your computer after installing Python
- Try again

---

## **Running the Test (Every Time)**

### **Open TWO PowerShell windows side-by-side**

**Window 1: Mock Server**
```powershell
cd C:\x402-poc
python burner_wallet_mock_server.py
```

You should see:
```
======================================================================
🟢 Mock x402 Server running on http://localhost:8765
======================================================================
```

**Leave this running.**

---

**Window 2: Detector**
```powershell
cd C:\x402-poc
python burner_wallet_detector.py
```

You should see:
```
📡 Connecting to: http://localhost:8765/analyze
✅ HTTP 402 Payment Required detected!

======================================================================
🛑 PAYMENT PREVIEW — MANUAL APPROVAL REQUIRED
======================================================================

💰 AMOUNT TO SEND:   0.05 USDC
🔗 NETWORK:          base
📬 SEND TO:          0x1234567890123456789012345678901234567890
📝 DESCRIPTION:      Premium market analysis (BTC 1h)
🆔 REQUEST ID:       <some-uuid>

======================================================================
📱 MANUAL APPROVAL STEPS
======================================================================

1. Open Coinbase Wallet app on your phone
2. Make sure you're on the base network
...
[continues with manual instructions]

========================================================================
⏳ WAITING FOR YOUR MANUAL APPROVAL...
========================================================================

✋ Paste transaction hash here (or press Ctrl+C to cancel):
```

**This is where you:**
1. Open Coinbase Wallet on your phone
2. Send the amount to the address shown
3. Paste the transaction hash back into PowerShell

---

## **Testing with Mock Server (Safe)**

When you first run this, use the **mock server** (Window 1 above).

**The mock server:**
- ✅ Returns fake payment requests
- ✅ NO real money involved
- ✅ Perfect for testing

Just type a fake tx hash in Window 2:
```
0xabc123def456abc123def456abc123def456abc123def456abc123def456abc
```

Then press Enter. You'll see `✅ Payment confirmed externally`

---

## **When Ready: Real x402 Endpoint**

Once you're comfortable, we can point the detector at a **real x402-protected endpoint** instead of the mock.

Change this line in `burner_wallet_detector.py`:
```python
asyncio.run(detect_and_preview("http://localhost:8765/analyze"))
```

To:
```python
asyncio.run(detect_and_preview("https://real-x402-endpoint.com/api"))
```

Then you'll see **real** payment requests. You still review them manually before paying.

---

## **Your Burner Wallet**

Keep a small amount in your Coinbase Wallet app (like $10 USDC on Base):
- Only for testing real x402 endpoints
- Never put in large amounts
- It's a throwaway wallet for experimentation

---

## **Troubleshooting**

**"Module httpx not found"**
- Run: `pip install httpx`
- Try again

**"Connection refused" in Window 2**
- Make sure Window 1 (mock server) is running
- Ctrl+C in Window 1 and restart it

**Python command not found**
- Make sure Python is in your PATH
- Reinstall Python and check "Add Python to PATH"
- Restart PowerShell after installing

**Can't find the files**
- Make sure all 3 .py files are in the same folder
- Use full paths: `python C:\x402-poc\burner_wallet_detector.py`

---

## **What's Happening (No Magic)**

1. **Detector connects** to the mock server (or real endpoint)
2. **Server responds** with HTTP 402 + payment terms
3. **Detector parses** the response and shows you clearly:
   - How much to send
   - Where to send it
   - What network
   - What memo to include
4. **You manually approve** in Coinbase Wallet app on your phone
5. **You paste the tx hash** back into the detector
6. **Detector records** the confirmation and says you're good to go

**Zero automation. Zero keys. Zero risk.**

---

## **Next Steps**

1. Try with the mock server first (to learn the flow)
2. When comfortable, we can test with a real x402 endpoint
3. Let me know if you hit any errors — I'll help debug

Let me know when you're ready! 🦬
