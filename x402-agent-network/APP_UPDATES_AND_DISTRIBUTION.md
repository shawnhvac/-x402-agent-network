# AgentPay™ App Updates & Distribution Strategy
## April 11, 2026

---

## 📱 App Update Mechanisms

### **Option 1: Google Play Store (Recommended Long-Term)**

**How It Works:**
1. User installs app from Google Play Store
2. Google Play automatically checks for updates daily
3. When new version published, users get automatic update notification
4. Users can enable "Auto-update" for seamless upgrades
5. Analytics show adoption rate, crash reports, user feedback

**Setup Process:**
1. Create Google Play Developer Account ($25 one-time)
2. Generate signed APK with keystore
3. Create app listing with screenshots, description
4. Upload APK to Google Play Console
5. Set rollout percentage (start at 5%, increase to 100%)
6. Monitor crash reports and reviews in real-time

**Timeline:**
- Setup: 1-2 hours
- First submission: 24-48 hours review time
- Updates: 2-4 hours from submission to live

**Cost:**
- Developer account: $25 (one-time)
- Hosting: Free (Google Play hosts APK)
- No per-app fees or monthly costs

**Advantages:**
- ✅ Automatic update notifications
- ✅ Automatic crash detection
- ✅ User reviews and feedback
- ✅ Version analytics (which versions active)
- ✅ Staged rollout (test new versions on 5% first)
- ✅ A/B testing capabilities
- ✅ Millions of users can discover app

**Disadvantages:**
- ❌ 24-48 hour review wait (can't push emergency fixes instantly)
- ❌ Must follow Google Play policies
- ❌ Cannot force update (users can defer)

---

### **Option 2: Direct Website APK Download (Current)**

**How It Works:**
1. Update APK on website: `https://x402-agent-pay.com/download/agentpay-latest.apk`
2. Users manually download and install
3. Users manually check for updates

**Setup Process:**
- ✅ Already live at `/download/agentpay-latest.apk`
- ✅ No store approval needed
- ✅ Updates instant (no review time)
- ✅ Full control over version rollout

**Update Flow:**
```bash
# 1. Build new APK
gradle assembleRelease

# 2. Copy to website
cp android/build/outputs/apk/release/app-release.apk public/apk/agentpay-latest.apk

# 3. Commit and deploy
git add public/apk/agentpay-latest.apk
git commit -m "Update: AgentPay app to v1.2.3"
git push
# Server auto-deploys
```

**Cost:**
- Free (hosted on your website)

**Advantages:**
- ✅ Instant updates (no review time)
- ✅ Full control over rollout
- ✅ Can push emergency security fixes immediately
- ✅ No dependency on Google Play policies
- ✅ Users always get latest version

**Disadvantages:**
- ❌ Users must manually download
- ❌ No automatic update notifications
- ❌ Users might not know new version exists
- ❌ No crash reporting built-in

---

### **Option 3: In-App Update Prompt (Hybrid)**

**How It Works:**
1. App checks server endpoint on startup
2. Server returns latest version number
3. If user has older version, show update prompt
4. User taps "Update" → downloads new APK from website
5. Android auto-installs the APK

**Setup Process:**

```kotlin
// In MainActivity.kt, on app startup:

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Check for updates
        checkForUpdates()
        
        setContent {
            AgentPayApp()
        }
    }
    
    private fun checkForUpdates() {
        // Call endpoint: GET https://x402-agent-pay.com/api/app-version
        // Response: { "currentVersion": "1.2.3", "downloadUrl": "..." }
        
        val retrofit = Retrofit.Builder()
            .baseUrl("https://x402-agent-pay.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        val service = retrofit.create(ApiService::class.java)
        service.getAppVersion().enqueue(object : Callback<VersionResponse> {
            override fun onResponse(call: Call<VersionResponse>, response: Response<VersionResponse>) {
                val latestVersion = response.body()?.currentVersion
                val currentVersion = BuildConfig.VERSION_NAME
                
                if (isNewerVersion(latestVersion, currentVersion)) {
                    showUpdateDialog(response.body()?.downloadUrl ?: "")
                }
            }
            
            override fun onFailure(call: Call<VersionResponse>, t: Throwable) {
                // Silent fail - not critical
            }
        })
    }
}
```

**Server Endpoint (Node.js):**

```typescript
// In src/app.ts

app.get('/api/app-version', (req, res) => {
  res.json({
    currentVersion: '1.2.3',
    downloadUrl: 'https://x402-agent-pay.com/download/agentpay-latest.apk',
    releaseNotes: 'Bug fixes and performance improvements',
    isMandatory: false // If true, block app until update
  });
});
```

**Cost:**
- Free (hosted on your existing server)

**Advantages:**
- ✅ Automatic update prompts (users see notification)
- ✅ No app store review delays
- ✅ Users stay on latest version
- ✅ Can make updates mandatory if needed
- ✅ Full control and instant deployment

**Disadvantages:**
- ⚠️ Requires user action (tap "Update" button)
- ⚠️ More complex than direct download
- ⚠️ Users might dismiss prompt

---

## 🚀 Recommended Strategy (Phased)

### **Phase 1: NOW (Direct Download)**
- ✅ Update APK on website: `/download/agentpay-latest.apk`
- ✅ Users can download directly
- ✅ Fast, no review delays
- ✅ Perfect for beta testing

### **Phase 2: NEXT MONTH (In-App Updates)**
- Add version check endpoint to backend
- Implement update prompt in app
- Automatic notifications when new version available
- Still no Google Play approval delays

### **Phase 3: MONTH 2 (Google Play)**
- Submit to Google Play Store
- Automatic update notifications for all users
- Professional app marketplace discovery
- Analytics, reviews, crash reports
- Keep website APK as backup

---

## 📋 Wallet Top-Up Implementation

### **Current Implementation (Just Added)**

The Top Up button now:
1. Opens a dialog box when tapped
2. Allows users to enter custom amount (SOL)
3. Shows quick buttons (0.5, 1.0, 5.0, 10.0 SOL)
4. Updates wallet balance when confirmed

**Code Added:**
- `TopUpDialog()` composable - dialog UI
- `QuickAmountButton()` composable - preset amounts
- `TextField` with decimal keyboard input
- Real-time balance updates in state

### **Next Steps: Real Blockchain Integration**

To make this actually process payments on Solana:

```kotlin
// Connect to real Solana RPC
private fun initializeSolanaConnection() {
    val rpcClient = RpcClient("https://api.mainnet-beta.solana.com")
    solanaManager = SolanaWalletManager(rpcClient)
}

// When user confirms top-up amount
private fun processTopUp(amount: Double) {
    solanaManager.requestAirdrop(
        address = userWalletAddress,
        amount = amount.toLong() * LAMPORTS_PER_SOL
    )
}
```

---

## 🔄 Complete Update Flow

### **User Perspective:**

**Scenario 1: Direct Website Download**
```
1. User clicks "Download APK" on website
2. APK downloads to phone
3. User taps install
4. App opens
5. To get new version: manually re-download from website
```

**Scenario 2: In-App Update (Phase 2)**
```
1. App checks for updates on startup
2. If new version exists: "Update Available" prompt
3. User taps "Update"
4. New APK downloads in background
5. Auto-installs when complete
6. App restarts with new version
```

**Scenario 3: Google Play (Phase 3)**
```
1. User installs app from Google Play
2. Google Play checks daily for updates
3. If new version exists: "Update available" notification
4. User can auto-update or manual update
5. Play Store shows version history, reviews
```

---

## 📊 Update Strategy Comparison

| Feature | Website APK | In-App Check | Google Play |
|---------|------------|--------------|-------------|
| **Setup Time** | 5 min | 2 hours | 2-4 hours |
| **Deployment Time** | Instant | Instant | 2-4 hours (review) |
| **User Notification** | Manual | Automatic | Automatic |
| **Cost** | Free | Free | $25 |
| **Control** | Full | Full | Limited (policies) |
| **Analytics** | None | Custom | Built-in |
| **Crash Reports** | None | Custom | Built-in |
| **Discoverability** | Low | Low | High |
| **Best For** | Beta testing | Production | Mass market |

---

## 🛠️ Implementation Checklist

### **For Next Build:**

- [ ] Update Top Up dialog (✅ DONE)
- [ ] Rebuild APK with new code
- [ ] Test Top Up on phone (enter amounts, see balance update)
- [ ] Deploy new APK to website
- [ ] Push to GitHub

### **For Phase 2 (In-App Updates):**

- [ ] Add `/api/app-version` endpoint to backend
- [ ] Implement version check in MainActivity
- [ ] Test update prompt flow
- [ ] Create version increment system

### **For Phase 3 (Google Play):**

- [ ] Create Google Play developer account ($25)
- [ ] Generate signed release APK
- [ ] Create app listing with screenshots
- [ ] Submit for review
- [ ] Monitor launch metrics

---

## 📦 Building & Deploying New Versions

### **Quick Update Workflow:**

```bash
# 1. Make code changes (e.g., MainActivity.kt)
# 2. Build new APK
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=/opt/android-sdk
export PATH=/opt/gradle-8.0/bin:$PATH
cd /root/.openclaw/workspace/x402-agent-network
gradle assembleDebug

# 3. Deploy to website
cp android/build/outputs/apk/debug/android-debug.apk \
   public/apk/agentpay-latest.apk

# 4. Commit and push
git add public/apk/agentpay-latest.apk
git commit -m "Update: AgentPay app - fixed top-up, version 1.1"
git push

# 5. Done! Users can download updated APK
```

---

## 🎯 Next Actions

1. **Rebuild APK with Top Up fix**
   - Use the updated MainActivity.kt code above
   - Build with `gradle assembleDebug`

2. **Test on your phone**
   - Download updated APK
   - Tap Top Up button
   - Enter custom amounts
   - Verify balance updates

3. **Deploy to website**
   - Copy new APK to `public/apk/agentpay-latest.apk`
   - Push to GitHub
   - Announce update on Moltbook

4. **Add in-app version check** (Phase 2)
   - Users get automatic update notifications
   - No manual re-downloading needed

---

**Status: 🟢 Top Up UI implemented, Ready for rebuild + testing**

🦬™ OX | April 11, 2026
