# Contabo VPS Migration Plan
**Date:** April 17, 2026
**Status:** Ready to migrate

---

## NEW SERVER DETAILS

**Provider:** Contabo
**Server Type:** Cloud VPS 30 SSD (no setup)
**Location:** Seattle (US-west)
**Customer ID:** 14873418
**Order ID:** 14873554

### Access Information
- **IPv4:** 85.239.236.56
- **IPv6 Subnet:** 2605:a141:2323:8865:0000:0000:0000:0001/64
- **Username:** root
- **Access Method:** SSH (Linux) / VNC (backup)
- **Password:** [As chosen during order process]

---

## MIGRATION CHECKLIST

### Step 1: Prepare Current System (Before Migration)
- [ ] Create backup of `/root/.openclaw/workspace/`
- [ ] Export all GitHub commits (local copy)
- [ ] Document current running processes:
  - [ ] Grid Trading Bot (PID, config)
  - [ ] AgentPay Server (port 3001)
  - [ ] OpenClaw runtime config
- [ ] Export Telegram bot tokens/credentials
- [ ] Export environment variables (.env files)

### Step 2: Set Up New Contabo Server
- [ ] SSH into 85.239.236.56 as root
- [ ] Run system updates: `apt update && apt upgrade -y`
- [ ] Install dependencies:
  - [ ] Node.js 22+
  - [ ] Python 3.10+
  - [ ] Git
  - [ ] Docker (optional)
  - [ ] PM2 or systemd for process management

### Step 3: Restore Code & Configuration
- [ ] Clone repositories from GitHub:
  ```bash
  git clone https://github.com/shawnhvac/-x402-agent-network.git
  cd x402-agent-network
  npm install
  npm start
  ```
- [ ] Copy OpenClaw workspace files
- [ ] Restore .env files with credentials
- [ ] Verify file permissions

### Step 4: Restore & Test Services
- [ ] **AgentPay Server:**
  - [ ] `npm start` in x402-agent-network directory
  - [ ] Test: `curl http://localhost:3001/health`
  - [ ] Should return: `{"status":"healthy","database":"ready"}`

- [ ] **Grid Trading Bot:**
  - [ ] Start bot: `python3 grid-trading-live.py`
  - [ ] Verify: `ps aux | grep grid-trading-live.py`
  - [ ] Check logs: `tail -20 grid-trading-live.log`

- [ ] **Telegram Integration:**
  - [ ] Verify bot responds in Telegram
  - [ ] Test command execution
  - [ ] Confirm messages being logged

### Step 5: Verify Nothing Broke
- [ ] Website loads: `curl https://www.x402-agent-pay.com/`
- [ ] Marketplace API responds
- [ ] Trading bot is placing orders
- [ ] Telegram is connected and responding
- [ ] All three critical systems healthy

### Step 6: Update DNS (If Needed)
- [ ] Update A record if domain points to old IP
- [ ] Old IP: [Current IP]
- [ ] New IP: 85.239.236.56

### Step 7: Decommission Old Server
- [ ] After 24h verification (everything working)
- [ ] Backup old server one final time
- [ ] Cancel old server subscription

---

## CRITICAL SYSTEMS TO VERIFY

### 1. AgentPay Server (Port 3001)
```bash
curl -s http://localhost:3001/health | grep healthy
```
Must return: `{"status":"healthy","database":"ready"}`

### 2. Grid Trading Bot
```bash
ps aux | grep grid-trading-live.py | grep -v grep
tail -5 grid-trading-live.log
```
Should show: Running with recent timestamps (< 5 min old)

### 3. Telegram Bot
- Send test message in Telegram
- Bot should respond immediately
- Check that messages are being logged

### 4. Website (x402-agent-pay.com)
```bash
curl -s https://www.x402-agent-pay.com/ | grep "Complete AI Agent Commerce"
```

---

## GIT & GITHUB (NO CHANGES)
✅ All repos stay on GitHub
✅ GitHub Actions continues building APK
✅ No migration to Gitlawb yet
✅ OpenClaw just moves hosting, code stays central

---

## TIMELINE

**Phase 1: Preparation** (30 min)
- Backup current system
- Document all running services

**Phase 2: Setup New Server** (1-2 hours)
- SSH into Contabo
- Install dependencies
- Clone code from GitHub

**Phase 3: Restore & Test** (1 hour)
- Start all services
- Verify each one works
- Test Telegram integration

**Phase 4: Verification** (30 min)
- Run heartbeat checks
- Test website
- Test trading bot orders
- Confirm everything operational

**Phase 5: Cleanup** (after 24h)
- Cancel old server
- Update documentation

**Total Estimated Time:** 4-5 hours (mostly waiting for installs)

---

## ROLLBACK PLAN (If Something Breaks)

**If AgentPay Server fails:**
- SSH to new server
- Check logs: `cat /tmp/agentpay.log`
- Restart: `pkill -f "node dist/app.js"` then `npm start`

**If Grid Trading Bot fails:**
- Restart: `python3 grid-trading-live.py`
- Check: `tail -20 grid-trading-live.log`

**If everything breaks:**
- Revert DNS to old IP (if changed)
- Keep running on old server until fixed
- No data loss (GitHub has all code)

---

## NOTES

- IPv6 is preconfigured (may not need IPv4 only)
- VNC available as backup if SSH fails (not recommended for security)
- $12/mo much cheaper than current $400/mo
- No single point of failure once OpenClaw connects to Gitlawb (later)

---

## WHAT SHAWN DOES

1. Send SSH password securely
2. I handle the migration steps
3. I test everything works
4. We verify Telegram + marketplace + bot all functioning
5. After 24h confirmation, we decommission old server

---

**Status:** Ready to proceed
**Next:** Shawn sends SSH password when ready to start migration
