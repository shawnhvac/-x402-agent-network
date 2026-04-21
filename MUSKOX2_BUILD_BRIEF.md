# MUSKOX2: Build AgentPay Marketplace APK

**Status:** Code complete, needs compilation
**Time estimate:** 5-10 minutes
**Priority:** High (Series A demo ready)

---

## What Changed

### New Marketplace UI (Complete)
- Created: `/android/src/main/kotlin/MainActivity-Marketplace.kt` (600+ lines)
- Replaces: Old agent-only MainActivity.kt
- Backed up: `MainActivity-Agent-Backup.kt` (in case we need to revert)

### Code Location
```
/root/.openclaw/workspace/x402-agent-network/
├── android/src/main/kotlin/
│   ├── MainActivity.kt (← NEW: Marketplace UI)
│   ├── MainActivity-Marketplace.kt (source)
│   └── MainActivity-Agent-Backup.kt (old code)
└── [all other agent code remains intact]
```

---

## New Features in APK

✅ **Home Screen**
- Browse Services button
- My Bookings button
- Feature highlights

✅ **Marketplace Screen**
- Real provider list (Salon, Mechanic, Dental)
- Search functionality
- Provider cards with ratings, prices, distance
- Tap to book flow

✅ **Booking Screen**
- Provider details
- Date selector
- Time selector
- Price breakdown with fees
- Confirm booking button

✅ **Dashboard Screen**
- Booking statistics
- Booking history
- Status tracking
- View/manage bookings

---

## Build Instructions

### Step 1: Pull Latest Code
```bash
cd /root/.openclaw/workspace/x402-agent-network
git pull origin main
```

### Step 2: Verify Code Changed
```bash
# Should show the new marketplace UI code
head -50 android/src/main/kotlin/MainActivity.kt
```

### Step 3: Build APK
```bash
cd android
./gradlew clean assembleRelease
```

### Step 4: Verify Build
```bash
ls -lah app/build/outputs/apk/release/
# Should see: app-release.apk (28-30 MB)
```

### Step 5: Copy to Public Download
```bash
cp app/build/outputs/apk/release/app-release.apk \
   /root/.openclaw/workspace/x402-agent-network/public/download/agentpay-latest.apk

# Update timestamp
/root/.openclaw/workspace/x402-agent-network/scripts/update-apk-timestamp.sh
```

### Step 6: Verify on Phone
- Uninstall old app
- Download from: https://x402-agent-pay.com/download.html
- Install new APK
- Should see: Marketplace home screen (not voice commands)

---

## What to Expect

**Old APK (current):**
- Opens to voice command screen
- Says "Book mechanic" functionality
- Agent system initialization logs

**New APK (after build):**
- Opens to "AgentPay" home screen with features
- Shows "Browse Services" button
- Shows "My Bookings" button
- Full marketplace UI navigation

---

## Troubleshooting

**If build fails:**
1. Check Android SDK version (should be 34+)
2. Verify Kotlin compiler (should be 1.9+)
3. Run: `./gradlew --version`

**If APK is still old:**
1. Clear gradle cache: `./gradlew clean`
2. Rebuild: `./gradlew assembleRelease`
3. Verify: `strings app/build/outputs/apk/release/app-release.apk | grep "AgentPay"`

---

## Files Changed Summary

| File | Status | Change |
|------|--------|--------|
| MainActivity.kt | Modified | New: Marketplace UI (600 lines) |
| MainActivity-Marketplace.kt | New | Source code for new UI |
| MainActivity-Agent-Backup.kt | New | Backup of old agent code |
| All other Android files | Unchanged | Agent system stays intact |

---

## Questions?

If anything doesn't build:
1. Check build logs for specific errors
2. Verify Gradle version
3. Verify Kotlin compiler version
4. Check Android SDK installation

---

**Target:** Marketplace APK ready for Series A demo
**Deadline:** ASAP (we're 15 minutes into April 15)
**Impact:** Complete UI overhaul from agent → marketplace

Let me know when build completes! 🚀
