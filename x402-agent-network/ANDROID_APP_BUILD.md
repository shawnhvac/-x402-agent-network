# Personal Agent Android App - Build Plan

**Status:** Ready to develop  
**Target:** April 15, 2026  
**Platform:** Android (Kotlin + Jetpack Compose)  

---

## Overview

**Your Personal Agent** on your Android phone:
1. You speak instructions: "Find battery service, budget $200, this week"
2. Agent listens + understands intent
3. Agent autonomously:
   - Queries AgentPay marketplace
   - Scores options (price, reputation, distance)
   - Books appointment
   - Locks payment in SmartEscrow
   - Sends confirmation
4. You get notification when done

**Zero human intervention after you speak the instruction.**

---

## Tech Stack

```
Frontend:
- Kotlin (Android native)
- Jetpack Compose (UI)
- Material 3 (design system)
- Google Speech-to-Text (voice input)
- TensorFlow Lite (on-device inference)

Backend:
- Node.js (agent logic)
- WebSocket (real-time updates)
- Solana Web3.js (blockchain)

Storage:
- SQLite (local preferences)
- Encrypted SharedPreferences (wallet seed)
- Cloud sync (preferences backup)

APIs:
- Google Speech-to-Text
- x402-agent-pay.com (AgentPay API)
- Solana RPC (blockchain)
```

---

## App Architecture

### Three Main Screens

#### 1. Home Screen
```
┌─────────────────────────────┐
│  🤖 Your Agent              │
│  "Ready to listen..."       │
├─────────────────────────────┤
│  🎤 [LARGE SPEAK BUTTON]   │
│     "Say what you need"     │
├─────────────────────────────┤
│  Last instruction:          │
│  "Find mechanics in Phoenix"│
│  ✅ Completed               │
│  💰 $145 booked             │
├─────────────────────────────┤
│ [Preferences] [History]     │
│ [Wallet] [Settings]         │
└─────────────────────────────┘
```

#### 2. Preferences Screen
```
┌─────────────────────────────┐
│  ⚙️ Agent Preferences       │
├─────────────────────────────┤
│  🚗 Vehicle Services:       │
│  Make: Tesla™ Model 3       │
│  Budget: $200 max           │
│  Radius: 15 miles           │
│  Preferred times: 8am-5pm   │
│                             │
│  ⚡ EV Charging:            │
│  Max price: $0.50/kWh      │
│  Preferred networks: EA     │
│                             │
│  🛒 Shopping:               │
│  Budget: $100-500           │
│  Loyalty: Prime, Costco     │
│                             │
│  [Save Preferences]         │
└─────────────────────────────┘
```

#### 3. History Screen
```
┌─────────────────────────────┐
│  📋 Agent Activity          │
├─────────────────────────────┤
│  ✅ Apr 10, 2:15 PM        │
│     "Book battery service"  │
│     → Phoenix Battery Tech  │
│     Tomorrow 2pm, $145      │
│     [View Details]          │
│                             │
│  ⏳ Apr 10, 1:30 PM        │
│     "Find charging station" │
│     Processing...           │
│     [Cancel]                │
│                             │
│  ✅ Apr 9, 10:00 AM        │
│     "Schedule haircut"      │
│     → Salon XYZ             │
│     Thu 3pm, $35            │
│     [View Details]          │
│                             │
│  [View All]                 │
└─────────────────────────────┘
```

---

## Voice Command Examples

### Service Booking
```
User: "Book a mechanic appointment for my Tesla™"
Agent: 
  ✓ Detected intent: Vehicle maintenance
  ✓ Checking your budget: $200
  ✓ Searching 15 miles radius
  ✓ Found 5 mechanics
  ✓ Top match: Phoenix Battery Tech (4.8★, $145)
  ✓ Booking for tomorrow 2:00 PM
  ✓ Payment locked in SmartEscrow
  ✓ Sending confirmation

User receives: "✅ Appointment booked!"
```

### Shopping
```
User: "Buy me a phone charger, cheap"
Agent:
  ✓ Detected intent: Shopping
  ✓ Searching: Amazon, Costco, Best Buy
  ✓ Found Anker charger: $24.99 → $23.74 (loyalty)
  ✓ Ordering from Amazon Prime
  ✓ Delivery: 2 days
  ✓ Amount locked: $23.74

User receives: "✅ Charger ordered, arriving Apr 12"
```

### Charging
```
User: "Charge my car when it's cheapest today"
Agent:
  ✓ Detected intent: EV charging
  ✓ Current battery: 45%
  ✓ Checking 8 chargers nearby
  ✓ Best price: Electrify America $0.35/kWh
  ✓ Scheduling 6:00 PM (off-peak)
  ✓ Estimated cost: $18.50

User receives: "✅ Charging scheduled for 6pm, $18.50"
```

---

## Development Phases

### Phase 1: MVP (Apr 10-15)
- Android app skeleton
- Voice input working
- Preferences screen
- Mock agent responses
- **Deliverable:** Runnable app on your phone

### Phase 2: Integration (Apr 15-20)
- Connect to AgentPay API
- Real agent backend
- SmartEscrow integration
- Solana wallet setup
- **Deliverable:** Live agent transactions

### Phase 3: Polish (Apr 20-25)
- UI refinement
- Notification system
- Transaction history
- Error handling
- **Deliverable:** Beta-ready app

### Phase 4: Testing (Apr 25-30)
- Real marketplace queries
- Live appointments booked
- Payment settlements
- **Deliverable:** Demo-ready

---

## Code Structure

```kotlin
// MainActivity.kt - Home Screen
class MainActivity : ComponentActivity() {
    private val viewModel: AgentViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgentTheme {
                AgentHomeScreen(viewModel)
            }
        }
    }
}

// AgentViewModel.kt - Business Logic
class AgentViewModel(
    private val agentService: AgentService,
    private val speechRecognizer: SpeechRecognizer
) : ViewModel() {
    
    fun startListening() {
        speechRecognizer.startListening()
    }
    
    fun processCommand(userSpeech: String) {
        // 1. Understand intent
        val intent = nlp.parseIntent(userSpeech)
        
        // 2. Query marketplace
        val options = agentService.discover(intent)
        
        // 3. Score and select
        val best = negotiationEngine.selectBest(options)
        
        // 4. Execute booking
        agentService.book(best)
        
        // 5. Show confirmation
        showNotification("✅ Booked: ${best.name}")
    }
}

// AgentService.kt - API Integration
class AgentService(private val apiClient: RetrofitClient) {
    
    suspend fun discover(intent: UserIntent): List<Provider> {
        return apiClient.post("/api/agents/discover", intent)
    }
    
    suspend fun book(provider: Provider): SmartEscrow {
        return apiClient.post("/api/escrow/create", provider)
    }
}

// PreferencesScreen.kt - UI
@Composable
fun PreferencesScreen(viewModel: AgentViewModel) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text("Agent Preferences", style = MaterialTheme.typography.headlineLarge)
        
        VehiclePreferences()
        ChargingPreferences()
        ShoppingPreferences()
        
        Button(onClick = { viewModel.savePreferences() }) {
            Text("Save Preferences")
        }
    }
}
```

---

## Registration Flow (Your Phone)

### Step 1: Download & Install
- Download from Google Play (when live)
- Or sideload APK for testing

### Step 2: Create Agent Profile
```
1. Open app
2. Tap "Register Agent"
3. Fill form:
   - Agent name: "Shawnhvac's Personal Agent"
   - Service type: "Personal assistant"
   - Description: "Autonomous booking + shopping"
   - Wallet: [Create or import Solana wallet]
4. Pay: $9.99/month (first month free)
5. Agent live on marketplace
```

### Step 3: Set Preferences
```
1. Open "Preferences"
2. Configure:
   - Your location: Phoenix, AZ
   - Budget limits: $200 vehicle, $50 shopping
   - Preferred times: 8am-5pm
   - Services: Mechanics, shopping, charging
3. Save
```

### Step 4: Start Giving Commands
```
1. Tap big 🎤 button
2. Say: "Find mechanics in Phoenix"
3. Agent processes:
   - Queries marketplace
   - Finds options
   - Books best match
   - Locks payment
4. Notification: "✅ Booked!"
```

---

## Agent-to-Agent Transaction Demo

**When Solana CLI arrives:**

```
Your Personal Agent ────── x402 Request ────── Service Provider Agent
     (Android)             (HTTP 402)           (Registered on AgentPay)
        │                                              │
        ├──────────────► "Need mechanic service"      │
        │                    Payment: $145            │
        │                    SmartEscrow ID           │
        │                                              │
        │                                    ┌─────────┴──────┐
        │                                    │                 │
        │                                    ▼                 │
        │                            ┌──────────────────┐     │
        │                            │ Agent checks:    │     │
        │                            │ • Budget OK?     │     │
        │                            │ • Time OK?       │     │
        │                            │ • Capacity OK?   │     │
        │                            └──────────────────┘     │
        │                                    │                 │
        │                     ┌──────────────┴────────────────┤
        │                     │                               │
        │              ┌──────▼──────┐            ┌──────────▼────┐
        │              │   ACCEPT    │            │    REJECT     │
        │              └──────┬──────┘            └───────────────┘
        │                     │
        │                     ▼
        │          ┌──────────────────────┐
        │          │ SmartEscrow Lock:    │
        │          │ $145 USDC locked     │
        │          │ Milestone: "Service" │
        │          │ Timeout: 24 hours    │
        │          └──────────────────────┘
        │
        └─────────────────────────────────────────► Solana Blockchain
```

**Result:**
- ✅ Your agent booked appointment
- ✅ Payment locked (you control release)
- ✅ Service provider reputation increases
- ✅ Your agent reputation increases
- ✅ All on-chain, verifiable

---

## Testing Checklist

### Before Demo to Investors

- [ ] App installs on your Android phone
- [ ] Voice input working ("book mechanic")
- [ ] App queries AgentPay marketplace
- [ ] Returns top 3 options with prices
- [ ] User selects one or agent auto-selects
- [ ] SmartEscrow created (test on Solana devnet)
- [ ] Confirmation notification sent
- [ ] Transaction visible in app history
- [ ] On-chain transaction verifiable
- [ ] Agent profiles showing on marketplace

### Live Demo Scenario

1. **Open app on your phone**
   - Show preferences set up
   - Show marketplace access

2. **Give voice command**
   - "Book a mechanic appointment"
   - Agent processes request

3. **Show results**
   - 3 options returned
   - Agent selects best match
   - Confirmation notification

4. **Show blockchain**
   - Open Solana explorer
   - Show escrow transaction
   - Show reputation update

5. **Show marketplace**
   - Refresh x402-agent-pay.com
   - Show your agent registered
   - Show transaction history

---

## Launch Strategy

### Internal Testing (Apr 10-20)
- Build on your phone
- Test all voice commands
- Test marketplace integration
- Test SmartEscrow

### Closed Beta (Apr 20-25)
- 10-20 beta testers
- Real transactions on testnet
- Feedback collection

### Public Beta (Apr 25-30)
- Google Play beta testing
- TestFlight (if iOS later)
- Real transactions on mainnet

### App Store Launch (May 1+)
- Google Play submission
- Apple App Store submission
- Marketing campaign

---

## Files to Build

1. **MainActivity.kt** — Home screen + voice UI
2. **AgentViewModel.kt** — Agent logic + commands
3. **PreferencesScreen.kt** — Settings UI
4. **HistoryScreen.kt** — Transaction history
5. **AgentService.kt** — API integration
6. **WalletManager.kt** — Solana wallet handling
7. **SmartEscrowService.kt** — Transaction creation
8. **SpeechRecognizer.kt** — Voice input wrapper
9. **NotificationManager.kt** — Push notifications
10. **build.gradle** — Dependencies

**Total lines of code:** ~2,000-3,000  
**Development time:** 5-7 days  

---

## Success Criteria

✅ Agent app running on your Android phone  
✅ Voice commands understood  
✅ Marketplace integration working  
✅ SmartEscrow transactions executing  
✅ Agent-to-agent payments settling  
✅ Demo ready for investors  

**This proves the vision: autonomous agent commerce, no human intervention.**

