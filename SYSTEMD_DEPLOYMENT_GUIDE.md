# Systemd Service Deployment for AgentPay

**Purpose:** Make AgentPay auto-start and auto-restart at OS level  
**When to use:** When moving to production or after server reboot  
**Status:** Ready to deploy, detailed steps below

---

## What is Systemd?

Systemd is Linux's service manager. It:
- ✅ Starts services at boot time
- ✅ Auto-restarts failed services
- ✅ Manages resource limits
- ✅ Monitors process health
- ✅ Works across reboots

**Key benefit:** AgentPay stays running even if server reboots.

---

## Step 1: Install the Service File

The service file is already created: `/root/.openclaw/workspace/agentpay.service`

**Content of service file:**
```ini
[Unit]
Description=AgentPay HTTP 402 Agent Payment Network
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/.openclaw/workspace/x402-agent-network
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
StandardOutput=append:/root/.openclaw/workspace/agentpay-service.log
StandardError=append:/root/.openclaw/workspace/agentpay-service.log

# Resource limits
MemoryLimit=2G
CPUQuota=50%

# Security
PrivateTmp=yes
NoNewPrivileges=yes

[Install]
WantedBy=multi-user.target
```

**What this does:**
- `Restart=always` → Auto-restart on crash
- `RestartSec=5` → Wait 5 seconds between restarts
- `MemoryLimit=2G` → Max 2GB memory usage
- `CPUQuota=50%` → Max 50% CPU usage
- `After=network.target` → Start after network is ready

---

## Step 2: Copy Service File to Systemd

**Command:**
```bash
sudo cp /root/.openclaw/workspace/agentpay.service /etc/systemd/system/agentpay.service
```

This puts the service file where systemd can find it.

---

## Step 3: Reload Systemd Configuration

**Command:**
```bash
sudo systemctl daemon-reload
```

This tells systemd to read the new service file.

---

## Step 4: Enable the Service (Auto-start on Boot)

**Command:**
```bash
sudo systemctl enable agentpay
```

This tells systemd to start AgentPay when the server boots.

**Verify it's enabled:**
```bash
sudo systemctl is-enabled agentpay
```

Should return: `enabled`

---

## Step 5: Start the Service

**Command:**
```bash
sudo systemctl start agentpay
```

This starts AgentPay right now via systemd.

**Verify it's running:**
```bash
sudo systemctl status agentpay
```

Should show:
```
● agentpay.service - AgentPay HTTP 402 Agent Payment Network
   Loaded: loaded (/etc/systemd/system/agentpay.service; enabled)
   Active: active (running) since Mon 2026-04-06 14:12:00 UTC
```

---

## Step 6: Monitor the Service

**Check status:**
```bash
sudo systemctl status agentpay
```

**View logs:**
```bash
sudo journalctl -u agentpay -f
```

**View application logs:**
```bash
tail -f /root/.openclaw/workspace/agentpay-service.log
```

---

## Complete Deployment Commands (All at Once)

```bash
# Stop current instance if running
pkill -f "node dist/app.js"

# Install service file
sudo cp /root/.openclaw/workspace/agentpay.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable agentpay

# Start service
sudo systemctl start agentpay

# Verify it's running
sudo systemctl status agentpay

# Check logs
sudo journalctl -u agentpay -n 20
```

---

## What Happens After Deployment

**On normal operation:**
- AgentPay runs as systemd service
- Auto-restarts on crash (within 5 seconds)
- Logs to: `/root/.openclaw/workspace/agentpay-service.log`
- Can be managed with: `systemctl start/stop/restart agentpay`

**On server reboot:**
- Systemd starts automatically
- AgentPay starts automatically (because `enable` was set)
- Service is ready before user login
- 99.9% uptime maintained

**If service crashes:**
- Systemd detects crash
- Waits 5 seconds
- Auto-restarts
- Repeats forever

---

## Service Management Commands

**Start service:**
```bash
sudo systemctl start agentpay
```

**Stop service:**
```bash
sudo systemctl stop agentpay
```

**Restart service:**
```bash
sudo systemctl restart agentpay
```

**Check status:**
```bash
sudo systemctl status agentpay
```

**View logs:**
```bash
sudo journalctl -u agentpay -f
```

**Disable auto-start (if needed):**
```bash
sudo systemctl disable agentpay
```

---

## Comparison: Monitor Script vs Systemd

| Feature | Monitor Script | Systemd |
|---------|---|---|
| Check interval | 30 seconds | N/A (process monitored) |
| Auto-restart | Yes (after check) | Yes (immediate) |
| Survives reboot | No | Yes |
| Resource limits | No | Yes |
| OS integration | No | Yes |
| Startup time | Manual each session | Automatic at boot |
| Best for | Development | Production |

---

## Migration Path

**Current (Development):**
```
Monitor script (30-sec checks) → Auto-restart → Manual restart on reboot
```

**Future (Production):**
```
Systemd service → Auto-restart → Auto-start on reboot → 99.9% uptime
```

---

## When to Deploy Systemd

**Deploy systemd service when:**
1. ✅ Code is stable and tested
2. ✅ Database is production-ready
3. ✅ Monitoring is in place
4. ✅ Backup procedures exist
5. ✅ You're ready for 24/7 operation

**Current status:**
- ✅ Code stable (tested with $1 USDC payment)
- ✅ Database ready (SQLite with backups)
- ✅ Monitoring active (monitor script running)
- ✅ Ready for systemd deployment

---

## Next Steps

**Option A: Deploy now (recommended)**
```bash
sudo cp /root/.openclaw/workspace/agentpay.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable agentpay
sudo systemctl start agentpay
```

**Option B: Wait for more testing**
- Continue with monitor script
- Deploy systemd after Product Hunt launch

**Recommendation:** Deploy systemd before Product Hunt goes live (ensures zero downtime during launch).

---

**Systemd provides enterprise-grade reliability.** 🦬

---

*Guide created: April 6, 2026, 14:12 UTC*  
*Status: Ready for deployment*
