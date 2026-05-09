package com.agentpay

import android.content.Context
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

// ── Shared constants ──────────────────────────────────────────────────────────
private const val TAG        = "AgentPay"
private const val API_BASE   = "https://www.x402-agent-pay.com/api/agentpay"
private const val PREFS_NAME = "agentpay_prefs"
private const val KEY_ROLE   = "user_role"       // "consumer" | "provider"
private const val KEY_APIKEY = "api_key"
private const val KEY_NAME   = "user_name"

// ── Color palette ─────────────────────────────────────────────────────────────
private val BgDark      = Color(0xFF0f172a)
private val BgCard      = Color(0xFF1e293b)
private val BgCardAlt   = Color(0xFF243044)
private val AccentBlue  = Color(0xFF60a5fa)
private val AccentGreen = Color(0xFF10b981)
private val AccentPurple= Color(0xFF8b5cf6)
private val AccentAmber = Color(0xFFf59e0b)
private val TextPrimary = Color.White
private val TextSecond  = Color(0xFFcbd5e1)
private val TextMuted   = Color(0xFF94a3b8)

// ── Data models ───────────────────────────────────────────────────────────────
data class Provider(
    val id: String, val name: String, val service: String,
    val price: Double, val rating: Float, val reviews: Int,
    val distance: Double, val address: String, val phone: String
)
data class Booking(
    val id: String, val provider: String, val date: String,
    val time: String, val amount: Double, val status: String
)
data class EscrowItem(
    val id: String, val payerName: String, val amount: Double,
    val service: String, val createdAt: String, val status: String
)
data class Notification(
    val id: Int, val title: String, val body: String,
    val type: String, val createdAt: String, val read: Boolean
)

// ── Main Activity ─────────────────────────────────────────────────────────────
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgentPayRoot()
        }
    }
}

@Composable
fun AgentPayRoot() {
    val context = LocalContext.current
    val prefs   = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    // Persisted state
    var role   by remember { mutableStateOf(prefs.getString(KEY_ROLE, "") ?: "") }
    var apiKey by remember { mutableStateOf(prefs.getString(KEY_APIKEY, "") ?: "") }
    var name   by remember { mutableStateOf(prefs.getString(KEY_NAME, "") ?: "") }

    fun saveSession(r: String, k: String, n: String) {
        role = r; apiKey = k; name = n
        prefs.edit()
            .putString(KEY_ROLE, r)
            .putString(KEY_APIKEY, k)
            .putString(KEY_NAME, n)
            .apply()
        // Register FCM token
        registerFcmToken(context, k)
    }
    fun logout() {
        prefs.edit().clear().apply()
        role = ""; apiKey = ""; name = ""
    }

    when {
        role.isEmpty() -> OnboardingFlow(onComplete = { r, k, n -> saveSession(r, k, n) })
        role == "consumer" -> ConsumerApp(apiKey = apiKey, userName = name, onLogout = ::logout)
        role == "provider" -> ProviderApp(apiKey = apiKey, userName = name, onLogout = ::logout)
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// ONBOARDING FLOW
// ══════════════════════════════════════════════════════════════════════════════
@Composable
fun OnboardingFlow(onComplete: (role: String, apiKey: String, name: String) -> Unit) {
    var step by remember { mutableStateOf("splash") }    // splash → role → auth
    var selectedRole by remember { mutableStateOf("") }

    when (step) {
        "splash" -> SplashScreen(onContinue = { step = "role" })
        "role"   -> RoleSelectScreen(
            onSelect = { r -> selectedRole = r; step = "auth" }
        )
        "auth"   -> AuthScreen(
            role     = selectedRole,
            onBack   = { step = "role" },
            onSuccess = { apiKey, name -> onComplete(selectedRole, apiKey, name) }
        )
    }
}

@Composable
fun SplashScreen(onContinue: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF0f172a), Color(0xFF1a1040))))
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🤖", fontSize = 72.sp)
        Spacer(Modifier.height(16.dp))
        Text("AgentPay", fontSize = 36.sp, fontWeight = FontWeight.Bold,
            color = AccentBlue)
        Text("M2M Payment Infrastructure", fontSize = 14.sp, color = TextMuted,
            modifier = Modifier.padding(top = 4.dp))
        Spacer(Modifier.height(48.dp))
        Text("Fast · Secure · Autonomous", fontSize = 13.sp, color = TextSecond,
            textAlign = TextAlign.Center)
        Spacer(Modifier.height(60.dp))
        Button(
            onClick = onContinue,
            modifier = Modifier.fillMaxWidth().height(54.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentBlue),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Get Started", fontSize = 17.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun RoleSelectScreen(onSelect: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(60.dp))
        Text("I am a...", fontSize = 28.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text("Choose how you'll use AgentPay", fontSize = 14.sp, color = TextMuted,
            modifier = Modifier.padding(top = 8.dp, bottom = 48.dp))

        // Consumer card
        RoleCard(
            emoji       = "👤",
            title       = "Customer",
            subtitle    = "Book services, send payments, track orders",
            accent      = AccentGreen,
            bullets     = listOf("Browse verified providers", "Pay with USDC or card", "Real-time booking status"),
            onClick     = { onSelect("consumer") }
        )

        Spacer(Modifier.height(20.dp))

        // Provider card
        RoleCard(
            emoji       = "🏢",
            title       = "Provider / Business",
            subtitle    = "Accept bookings, manage escrow, get paid",
            accent      = AccentPurple,
            bullets     = listOf("Instant escrow notifications", "Accept or deny bookings", "Withdraw earnings anytime"),
            onClick     = { onSelect("provider") }
        )

        Spacer(Modifier.height(20.dp))

        // Agent card
        RoleCard(
            emoji       = "🤖",
            title       = "AI Agent",
            subtitle    = "Autonomous x402 commerce & M2M payments",
            accent      = AccentAmber,
            bullets     = listOf("x402 protocol native", "Solana + Base L2 support", "API key authentication"),
            onClick     = { onSelect("provider") }  // Agents use provider flow
        )
    }
}

@Composable
fun RoleCard(emoji: String, title: String, subtitle: String,
             accent: Color, bullets: List<String>, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .border(1.dp, accent.copy(alpha = 0.4f), RoundedCornerShape(16.dp)),
        colors  = CardDefaults.cardColors(containerColor = BgCard),
        shape   = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(modifier = Modifier.padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(accent.copy(alpha = 0.15f), CircleShape),
                contentAlignment = Alignment.Center
            ) { Text(emoji, fontSize = 28.sp) }

            Spacer(Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 17.sp)
                Text(subtitle, fontSize = 12.sp, color = TextMuted,
                    modifier = Modifier.padding(top = 3.dp, bottom = 8.dp))
                bullets.forEach { b ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(Modifier.size(5.dp).background(accent, CircleShape))
                        Text(b, fontSize = 11.sp, color = TextSecond,
                            modifier = Modifier.padding(start = 6.dp, bottom = 2.dp))
                    }
                }
            }

            Icon(Icons.Default.ChevronRight, contentDescription = null, tint = accent)
        }
    }
}

@Composable
fun AuthScreen(role: String, onBack: () -> Unit, onSuccess: (apiKey: String, name: String) -> Unit) {
    var isLogin    by remember { mutableStateOf(true) }
    var apiKey     by remember { mutableStateOf("") }
    var name       by remember { mutableStateOf("") }
    var email      by remember { mutableStateOf("") }
    var showKey    by remember { mutableStateOf(false) }
    var loading    by remember { mutableStateOf(false) }
    var error      by remember { mutableStateOf("") }
    val scope      = rememberCoroutineScope()
    val context    = LocalContext.current

    val roleLabel = if (role == "consumer") "Customer" else "Provider"
    val roleEmoji = if (role == "consumer") "👤" else "🏢"

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .verticalScroll(rememberScrollState())
            .padding(24.dp)
    ) {
        // Back
        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = AccentBlue,
            modifier = Modifier.clickable(onClick = onBack).padding(bottom = 24.dp))

        Text("$roleEmoji $roleLabel", fontSize = 26.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
        Text(if (isLogin) "Welcome back!" else "Create your account",
            fontSize = 14.sp, color = TextMuted, modifier = Modifier.padding(top = 4.dp, bottom = 32.dp))

        if (!isLogin) {
            // Register fields
            OutlinedTextField(
                value = name, onValueChange = { name = it },
                label = { Text("Your name") },
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                colors = fieldColors(), shape = RoundedCornerShape(10.dp)
            )
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                label = { Text("Email address") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                colors = fieldColors(), shape = RoundedCornerShape(10.dp)
            )
        } else {
            // Login with API key
            OutlinedTextField(
                value = apiKey, onValueChange = { apiKey = it },
                label = { Text("API Key") },
                visualTransformation = if (showKey) VisualTransformation.None else PasswordVisualTransformation(),
                trailingIcon = {
                    Icon(if (showKey) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                        contentDescription = null, tint = TextMuted,
                        modifier = Modifier.clickable { showKey = !showKey })
                },
                modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
                colors = fieldColors(), shape = RoundedCornerShape(10.dp)
            )
        }

        if (error.isNotEmpty()) {
            Text(error, color = Color(0xFFf87171), fontSize = 13.sp,
                modifier = Modifier.padding(bottom = 12.dp))
        }

        Button(
            onClick = {
                scope.launch {
                    loading = true; error = ""
                    try {
                        if (isLogin) {
                            // Verify API key
                            val result = apiCall("GET", "$API_BASE/dashboard", apiKey)
                            val displayName = result.optString("name", "User")
                            onSuccess(apiKey.trim(), displayName)
                        } else {
                            // Register new account
                            val body = JSONObject().apply {
                                put("name", name.trim())
                                put("email", email.trim())
                                put("role", role)
                                put("wallet_type", "custodial")
                            }
                            val result = apiCall("POST", "$API_BASE/register", "", body.toString())
                            val newKey = result.optString("api_key", "")
                            if (newKey.isEmpty()) throw Exception(result.optString("error", "Registration failed"))
                            onSuccess(newKey, name.trim())
                        }
                    } catch (e: Exception) {
                        error = e.message ?: "Something went wrong"
                    }
                    loading = false
                }
            },
            modifier = Modifier.fillMaxWidth().height(52.dp),
            enabled = !loading,
            colors = ButtonDefaults.buttonColors(
                containerColor = if (role == "consumer") AccentGreen else AccentPurple
            ),
            shape = RoundedCornerShape(10.dp)
        ) {
            if (loading) CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
            else Text(if (isLogin) "Sign In" else "Create Account",
                fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(16.dp))

        TextButton(onClick = { isLogin = !isLogin; error = "" },
            modifier = Modifier.align(Alignment.CenterHorizontally)) {
            Text(
                if (isLogin) "Don't have an account? Register" else "Already have an account? Sign in",
                color = AccentBlue, fontSize = 14.sp
            )
        }
    }
}

@Composable fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor   = AccentBlue, unfocusedBorderColor = Color(0xFF334155),
    focusedTextColor     = TextPrimary, unfocusedTextColor   = TextPrimary,
    focusedLabelColor    = AccentBlue, unfocusedLabelColor   = TextMuted,
    cursorColor          = AccentBlue
)

// ══════════════════════════════════════════════════════════════════════════════
// CONSUMER APP
// ══════════════════════════════════════════════════════════════════════════════
@Composable
fun ConsumerApp(apiKey: String, userName: String, onLogout: () -> Unit) {
    var screen   by remember { mutableStateOf("home") }
    var selected by remember { mutableStateOf<Provider?>(null) }

    when (screen) {
        "home"      -> ConsumerHome(userName, onNavigate = { screen = it })
        "browse"    -> MarketplaceScreen(
            onBooking = { p -> selected = p; screen = "booking" },
            onHome    = { screen = "home" }
        )
        "booking"   -> selected?.let {
            BookingScreen(provider = it, onBook = { screen = "mybookings" }, onBack = { screen = "browse" })
        }
        "mybookings"-> DashboardScreen(
            onHome = { screen = "home" }, onEscrow = { screen = "home" },
            onNotifications = { screen = "notifications" }
        )
        "notifications" -> NotificationsScreen(apiKey = apiKey, onBack = { screen = "home" })
        "profile"   -> ProfileScreen(userName = userName, apiKey = apiKey,
            role = "consumer", onLogout = onLogout)
    }
}

@Composable
fun ConsumerHome(userName: String, onNavigate: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .verticalScroll(rememberScrollState())
    ) {
        // Top bar
        Row(
            modifier = Modifier.fillMaxWidth().background(BgCard).padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("Hello, ${userName.split(" ").first()} 👋", fontSize = 18.sp,
                    fontWeight = FontWeight.Bold, color = TextPrimary)
                Text("What do you need today?", fontSize = 12.sp, color = TextMuted)
            }
            IconButton(onClick = { onNavigate("notifications") }) {
                Icon(Icons.Default.Notifications, contentDescription = null, tint = AccentBlue)
            }
        }

        Spacer(Modifier.height(20.dp))

        // Hero CTA
        Card(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1a3a5c)),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Find Services Near You", fontSize = 20.sp,
                    fontWeight = FontWeight.Bold, color = TextPrimary)
                Text("Pay with USDC or card · Instant booking",
                    fontSize = 12.sp, color = TextSecond, modifier = Modifier.padding(top = 6.dp, bottom = 16.dp))
                Button(
                    onClick = { onNavigate("browse") },
                    colors = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                    shape = RoundedCornerShape(8.dp)
                ) { Text("Browse Services →", fontWeight = FontWeight.Bold) }
            }
        }

        Spacer(Modifier.height(20.dp))

        // Quick actions
        Text("Quick Actions", fontWeight = FontWeight.Bold, color = TextPrimary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            QuickAction("📋", "My Bookings", Modifier.weight(1f)) { onNavigate("mybookings") }
            QuickAction("🔔", "Alerts", Modifier.weight(1f)) { onNavigate("notifications") }
            QuickAction("👤", "Profile", Modifier.weight(1f)) { onNavigate("profile") }
        }

        Spacer(Modifier.height(20.dp))

        // Feature highlights
        Text("Why AgentPay", fontWeight = FontWeight.Bold, color = TextPrimary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        listOf(
            Triple("💳", "Secure Escrow", "Funds held safely until service is complete"),
            Triple("⚡", "Instant Settlement", "USDC payouts in seconds on Base L2"),
            Triple("🤖", "AI-Powered", "Autonomous booking & payment handling")
        ).forEach { (icon, title, sub) ->
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 6.dp)
                .background(BgCard, RoundedCornerShape(10.dp)).padding(14.dp),
                verticalAlignment = Alignment.CenterVertically) {
                Text(icon, fontSize = 22.sp, modifier = Modifier.padding(end = 12.dp))
                Column {
                    Text(title, fontWeight = FontWeight.Bold, color = TextPrimary, fontSize = 14.sp)
                    Text(sub, fontSize = 11.sp, color = TextMuted)
                }
            }
            Spacer(Modifier.height(6.dp))
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun QuickAction(icon: String, label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Card(modifier = modifier.clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally) {
            Text(icon, fontSize = 24.sp)
            Text(label, fontSize = 11.sp, color = TextSecond,
                modifier = Modifier.padding(top = 4.dp), textAlign = TextAlign.Center)
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// PROVIDER APP
// ══════════════════════════════════════════════════════════════════════════════
@Composable
fun ProviderApp(apiKey: String, userName: String, onLogout: () -> Unit) {
    var screen by remember { mutableStateOf("home") }

    when (screen) {
        "home"          -> ProviderHome(apiKey, userName, onNavigate = { screen = it })
        "escrow"        -> EscrowScreen(apiKey = apiKey, onBack = { screen = "home" })
        "notifications" -> NotificationsScreen(apiKey = apiKey, onBack = { screen = "home" })
        "earnings"      -> EarningsScreen(apiKey = apiKey, onBack = { screen = "home" })
        "profile"       -> ProfileScreen(userName = userName, apiKey = apiKey,
            role = "provider", onLogout = onLogout)
    }
}

@Composable
fun ProviderHome(apiKey: String, userName: String, onNavigate: (String) -> Unit) {
    var balance     by remember { mutableStateOf("—") }
    var pendingCount by remember { mutableStateOf(0) }
    var totalEarned by remember { mutableStateOf("—") }
    val scope = rememberCoroutineScope()

    LaunchedEffect(apiKey) {
        scope.launch {
            try {
                val result = apiCall("GET", "$API_BASE/dashboard", apiKey)
                balance     = "$${result.optDouble("balance_usdc", 0.0)}"
                pendingCount = result.optInt("pending_escrow", 0)
                totalEarned = "$${result.optDouble("total_earned", 0.0)}"
            } catch (e: Exception) { Log.e(TAG, "Dashboard load failed: ${e.message}") }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BgDark)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Box(modifier = Modifier.fillMaxWidth()
            .background(Brush.horizontalGradient(listOf(Color(0xFF1a0a3a), Color(0xFF0f172a))))
            .padding(20.dp)) {
            Column {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("Welcome back 🏢", fontSize = 13.sp, color = TextMuted)
                        Text(userName.split(" ").first(), fontSize = 22.sp,
                            fontWeight = FontWeight.Bold, color = TextPrimary)
                    }
                    Row {
                        if (pendingCount > 0) {
                            Badge(containerColor = Color(0xFFef4444)) {
                                Text("$pendingCount", color = Color.White, fontSize = 10.sp)
                            }
                        }
                        IconButton(onClick = { onNavigate("notifications") }) {
                            Icon(Icons.Default.Notifications, contentDescription = null, tint = AccentBlue)
                        }
                        IconButton(onClick = { onNavigate("profile") }) {
                            Icon(Icons.Default.Person, contentDescription = null, tint = TextMuted)
                        }
                    }
                }

                Spacer(Modifier.height(20.dp))

                // Balance cards
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    StatCard("Balance", balance, AccentBlue, Modifier.weight(1f))
                    StatCard("Earned", totalEarned, AccentGreen, Modifier.weight(1f))
                    StatCard("Pending", "$pendingCount", AccentAmber, Modifier.weight(1f))
                }
            }
        }

        Spacer(Modifier.height(20.dp))

        // Pending alert banner
        if (pendingCount > 0) {
            Card(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
                    .clickable { onNavigate("escrow") },
                colors = CardDefaults.cardColors(containerColor = Color(0xFF422006)),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, AccentAmber.copy(alpha = 0.5f))
            ) {
                Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text("🔔", fontSize = 24.sp)
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text("$pendingCount Booking${if (pendingCount > 1) "s" else ""} Awaiting Response",
                            fontWeight = FontWeight.Bold, color = AccentAmber)
                        Text("Tap to accept or deny", fontSize = 12.sp, color = TextSecond)
                    }
                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = AccentAmber)
                }
            }
            Spacer(Modifier.height(16.dp))
        }

        // Action grid
        Text("Manage", fontWeight = FontWeight.Bold, color = TextPrimary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))

        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ProviderActionCard("📥", "Escrow\nRequests", AccentPurple, Modifier.weight(1f)) { onNavigate("escrow") }
            ProviderActionCard("💰", "Earnings\nHistory", AccentGreen, Modifier.weight(1f)) { onNavigate("earnings") }
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            ProviderActionCard("🔔", "Notifications", AccentBlue, Modifier.weight(1f)) { onNavigate("notifications") }
            ProviderActionCard("👤", "Profile &\nSettings", TextMuted, Modifier.weight(1f)) { onNavigate("profile") }
        }

        Spacer(Modifier.height(24.dp))

        // API key display
        Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            shape = RoundedCornerShape(12.dp)) {
            Column(Modifier.padding(16.dp)) {
                Text("Your API Key", fontSize = 12.sp, color = TextMuted)
                Text(apiKey.take(16) + "••••••••", fontSize = 13.sp,
                    color = AccentBlue, fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(top = 4.dp))
                Text("Use this key to connect AI agents and external services",
                    fontSize = 11.sp, color = TextMuted, modifier = Modifier.padding(top = 4.dp))
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
fun StatCard(label: String, value: String, color: Color, modifier: Modifier) {
    Card(modifier = modifier, colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(10.dp)) {
        Column(Modifier.padding(10.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(value, fontWeight = FontWeight.Bold, color = color, fontSize = 16.sp)
            Text(label, fontSize = 10.sp, color = TextMuted, textAlign = TextAlign.Center)
        }
    }
}

@Composable
fun ProviderActionCard(icon: String, label: String, color: Color, modifier: Modifier, onClick: () -> Unit) {
    Card(modifier = modifier.height(90.dp).clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = BgCard),
        shape = RoundedCornerShape(12.dp)) {
        Column(modifier = Modifier.fillMaxSize().padding(14.dp),
            verticalArrangement = Arrangement.Center) {
            Text(icon, fontSize = 26.sp)
            Text(label, fontSize = 12.sp, color = color, fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(top = 4.dp))
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// SHARED SCREENS
// ══════════════════════════════════════════════════════════════════════════════
@Composable
fun EarningsScreen(apiKey: String, onBack: () -> Unit) {
    var transactions by remember { mutableStateOf(listOf<Triple<String,String,String>>()) }
    var totalEarned  by remember { mutableStateOf("0.00") }
    var loading      by remember { mutableStateOf(true) }
    val scope        = rememberCoroutineScope()

    LaunchedEffect(apiKey) {
        scope.launch {
            try {
                val result = apiCall("GET", "$API_BASE/transactions", apiKey)
                val list   = result.optJSONArray("transactions")
                val txList = mutableListOf<Triple<String,String,String>>()
                if (list != null) {
                    for (i in 0 until list.length()) {
                        val tx = list.getJSONObject(i)
                        txList.add(Triple(
                            tx.optString("type", "payment"),
                            tx.optString("amount_usdc", "0"),
                            tx.optString("created_at", "")
                        ))
                    }
                }
                transactions = txList
                totalEarned  = result.optString("total_earned", "0.00")
            } catch (e: Exception) { Log.e(TAG, "Transactions load failed") }
            loading = false
        }
    }

    Column(Modifier.fillMaxSize().background(BgDark)) {
        // Header
        Row(Modifier.fillMaxWidth().background(BgCard).padding(16.dp),
            verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = AccentBlue,
                modifier = Modifier.clickable(onClick = onBack))
            Text("Earnings", fontWeight = FontWeight.Bold, color = TextPrimary,
                fontSize = 18.sp, modifier = Modifier.padding(start = 12.dp))
        }

        // Total earned card
        Card(modifier = Modifier.fillMaxWidth().padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF052e16)),
            shape = RoundedCornerShape(12.dp)) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text("Total Earned", fontSize = 13.sp, color = TextMuted)
                Text("$$totalEarned USDC", fontSize = 28.sp,
                    fontWeight = FontWeight.Bold, color = AccentGreen)
            }
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AccentBlue)
            }
        } else if (transactions.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No transactions yet", color = TextMuted)
            }
        } else {
            LazyColumn(Modifier.fillMaxSize().padding(horizontal = 16.dp)) {
                items(transactions) { (type, amount, date) ->
                    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp)
                        .background(BgCard, RoundedCornerShape(8.dp)).padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(if (type == "escrow_release") "✅" else "💸", fontSize = 18.sp)
                            Text(type.replace("_", " ").replaceFirstChar { it.uppercase() },
                                color = TextPrimary, modifier = Modifier.padding(start = 10.dp))
                        }
                        Text("+$$amount", fontWeight = FontWeight.Bold, color = AccentGreen)
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(userName: String, apiKey: String, role: String, onLogout: () -> Unit) {
    Column(
        modifier = Modifier.fillMaxSize().background(BgDark)
            .verticalScroll(rememberScrollState())
    ) {
        // Avatar header
        Box(modifier = Modifier.fillMaxWidth().background(BgCard).padding(24.dp),
            contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Box(Modifier.size(72.dp).background(AccentBlue.copy(alpha = 0.2f), CircleShape),
                    contentAlignment = Alignment.Center) {
                    Text(userName.firstOrNull()?.uppercase() ?: "?", fontSize = 32.sp,
                        fontWeight = FontWeight.Bold, color = AccentBlue)
                }
                Spacer(Modifier.height(12.dp))
                Text(userName, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
                Text(role.replaceFirstChar { it.uppercase() }, fontSize = 13.sp, color = TextMuted)
            }
        }

        Spacer(Modifier.height(20.dp))

        // API Key section
        Card(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
            colors = CardDefaults.cardColors(containerColor = BgCard),
            shape = RoundedCornerShape(12.dp)) {
            Column(Modifier.padding(16.dp)) {
                Text("API Key", fontSize = 12.sp, color = TextMuted)
                Text(apiKey, fontSize = 11.sp, color = AccentBlue,
                    modifier = Modifier.padding(top = 6.dp))
            }
        }

        Spacer(Modifier.height(12.dp))

        // Links
        listOf(
            Triple("🌐", "AgentPay Website", "https://www.x402-agent-pay.com"),
            Triple("📖", "API Documentation", "https://agentworld.me/api-docs"),
            Triple("💬", "Support", "mailto:support@x402-agent-pay.com")
        ).forEach { (icon, label, _) ->
            Row(modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 4.dp)
                .background(BgCard, RoundedCornerShape(10.dp)).padding(16.dp).clickable {},
                verticalAlignment = Alignment.CenterVertically) {
                Text(icon, fontSize = 18.sp, modifier = Modifier.padding(end = 12.dp))
                Text(label, color = TextPrimary, modifier = Modifier.weight(1f))
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = TextMuted)
            }
            Spacer(Modifier.height(4.dp))
        }

        Spacer(Modifier.height(24.dp))

        // Logout
        Button(
            onClick = onLogout,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp).height(48.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7f1d1d)),
            shape = RoundedCornerShape(10.dp)
        ) {
            Icon(Icons.Default.ExitToApp, contentDescription = null,
                modifier = Modifier.padding(end = 8.dp))
            Text("Sign Out", fontWeight = FontWeight.Bold)
        }
        Spacer(Modifier.height(32.dp))
    }
}

@Composable
fun NotificationsScreen(apiKey: String, onBack: () -> Unit) {
    var notifications by remember { mutableStateOf(listOf<Notification>()) }
    var loading by remember { mutableStateOf(true) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(apiKey) {
        scope.launch {
            try {
                val result = apiCall("GET", "$API_BASE/notifications", apiKey)
                val list   = result.optJSONArray("notifications")
                val items  = mutableListOf<Notification>()
                if (list != null) {
                    for (i in 0 until list.length()) {
                        val n = list.getJSONObject(i)
                        items.add(Notification(
                            id = n.optInt("id"), title = n.optString("title"),
                            body = n.optString("body"), type = n.optString("type"),
                            createdAt = n.optString("created_at"), read = n.optBoolean("read")
                        ))
                    }
                }
                notifications = items
            } catch (e: Exception) { Log.e(TAG, "Notifications load failed") }
            loading = false
        }
    }

    Column(Modifier.fillMaxSize().background(BgDark)) {
        Row(Modifier.fillMaxWidth().background(BgCard).padding(16.dp),
            verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = AccentBlue,
                modifier = Modifier.clickable(onClick = onBack))
            Text("Notifications", fontWeight = FontWeight.Bold, color = TextPrimary,
                fontSize = 18.sp, modifier = Modifier.padding(start = 12.dp))
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AccentBlue)
            }
        } else if (notifications.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔔", fontSize = 48.sp)
                    Text("No notifications yet", color = TextMuted,
                        modifier = Modifier.padding(top = 12.dp))
                }
            }
        } else {
            LazyColumn(Modifier.fillMaxSize().padding(16.dp)) {
                items(notifications) { notif ->
                    val icon = when {
                        notif.type.contains("escrow") -> "📥"
                        notif.type.contains("accept") -> "✅"
                        notif.type.contains("deny")   -> "❌"
                        else -> "🔔"
                    }
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp)
                        .background(
                            if (notif.read) BgCard else BgCardAlt,
                            RoundedCornerShape(10.dp)
                        ).padding(14.dp)) {
                        Text(icon, fontSize = 20.sp, modifier = Modifier.padding(end = 12.dp, top = 2.dp))
                        Column {
                            Text(notif.title, fontWeight = FontWeight.Bold,
                                color = if (notif.read) TextSecond else TextPrimary)
                            Text(notif.body, fontSize = 12.sp, color = TextMuted,
                                modifier = Modifier.padding(top = 3.dp))
                        }
                    }
                }
            }
        }
    }
}

// Keep existing consumer screens (MarketplaceScreen, BookingScreen, DashboardScreen)
// from original MainActivity.kt — they still compile and work as-is

// ══════════════════════════════════════════════════════════════════════════════
// API HELPER
// ══════════════════════════════════════════════════════════════════════════════
suspend fun apiCall(method: String, url: String, apiKey: String, body: String? = null): JSONObject =
    withContext(Dispatchers.IO) {
        val conn = URL(url).openConnection() as HttpsURLConnection
        conn.requestMethod = method
        conn.setRequestProperty("Content-Type", "application/json")
        if (apiKey.isNotEmpty()) conn.setRequestProperty("X-AgentPay-Key", apiKey)
        conn.connectTimeout = 10000
        conn.readTimeout    = 10000
        if (body != null) {
            conn.doOutput = true
            conn.outputStream.write(body.toByteArray())
        }
        val response = try { conn.inputStream.bufferedReader().readText() }
                       catch (e: Exception) { conn.errorStream?.bufferedReader()?.readText() ?: "{}" }
        JSONObject(response)
    }


// ── Preserved consumer screens ──
@Composable
fun MarketplaceScreen(onBooking: (Provider) -> Unit, onHome: () -> Unit) {
    var searchQuery by remember { mutableStateOf("") }
    val providers = listOf(
        Provider("p1", "Pro Salon", "Haircut", 25.0, 4.8f, 42, 0.3, "123 Main St", "555-0001"),
        Provider("p2", "Quick Mechanic", "Oil Change", 45.0, 4.9f, 156, 0.5, "456 Oak Ave", "555-0002"),
        Provider("p3", "Dental Clinic", "Cleaning", 80.0, 4.7f, 89, 0.2, "789 Pine Rd", "555-0003"),
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onHome() }
            )
            Text("Services", color = Color.White, fontWeight = FontWeight.Bold)
            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF60a5fa))
        }

        // Search
        TextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search services...", color = Color(0xFF94a3b8)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(15.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF1e293b),
                unfocusedContainerColor = Color(0xFF1e293b),
                focusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp)
        )

        // Provider List
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 15.dp)
        ) {
            items(providers.filter { it.name.contains(searchQuery, ignoreCase = true) }) { provider ->
                ProviderCard(provider) { onBooking(provider) }
            }
        }
    }
}

@Composable
fun ProviderCard(provider: Provider, onBook: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
            .clickable { onBook() },
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(15.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(provider.name, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(provider.service, fontSize = 12.sp, color = Color(0xFFcbd5e1))
                }
                Text("$${provider.price}", fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
            }
            
            Spacer(modifier = Modifier.height(10.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("⭐", fontSize = 14.sp)
                    Text("${provider.rating} (${provider.reviews})", fontSize = 12.sp, color = Color(0xFFcbd5e1))
                }
                Text("${provider.distance} mi away", fontSize = 12.sp, color = Color(0xFFcbd5e1))
            }
        }
    }
}

@Composable
fun BookingScreen(provider: Provider, onBook: () -> Unit, onBack: () -> Unit) {
    var selectedDate by remember { mutableStateOf("") }
    var selectedTime by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onBack() }
            )
            Text("Book Service", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 10.dp))
        }

        Column(modifier = Modifier.padding(20.dp)) {
            // Provider Info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(modifier = Modifier.padding(15.dp)) {
                    Text(provider.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                    Text(provider.service, color = Color(0xFFcbd5e1), fontSize = 14.sp)
                    Text("${provider.address} • ${provider.phone}", color = Color(0xFF94a3b8), fontSize = 12.sp, modifier = Modifier.padding(top = 10.dp))
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Date Selection
            Text("Select Date", fontWeight = FontWeight.Bold, color = Color.White)
            TextField(
                value = selectedDate,
                onValueChange = { selectedDate = it },
                placeholder = { Text("YYYY-MM-DD", color = Color(0xFF94a3b8)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1e293b),
                    unfocusedContainerColor = Color(0xFF1e293b)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(15.dp))

            // Time Selection
            Text("Select Time", fontWeight = FontWeight.Bold, color = Color.White)
            TextField(
                value = selectedTime,
                onValueChange = { selectedTime = it },
                placeholder = { Text("HH:MM", color = Color(0xFF94a3b8)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1e293b),
                    unfocusedContainerColor = Color(0xFF1e293b)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(30.dp))

            // Price Summary
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e2e3b)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(modifier = Modifier.padding(15.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Service", color = Color(0xFFcbd5e1))
                        Text("$${provider.price}", color = Color(0xFFcbd5e1))
                    }
                    Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Fee", color = Color(0xFFcbd5e1))
                        Text("$${(provider.price * 0.025).toInt()}", color = Color(0xFFcbd5e1))
                    }
                    Divider(modifier = Modifier.padding(vertical = 10.dp), color = Color(0xFF334155))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total", fontWeight = FontWeight.Bold, color = Color.White)
                        Text("$${(provider.price * 1.025).toInt()}", fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Book Button
            Button(
                onClick = { onBook() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10b981)),
                shape = RoundedCornerShape(8.dp),
                enabled = selectedDate.isNotEmpty() && selectedTime.isNotEmpty()
            ) {
                Text("Confirm Booking", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DashboardScreen(onHome: () -> Unit, onEscrow: () -> Unit = {}, onNotifications: () -> Unit = {}) {
    val bookings = listOf(
        Booking("b1", "Pro Salon", "2026-04-15", "14:30", 25.0, "Confirmed"),
        Booking("b2", "Quick Mechanic", "2026-04-18", "10:00", 45.0, "Pending")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onHome() }
            )
            Text("My Bookings", color = Color.White, fontWeight = FontWeight.Bold)
            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF60a5fa))
        }

        // Stats
        Row(modifier = Modifier
            .fillMaxWidth()
            .padding(15.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatCard("${bookings.size}", "Total Bookings")
            StatCard("$${bookings.sumOf { it.amount }}", "Spent")
            StatCard("${bookings.count { it.status == "Confirmed" }}", "Completed")
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick Actions — Escrow + Notifications
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 15.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onEscrow,
                colors  = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                shape   = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(52.dp)
            ) {
                Text("💼 Escrow", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Button(
                onClick = onNotifications,
                colors  = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F2040)),
                shape   = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(52.dp)
            ) {
                Text("🔔 Alerts", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        // Booking List
        LazyColumn(modifier = Modifier.padding(horizontal = 15.dp)) {
            items(bookings) { booking ->
                BookingCard(booking)
            }
        }
    }
}

@Composable
fun FeatureCard(icon: String, title: String, subtitle: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth(0.85f)
            .background(Color(0xFF1e293b), RoundedCornerShape(8.dp))
            .padding(15.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(icon, fontSize = 24.sp, modifier = Modifier.padding(end = 15.dp))
        Column {
            Text(title, fontWeight = FontWeight.Bold, color = Color.White)
            Text(subtitle, fontSize = 12.sp, color = Color(0xFFcbd5e1))
        }
    }
    Spacer(modifier = Modifier.height(15.dp))
}