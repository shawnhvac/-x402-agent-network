# Building APK with GitHub Actions
## Automated Cloud Build

## What Is This?

Instead of building on your Windows PC or our server, GitHub automatically builds the APK for you in the cloud (Ubuntu servers).

**Advantages:**
- ✅ No local setup needed
- ✅ Builds in ~5-7 minutes
- ✅ Automatically on every push to main
- ✅ Free (2000 min/month included)
- ✅ Professional CI/CD pipeline

## How to Use

### Option 1: Trigger Build from Website

1. **Go to:** https://github.com/shawnhvac/-x402-agent-network
2. **Click:** "Actions" tab
3. **Select:** "Build AgentPay APK" workflow
4. **Click:** "Run workflow" button (green)
5. **Watch it build** (7 min)

### Option 2: Automatic Build on Push

Any time you push code to `main` branch:
1. GitHub automatically starts the build
2. Watch progress in Actions tab
3. Download artifact when done

### Option 3: Manual API Trigger

```bash
curl -X POST \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+raw" \
  https://api.github.com/repos/shawnhvac/-x402-agent-network/actions/workflows/build-apk.yml/dispatches \
  -d '{"ref":"main"}'
```

## How to Download the APK

### After Build Completes:

1. **Go to:** https://github.com/shawnhvac/-x402-agent-network/actions
2. **Click** the latest workflow run (green checkmark = success)
3. **Scroll down** to "Artifacts"
4. **Click** "agentpay-debug-apk" to download ZIP
5. **Extract** the ZIP file
6. **You have:** `android-debug.apk`

## Deploying to Website

Once you have the APK from GitHub Actions:

```bash
# On your local machine or server
cd x402-agent-network

# Copy the APK
mkdir -p public/apk
cp android-debug.apk public/apk/agentpay-latest.apk

# Push to GitHub
git add public/apk/agentpay-latest.apk
git commit -m "Add: AgentPay APK release (GitHub Actions build)"
git push
```

Now users can download from: https://x402-agent-pay.com/download/agentpay-latest.apk

## Workflow Details

**File:** `.github/workflows/build-apk.yml`

**What it does:**
1. Checks out the code
2. Sets up Java 11 (required for Gradle)
3. Makes gradlew executable
4. Runs: `./gradlew assembleDebug`
5. Uploads APK as artifact
6. Creates GitHub Release with the APK

**Build output:** `android/build/outputs/apk/debug/android-debug.apk`

## Troubleshooting

### Build Failed?

Check the logs:
1. Go to Actions tab
2. Click failed build
3. Expand "Build APK" step
4. Read error message
5. Fix in code and push again

Common errors:
- **"gradlew not found"** → File corruption, will retry
- **"Gradle sync failed"** → Check build.gradle.kts syntax
- **"Plugin not found"** → Check Android plugin version compatibility

### Download Not Working?

1. Make sure build has "green checkmark" (success)
2. Wait 30 seconds after build completes
3. Refresh the Actions page
4. Artifacts should appear at bottom

### Want to Customize Build?

Edit `.github/workflows/build-apk.yml`:
- Change `ubuntu-latest` to `windows-latest` for Windows build
- Add steps for signing release APK
- Add notification on success/failure
- Add automatic upload to Google Play

## Release Builds (Future)

For Google Play Store submission, update workflow to build release APK:

```yaml
- name: Build Release APK
  run: ./gradlew assembleRelease
```

Requires:
- Keystore file (signing certificate)
- Keystore password
- Key alias + password

## Status

✅ **Workflow active** - Builds on every push to main  
✅ **Artifacts available** - Download in Actions tab  
✅ **Website ready** - Download endpoint at `/download/agentpay-latest.apk`  

## Next Steps

1. **Trigger build**: Go to Actions → Run workflow
2. **Wait 7 minutes** for build to complete
3. **Download APK** from artifacts
4. **Copy to `public/apk/agentpay-latest.apk`**
5. **Push to GitHub**
6. **Download button on website works!**

---

**Total time to working download button: ~10 minutes** 🚀🦬™

This is how professional teams build Android apps. No local setup, no server installation, just push code and GitHub builds it for you.
