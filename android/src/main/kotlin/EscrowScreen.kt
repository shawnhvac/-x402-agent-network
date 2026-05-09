package com.agentpay

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

// ─── COLORS ───────────────────────────────────────────────────────────────────
val DarkBg      = Color(0xFF060D1A)
val CardBg      = Color(0xFF080F1E)
val BorderColor = Color(0xFF1E3A5F)
val AccentBlue  = Color(0xFF6366F1)
val AccentGreen = Color(0xFF34D399)
val AccentAmber = Color(0xFFF59E0B)
val AccentRed   = Color(0xFFEF4444)
val TextMuted   = Color(0xFF64748B)
val TextSub     = Color(0xFF94A3B8)

const val API_BASE = "https://www.x402-agent-pay.com/api/agentpay"

// ─── DATA MODELS ──────────────────────────────────────────────────────────────
data class EscrowItem(
    val id: String,
    val role: String,          // "payer" or "payee"
    val amount: Double,
    val payout: Double,
    val fee: Double,
    val description: String,
    val status: String,
    val payerId: String,
    val payeeId: String,
    val createdAt: Long,
    val expiresAt: Long,
    val expired: Boolean
)

data class Notification(
    val id: Int,
    val type: String,
    val title: String,
    val body: String,
    val read: Boolean,
    val createdAt: Long
)

data class BusinessEndpoint(
    val id: String,
    val name: String,
    val type: String,
    val description: String,
    val walletAddress: String
)

// ─── API HELPERS ──────────────────────────────────────────────────────────────
object AgentPayApi {
    fun get(path: String, apiKey: String): JSONObject {
        val url = URL("$API_BASE$path")
        val conn = url.openConnection() as HttpsURLConnection
        conn.setRequestProperty("X-AgentPay-Key", apiKey)
        conn.setRequestProperty("Accept", "application/json")
        conn.connectTimeout = 10000
        conn.readTimeout = 10000
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        return JSONObject(stream.bufferedReader().readText())
    }

    fun post(path: String, apiKey: String, body: JSONObject): JSONObject {
        val url = URL("$API_BASE$path")
        val conn = url.openConnection() as HttpsURLConnection
        conn.requestMethod = "POST"
        conn.setRequestProperty("Content-Type", "application/json")
        conn.setRequestProperty("X-AgentPay-Key", apiKey)
        conn.doOutput = true
        conn.connectTimeout = 10000
        conn.readTimeout = 10000
        val bytes = body.toString().toByteArray()
        conn.outputStream.write(bytes)
        val code = conn.responseCode
        val stream = if (code in 200..299) conn.inputStream else conn.errorStream
        return JSONObject(stream.bufferedReader().readText())
    }
}

// ─── ESCROW SCREEN ─────────────────────────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EscrowScreen(apiKey: String, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var escrows by remember { mutableStateOf<List<EscrowItem>>(emptyList()) }
    var pendingCount by remember { mutableIntStateOf(0) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }
    var selectedTab by remember { mutableIntStateOf(0) }  // 0=All, 1=Incoming, 2=Outgoing
    var actionMsg by remember { mutableStateOf("") }
    var actionMsgColor by remember { mutableStateOf(AccentGreen) }

    fun loadEscrows() {
        scope.launch {
            loading = true; error = ""
            try {
                val resp = withContext(Dispatchers.IO) {
                    AgentPayApi.get("/escrow/list", apiKey)
                }
                val arr = resp.getJSONArray("escrows")
                val list = mutableListOf<EscrowItem>()
                for (i in 0 until arr.length()) {
                    val e = arr.getJSONObject(i)
                    list.add(EscrowItem(
                        id          = e.getString("id"),
                        role        = e.getString("role"),
                        amount      = e.getDouble("amount"),
                        payout      = e.getDouble("payout"),
                        fee         = e.getDouble("fee"),
                        description = e.optString("description","Service booking"),
                        status      = e.getString("status"),
                        payerId     = e.getString("payer_id"),
                        payeeId     = e.getString("payee_id"),
                        createdAt   = e.getLong("created_at"),
                        expiresAt   = e.getLong("expires_at"),
                        expired     = e.optBoolean("expired", false)
                    ))
                }
                escrows      = list
                pendingCount = resp.optInt("pending_count", 0)
            } catch (ex: Exception) {
                error = "Failed to load escrows"
            }
            loading = false
        }
    }

    fun acceptEscrow(escrowId: String) {
        scope.launch {
            try {
                val resp = withContext(Dispatchers.IO) {
                    AgentPayApi.post("/escrow/accept", apiKey,
                        JSONObject().put("escrow_id", escrowId))
                }
                if (resp.optBoolean("success")) {
                    actionMsg      = "✅ Accepted! ${resp.optDouble("payout")} USDC added to balance"
                    actionMsgColor = AccentGreen
                    loadEscrows()
                } else {
                    actionMsg      = "❌ ${resp.optString("error","Accept failed")}"
                    actionMsgColor = AccentRed
                }
            } catch (ex: Exception) {
                actionMsg = "❌ Network error"
                actionMsgColor = AccentRed
            }
        }
    }

    fun denyEscrow(escrowId: String) {
        scope.launch {
            try {
                val resp = withContext(Dispatchers.IO) {
                    AgentPayApi.post("/escrow/deny", apiKey,
                        JSONObject().put("escrow_id", escrowId).put("reason","Not available"))
                }
                if (resp.optBoolean("success")) {
                    actionMsg      = "Denied. Full refund sent to payer."
                    actionMsgColor = AccentAmber
                    loadEscrows()
                } else {
                    actionMsg      = "❌ ${resp.optString("error","Deny failed")}"
                    actionMsgColor = AccentRed
                }
            } catch (ex: Exception) {
                actionMsg = "❌ Network error"
                actionMsgColor = AccentRed
            }
        }
    }

    LaunchedEffect(Unit) { loadEscrows() }

    val filtered = when (selectedTab) {
        1 -> escrows.filter { it.role == "payee" }
        2 -> escrows.filter { it.role == "payer" }
        else -> escrows
    }

    Column(
        Modifier.fillMaxSize().background(DarkBg)
    ) {
        // Top bar
        Row(
            Modifier.fillMaxWidth().background(CardBg)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, null, tint = TextSub)
            }
            Text("Escrow & Bookings", fontWeight = FontWeight.Bold,
                fontSize = 18.sp, color = Color.White, modifier = Modifier.weight(1f))
            if (pendingCount > 0) {
                Badge(containerColor = AccentRed) {
                    Text("$pendingCount", color = Color.White, fontSize = 11.sp)
                }
            }
            IconButton(onClick = { loadEscrows() }) {
                Icon(Icons.Default.Refresh, null, tint = TextSub)
            }
        }

        // Action message
        if (actionMsg.isNotEmpty()) {
            Box(Modifier.fillMaxWidth().background(
                if (actionMsgColor == AccentGreen) Color(0xFF0C2A1A)
                else if (actionMsgColor == AccentRed) Color(0xFF1F0A0A)
                else Color(0xFF1A1200)
            ).padding(14.dp)) {
                Text(actionMsg, color = actionMsgColor, fontSize = 14.sp)
            }
        }

        // Tabs
        TabRow(selectedTabIndex = selectedTab,
               containerColor = CardBg, contentColor = AccentBlue) {
            listOf("All", "Incoming", "Outgoing").forEachIndexed { i, label ->
                Tab(selected = selectedTab == i, onClick = { selectedTab = i }) {
                    Text(label, modifier = Modifier.padding(vertical = 12.dp),
                        fontSize = 13.sp,
                        color = if (selectedTab == i) AccentBlue else TextMuted)
                }
            }
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AccentBlue)
            }
        } else if (error.isNotEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(error, color = AccentRed)
            }
        } else if (filtered.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("💼", fontSize = 40.sp)
                    Spacer(Modifier.height(12.dp))
                    Text("No escrows yet", color = TextMuted, fontSize = 15.sp)
                    Text("Bookings will appear here", color = TextMuted, fontSize = 13.sp)
                }
            }
        } else {
            LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp),
                       verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(filtered) { esc ->
                    EscrowCard(esc,
                        onAccept = { acceptEscrow(esc.id) },
                        onDeny   = { denyEscrow(esc.id) })
                }
            }
        }
    }
}

// ─── ESCROW CARD ───────────────────────────────────────────────────────────────
@Composable
fun EscrowCard(esc: EscrowItem, onAccept: () -> Unit, onDeny: () -> Unit) {
    val statusColor = when {
        esc.status == "accepted"              -> AccentGreen
        esc.status == "denied"               -> AccentRed
        esc.expired || esc.status == "expired" -> TextMuted
        else                                 -> AccentAmber
    }
    val statusLabel = when {
        esc.expired && esc.status == "pending" -> "Expired"
        else -> esc.status.replaceFirstChar { it.uppercase() }
    }
    val roleLabel = if (esc.role == "payee") "📥 Incoming" else "📤 Outgoing"

    Card(
        colors    = CardDefaults.cardColors(containerColor = CardBg),
        shape     = RoundedCornerShape(14.dp),
        modifier  = Modifier.fillMaxWidth()
    ) {
        Column(Modifier.padding(18.dp)) {
            // Header row
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(roleLabel, fontSize = 12.sp, color = TextMuted, fontWeight = FontWeight.Bold)
                Surface(shape = RoundedCornerShape(20.dp),
                        color = statusColor.copy(alpha = 0.15f)) {
                    Text(statusLabel, color = statusColor, fontSize = 11.sp,
                         fontWeight = FontWeight.Bold,
                         modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp))
                }
            }
            Spacer(Modifier.height(10.dp))

            // Description
            Text(esc.description, fontSize = 15.sp, fontWeight = FontWeight.Bold,
                 color = Color.White)
            Spacer(Modifier.height(8.dp))

            // Amount row
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("Amount", fontSize = 11.sp, color = TextMuted)
                    Text("${esc.amount} USDC", fontSize = 16.sp,
                         fontWeight = FontWeight.Bold, color = Color.White)
                }
                if (esc.role == "payee" && esc.status == "pending") {
                    Column(horizontalAlignment = Alignment.End) {
                        Text("You receive", fontSize = 11.sp, color = TextMuted)
                        Text("${esc.payout} USDC", fontSize = 16.sp,
                             fontWeight = FontWeight.Bold, color = AccentGreen)
                    }
                }
            }

            if (esc.fee > 0 && esc.role == "payee") {
                Text("Platform fee: ${esc.fee} USDC", fontSize = 11.sp,
                     color = TextMuted, modifier = Modifier.padding(top = 4.dp))
            }

            // ID
            Text("ID: ${esc.id.take(20)}...", fontSize = 10.sp, color = TextMuted,
                 modifier = Modifier.padding(top = 6.dp))

            // Accept / Deny buttons (only for pending incoming)
            if (esc.role == "payee" && esc.status == "pending" && !esc.expired) {
                Spacer(Modifier.height(14.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Button(
                        onClick = onAccept,
                        colors  = ButtonDefaults.buttonColors(containerColor = AccentGreen),
                        shape   = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Check, null, Modifier.size(16.dp))
                        Spacer(Modifier.width(6.dp))
                        Text("Accept", fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    OutlinedButton(
                        onClick = onDeny,
                        border  = androidx.compose.foundation.BorderStroke(1.dp, AccentRed),
                        shape   = RoundedCornerShape(10.dp),
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(Icons.Default.Close, null, Modifier.size(16.dp), tint = AccentRed)
                        Spacer(Modifier.width(6.dp))
                        Text("Deny", fontWeight = FontWeight.Bold, color = AccentRed)
                    }
                }
            }
        }
    }
}

// ─── NOTIFICATIONS SCREEN ──────────────────────────────────────────────────────
@Composable
fun NotificationsScreen(apiKey: String, onBack: () -> Unit) {
    val scope = rememberCoroutineScope()
    var notifications by remember { mutableStateOf<List<Notification>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    fun load() {
        scope.launch {
            loading = true
            try {
                val resp = withContext(Dispatchers.IO) {
                    AgentPayApi.get("/notifications", apiKey)
                }
                val arr = resp.getJSONArray("notifications")
                val list = mutableListOf<Notification>()
                for (i in 0 until arr.length()) {
                    val n = arr.getJSONObject(i)
                    list.add(Notification(
                        id        = n.getInt("id"),
                        type      = n.getString("type"),
                        title     = n.getString("title"),
                        body      = n.getString("body"),
                        read      = n.getInt("read") == 1,
                        createdAt = n.getLong("created_at")
                    ))
                }
                notifications = list
                // Mark all read
                withContext(Dispatchers.IO) {
                    AgentPayApi.post("/notifications/mark-read", apiKey, JSONObject())
                }
            } catch (ex: Exception) { /* silent */ }
            loading = false
        }
    }

    LaunchedEffect(Unit) { load() }

    Column(Modifier.fillMaxSize().background(DarkBg)) {
        Row(Modifier.fillMaxWidth().background(CardBg)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, null, tint = TextSub)
            }
            Text("Notifications", fontWeight = FontWeight.Bold,
                fontSize = 18.sp, color = Color.White)
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = AccentBlue)
            }
        } else if (notifications.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("🔔", fontSize = 40.sp)
                    Spacer(Modifier.height(12.dp))
                    Text("No notifications yet", color = TextMuted, fontSize = 15.sp)
                }
            }
        } else {
            LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(16.dp),
                       verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(notifications) { notif ->
                    val icon = when {
                        notif.type.contains("accept") -> "✅"
                        notif.type.contains("deny")   -> "❌"
                        notif.type.contains("expire") -> "⏰"
                        notif.type.contains("escrow") -> "💰"
                        else -> "🔔"
                    }
                    Card(colors = CardDefaults.cardColors(
                             containerColor = if (notif.read) CardBg
                             else Color(0xFF0D1F3A)),
                         shape = RoundedCornerShape(12.dp),
                         modifier = Modifier.fillMaxWidth()) {
                        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.Top) {
                            Text(icon, fontSize = 22.sp, modifier = Modifier.padding(end = 12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(notif.title, fontWeight = FontWeight.Bold,
                                     fontSize = 14.sp, color = Color.White)
                                Text(notif.body, fontSize = 13.sp, color = TextSub,
                                     modifier = Modifier.padding(top = 4.dp))
                            }
                        }
                    }
                }
            }
        }
    }
}
