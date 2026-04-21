# Building AgentPay APK Server-Side
## April 11, 2026

## The Challenge

Building Android APKs requires:
1. **Android SDK** (~5GB) - Not pre-installed on Linux servers
2. **Android NDK** (native code compilation tools)
3. **Build Tools** (specific versions for Gradle)
4. **JDK 11+** (for Gradle compilation) ✅ We have this
5. **Gradle Wrapper** (Android build system) ✅ We have this

The problem: Installing Android SDK on a Linux server takes 30+ minutes and 10+ GB of disk space.

## Options

### Option A: Docker Build (Recommended for CI/CD)
```bash
docker run --rm -v $(pwd):/workspace -w /workspace \
  runsc/android-sdk:latest \
  ./gradlew assembleDebug
```

Problem: OpenClaw server may not have Docker access.

### Option B: Manual Android SDK Install
```bash
# Download Android SDK (~5GB)
wget https://dl.google.com/android/repository/commandlinetools-linux-...
# Unzip
# Run sdkmanager to download build tools
# Set ANDROID_HOME environment variable
# Run gradlew assembleDebug
```

Problem: 30+ minutes, 5+ GB storage

### Option C: Use GitHub Actions (Cloud Build)
Create `.github/workflows/build-apk.yml`:
```yaml
name: Build APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build APK
        run: ./gradlew assembleDebug
      - name: Upload APK
        uses: actions/upload-artifact@v2
        with:
          name: agentpay.apk
          path: android/build/outputs/apk/debug/android-debug.apk
```

Problem: Requires GitHub Actions setup, still ~5 min per build

### Option D: Pre-built APK Stub + Real Build on Windows
Keep the stub APK on the website for demo purposes, but build the real APK on Shawn's Windows PC (which we were already doing).

**Advantages:**
- Builds locally where all tools are available
- No server resource waste
- Faster build time (~3 minutes)
- Standard Android development workflow
- Can test on phone immediately

**Disadvantages:**
- Requires Shawn's Windows PC to be available
- Gradle sync issues (which we encountered)

## Our Solution: GitHub Actions CI/CD

Instead of building on the server or struggling with Windows Gradle, let's use GitHub Actions:

1. **Set up GitHub Actions workflow** (.github/workflows/build-apk.yml)
2. **Push code to GitHub**
3. **Actions automatically builds APK** (in ~5-7 minutes)
4. **APK downloaded from workflow artifacts**
5. **Copy to server and deploy**

This is the professional approach used by Android teams worldwide.

## Implementation Steps

### Step 1: Create GitHub Actions Workflow

Create file: `.github/workflows/build-apk.yml`

```yaml
name: Build AgentPay APK

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 11
      uses: actions/setup-java@v3
      with:
        java-version: '11'
        distribution: 'temurin'
    
    - name: Build APK
      run: |
        chmod +x ./gradlew
        ./gradlew assembleDebug
    
    - name: Upload APK
      uses: actions/upload-artifact@v3
      with:
        name: agentpay-debug
        path: android/build/outputs/apk/debug/android-debug.apk

    - name: Upload to Release
      if: github.ref == 'refs/heads/main'
      uses: softprops/action-gh-release@v1
      with:
        files: android/build/outputs/apk/debug/android-debug.apk
        tag_name: latest-apk
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Step 2: Push Workflow to GitHub

```bash
cd x402-agent-network
git add .github/workflows/build-apk.yml
git commit -m "Add: GitHub Actions APK build workflow"
git push
```

### Step 3: GitHub Actions Builds Automatically

- Goes to: https://github.com/shawnhvac/-x402-agent-network/actions
- Click the workflow run
- Scroll down to "Artifacts"
- Download `agentpay-debug` ZIP
- Extract APK file

### Step 4: Deploy APK to Website

```bash
# Download from GitHub Actions
# Save to: public/apk/agentpay-latest.apk
# Commit and push
git add public/apk/agentpay-latest.apk
git commit -m "Add: AgentPay APK release"
git push
```

### Step 5: Website Download Works

- Users visit: https://x402-agent-pay.com
- Click "Download Android APK"
- File: `/download/agentpay-latest.apk`
- Downloads the real APK to their phone

## Why This Works

✅ **No server installation needed** — GitHub's servers handle Android SDK  
✅ **Professional CI/CD** — Automated builds on every code change  
✅ **Reliable** — GitHub Actions is maintained, always up-to-date  
✅ **Free** — Included with GitHub repo (2000 min/month)  
✅ **Transparent** — Build logs visible in Actions tab  
✅ **Scalable** — Can add release builds, Play Store signing later  

## Timeline

- **Workflow creation**: 5 minutes
- **First build**: 7-10 minutes (downloads SDK)
- **Subsequent builds**: 3-5 minutes (cached)
- **Total setup to deployed APK**: ~20 minutes

## Next Steps

1. Create `.github/workflows/build-apk.yml`
2. Push to GitHub
3. Go to Actions tab → watch build run
4. Download artifact
5. Copy APK to `public/apk/`
6. Push to main branch
7. Website download button works!

---

**Status**: Ready to implement. This is the professional way to handle Android builds at scale. 🚀🦬™
