# AgentPay Provider — iOS App

## Overview
Native SwiftUI app for service providers to manage bookings, earnings, and their profile via the AgentPay x402 payment network.

## Siri / App Intents (iOS 16+)
Three built-in Siri voice commands:

| Phrase | Action |
|--------|--------|
| "Hey Siri, check my AgentPay bookings" | Returns pending booking count |
| "Hey Siri, accept my next AgentPay booking" | Accepts next pending booking, triggers SMS to customer |
| "Hey Siri, how much did I earn today on AgentPay?" | Returns today's earnings total |

## Requirements
- Xcode 15+
- iOS 16.0+ deployment target
- Apple Developer account (for App Store submission)
- App Intents framework (built-in iOS 16+)

## Setup
1. Open `ios/AgentPayProvider.xcodeproj` in Xcode
2. Set your Team in Signing & Capabilities
3. Set Bundle ID: `com.agentpay.provider`
4. Build & run on device or simulator

## App Store Submission Checklist
- [ ] Apple Developer account enrolled ($99/yr)
- [ ] Bundle ID registered: com.agentpay.provider
- [ ] App Store Connect app created
- [ ] Screenshots: 6.5" (1284x2778) + 5.5" (1242x2208)
- [ ] App icon: 1024x1024 PNG (no alpha)
- [ ] Privacy policy URL: https://www.x402-agent-pay.com/privacy
- [ ] App description written
- [ ] Keywords set (max 100 chars)
- [ ] Category: Business
- [ ] Age rating: 4+
- [ ] Siri capability enabled in Xcode

## Siri Integration Notes
- Uses `AppIntents` framework (iOS 16+, replaces old SiriKit)
- Intents appear automatically in Siri suggestions after first use
- No separate Intent Definition file needed (code-only)
- Voice phrases are defined in `AppShortcuts` — Apple indexes these automatically

## API Endpoints Used
- `POST /api/v1/provider/login` — auth
- `GET /api/v1/provider/bookings` — booking list
- `POST /api/v1/provider/bookings/{id}/accept` — accept booking
- `GET /api/v1/provider/earnings/today` — daily earnings
