# GitHub Deployment Setup - APK Auto-Build & Upload
**Status:** Ready to Configure  
**Target Server:** Contabo (85.239.236.56)  
**Created:** April 21, 2026

---

## 🎯 OVERVIEW

This workflow automatically:
1. ✅ Builds 3 APK variants (Agent, Marketplace, Provider)
2. ✅ Signs APKs with production key
3. ✅ Optimizes with zipalign
4. ✅ Uploads to your server via SCP
5. ✅ Creates GitHub releases
6. ✅ Notifies Slack on completion

---

## 📋 PREREQUISITES

### 1. GitHub Secrets Configuration

Go to: **GitHub Repo → Settings → Secrets and variables → Actions**

Add these secrets:

```
KEYSTORE_FILE          = Base64-encoded Android keystore file
KEYSTORE_PASSWORD      = Your keystore password
KEY_ALIAS              = Your key alias (e.g., "agentpay")
KEY_PASSWORD           = Your key password

DEPLOY_KEY             = Base64-encoded SSH private key
DEPLOY_HOST            = 85.239.236.56
DEPLOY_USER            = root
DEPLOY_PATH            = /root/.openclaw/workspace/x402-agent-network/public/download

SLACK_WEBHOOK          = Your Slack webhook URL (optional)
```

### 2. Generate Android Keystore

```bash
# Generate signing key (run once)
keytool -genkey -v -keystore agentpay-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias agentpay \
  -storepass your_keystore_password \
  -keypass your_key_password

# Encode to base64 for GitHub secret
base64 -i agentpay-release.keystore | tr -d '\n'
```

### 3. Generate SSH Deploy Key

```bash
# Generate SSH key for GitHub Actions to deploy
ssh-keygen -t rsa -b 4096 -f github-deploy-key -N ""

# Encode private key
base64 -i github-deploy-key | tr -d '\n'
```

Add public key to server:
```bash
cat github-deploy-key.pub >> ~/.ssh/authorized_keys
```

---

## 🔐 GITHUB SECRETS SETUP GUIDE

### Step 1: Create Keystore Secret

```bash
# 1. Generate keystore (if not already done)
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias agentpay

# 2. Encode to base64
base64 release.keystore > keystore-base64.txt

# 3. Copy output and paste into GitHub Secret: KEYSTORE_FILE
```

### Step 2: Create Deploy Key Secret

```bash
# 1. Generate SSH key
ssh-keygen -t rsa -b 4096 -f /tmp/github-deploy

# 2. Add public key to server
ssh root@85.239.236.56
cat >> ~/.ssh/authorized_keys << 'EOF'
[paste content of github-deploy.pub]
EOF

# 3. Encode private key
base64 /tmp/github-deploy > deploy-key-base64.txt

# 4. Copy output and paste into GitHub Secret: DEPLOY_KEY
```

### Step 3: Set Other Secrets

In GitHub Settings → Secrets:

| Secret | Value | Example |
|--------|-------|---------|
| KEYSTORE_PASSWORD | Your keystore password | `MyKeystorePass123!` |
| KEY_ALIAS | Key alias | `agentpay` |
| KEY_PASSWORD | Key password | `MyKeyPass123!` |
| DEPLOY_HOST | Server IP | `85.239.236.56` |
| DEPLOY_USER | SSH user | `root` |
| DEPLOY_PATH | APK upload path | `/root/.openclaw/workspace/x402-agent-network/public/download` |

---

## 🚀 HOW IT WORKS

### Trigger

Workflow runs automatically on:
- ✅ Push to `main` branch
- ✅ Manual trigger via GitHub Actions

### Build Process

```
1. Checkout code
   ↓
2. Setup Android SDK & JDK 17
   ↓
3. Build 3 APK variants:
   - Agent APK (for AI agents)
   - Marketplace APK (for customers)
   - Provider APK (for businesses)
   ↓
4. Sign APKs with production key
   ↓
5. Optimize with zipalign
   ↓
6. Generate build metadata
   ↓
7. Upload to server via SCP
   ↓
8. Create GitHub release
   ↓
9. Notify Slack (optional)
```

### Upload Destination

APKs are uploaded to your server:
```
/root/.openclaw/workspace/x402-agent-network/public/download/

├── agentpay-latest.apk           (Agent version)
├── agentpay-marketplace-latest.apk (Marketplace version)
├── agentpay-provider-latest.apk  (Provider version)
└── build-info.json               (Metadata)
```

Accessible at:
```
https://x402-agent-pay.com/download/agentpay-latest.apk
https://x402-agent-pay.com/download/agentpay-marketplace-latest.apk
https://x402-agent-pay.com/download/agentpay-provider-latest.apk
```

---

## 📊 BUILD VARIANTS

### 1. **Agent APK** (`agentpay-latest.apk`)
- For AI agents to book services
- Features: Service search, booking, payment
- Size: ~35-40 MB

### 2. **Marketplace APK** (`agentpay-marketplace-latest.apk`)
- For end customers to discover & book
- Features: Browse, rate, book services
- Size: ~35-40 MB

### 3. **Provider APK** (`agentpay-provider-latest.apk`)
- For businesses to manage services & bookings
- Features: Register, service management, analytics
- Size: ~30-35 MB

---

## 🔄 CONTINUOUS DEPLOYMENT

Every commit to `main` triggers:

1. **Build** - Compiles 3 APK variants
2. **Sign** - Cryptographically signs with production key
3. **Optimize** - Zipaligns for Play Store compatibility
4. **Deploy** - Uploads to your server via SCP
5. **Release** - Creates GitHub release with assets
6. **Notify** - Sends Slack notification

**Result:** Users always get latest APK from your website

---

## 📥 GITHUB RELEASES

Each build creates a GitHub release:

**Release Format:**
```
Tag: v1, v2, v3, ...
Title: Build 1, Build 2, Build 3, ...

Includes:
✅ agentpay-agent-aligned.apk
✅ agentpay-marketplace-aligned.apk
✅ agentpay-provider-aligned.apk
✅ build-info.json (metadata)
```

**Download from:** https://github.com/shawnhvac/-x402-agent-network/releases

---

## 🛠️ TROUBLESHOOTING

### Issue: Build fails with keystore error
**Solution:** Verify base64 encoding of keystore
```bash
# Re-encode with exact format
base64 -b0 release.keystore | head -c 500
# Copy entire output to GitHub secret
```

### Issue: SCP upload fails
**Solution:** Verify SSH key permissions
```bash
ssh root@85.239.236.56
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
ls -la ~/.ssh/
```

### Issue: APK signing fails
**Solution:** Verify password is correct
- Check keystore exists
- Verify passwords match (KEYSTORE_PASSWORD, KEY_PASSWORD)
- Test signing locally: 
```bash
jarsigner -verify -verbose agentpay-agent-aligned.apk
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] GitHub secrets configured (8 total)
- [ ] Keystore generated and encoded
- [ ] SSH deploy key generated and added to server
- [ ] Workflow file created (`.github/workflows/build-and-deploy.yml`)
- [ ] Test build triggered manually
- [ ] APKs uploaded to server successfully
- [ ] APKs downloadable from website
- [ ] GitHub releases created
- [ ] Slack notifications working (optional)

---

## 🎯 NEXT STEPS

1. **Generate Keys** (if not already done)
   ```bash
   # Keystore
   keytool -genkey -v -keystore release.keystore \
     -keyalg RSA -keysize 2048 -validity 10000 \
     -alias agentpay
   
   # SSH Key
   ssh-keygen -t rsa -b 4096 -f github-deploy
   ```

2. **Add GitHub Secrets** (8 total, see table above)

3. **Add SSH Key to Server**
   ```bash
   ssh root@85.239.236.56
   cat >> ~/.ssh/authorized_keys << 'EOF'
   [paste github-deploy.pub content]
   EOF
   ```

4. **Test Build**
   - Go to GitHub Actions
   - Click "Build & Deploy APKs"
   - Click "Run workflow"
   - Monitor build progress

5. **Verify Deployment**
   - Check server: `ls /root/.openclaw/workspace/x402-agent-network/public/download/`
   - Test download: `https://x402-agent-pay.com/download/agentpay-latest.apk`
   - Check GitHub releases

---

## 📞 SUPPORT

**If workflow fails:**
1. Check GitHub Actions logs
2. Verify all secrets are set
3. Verify SSH key has server access
4. Verify keystore passwords are correct

**Manual fallback:**
```bash
# SSH to server and build manually
ssh root@85.239.236.56
cd /root/.openclaw/workspace/x402-agent-network
./gradlew assembleRelease --stacktrace
```

---

**Status:** Ready to configure. Follow the prerequisites steps above, then test!

