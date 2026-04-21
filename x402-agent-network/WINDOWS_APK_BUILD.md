# Build AgentPay APK on Windows
## Quick Start (15 minutes)

## Step 1: Download Android Studio (Free)

1. Go to: https://developer.android.com/studio
2. Click "Download Android Studio"
3. Run installer, follow prompts
4. Choose "Standard Installation"

**Time: ~5 minutes**

---

## Step 2: Clone the Repository

1. Open Command Prompt (Win + R, type `cmd`)

2. Clone repo:
```bash
git clone https://github.com/shawnhvac/-x402-agent-network.git
cd x402-agent-network
```

**Time: ~2 minutes**

---

## Step 3: Open in Android Studio

1. Launch Android Studio
2. Click "Open an existing project"
3. Navigate to `x402-agent-network` folder
4. Click "Open"
5. Wait for Gradle sync (bottom right progress bar)

**Time: ~5 minutes (first time, includes SDK download)**

---

## Step 4: Build APK

**Option A: Debug APK (for testing on your phone)**

1. In Android Studio menu: `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Wait for build to complete (bottom right corner shows status)
3. When done: `Build` → `Locate in Project Manager`
4. APK location: `android/build/outputs/apk/debug/android-debug.apk`

**Option B: Release APK (for Google Play)**

1. `Build` → `Generate Signed Bundle/APK`
2. Create new keystore (save in safe place!)
3. Fill in password and key details
4. Select "APK"
5. Select "release"
6. Click "Finish"
7. APK location: `android/build/outputs/apk/release/android-release.apk`

**Time: ~3 minutes**

---

## Step 5: Install on Phone

### Using ADB (Android Debug Bridge)

1. Connect phone via USB cable
2. Enable "USB Debugging" on phone:
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Settings → Developer Options
   - Enable "USB Debugging"

3. In Android Studio, `Build` → `Locate in Project Manager` shows APK
4. Right-click APK → Open in Terminal
5. Run:
```bash
adb install android-debug.apk
```

### Or Just Open File Directly

1. Copy APK file to phone (via USB or email)
2. Open file manager on phone
3. Tap the APK file
4. Tap "Install"

---

## Step 6: Test App

1. Open AgentPay on phone
2. App generates Solana wallet automatically
3. Shows wallet address for receiving USDC
4. You can register as personal or business agent

---

## Having Issues?

### Android SDK not installed?
- Android Studio will prompt you on first load
- Click "Install SDK" and wait

### Gradle sync failed?
- Click "File" → "Sync Now"
- Or restart Android Studio

### Can't find APK?
- In Android Studio: `Build` → `Analyze APK`
- This opens the build output folder

### Phone won't recognize APK?
- Phone must have "Install from unknown sources" enabled
- Settings → Security → Allow installation from unknown sources

---

## Upload to Website

Once APK is built:

1. Rename: `android-debug.apk` → `agentpay-latest.apk`
2. Copy to: `x402-agent-network/public/apk/agentpay-latest.apk`
3. Commit and push:
```bash
git add public/apk/agentpay-latest.apk
git commit -m "Add: AgentPay APK release"
git push
```

4. Download button on website now works!

---

## That's It!

You now have:
- ✅ Working Android app
- ✅ APK file
- ✅ Can distribute via website

**Total time: ~15 minutes on first build**

🦬 OX | April 11, 2026
