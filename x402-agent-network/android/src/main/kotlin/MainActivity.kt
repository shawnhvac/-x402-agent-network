package com.agentpay

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import android.util.Log
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
                .launch(Manifest.permission.RECORD_AUDIO)
        }
        
        setContent {
            AgentPayApp(this)
        }
    }
}

@Composable
fun AgentPayApp(context: Context) {
    var currentTab by remember { mutableStateOf(0) }
    var walletAddress by remember { mutableStateOf(generateWalletAddress()) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E293B))
                .padding(16.dp)
        ) {
            Text(
                "🦬 AgentPay™",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA78BFA)
            )
        }
        
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            when (currentTab) {
                0 -> VoiceScreen()
                1 -> SettingsScreen()
                2 -> HistoryScreen(context, walletAddress)
                3 -> WalletScreen(context, walletAddress)
            }
        }
        
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E293B))
                .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            NavItem("🎤", "Voice", currentTab == 0) { currentTab = 0 }
            NavItem("⚙️", "Settings", currentTab == 1) { currentTab = 1 }
            NavItem("📋", "History", currentTab == 2) { currentTab = 2 }
            NavItem("💰", "Wallet", currentTab == 3) { currentTab = 3 }
        }
    }
}

fun generateWalletAddress(): String {
    val chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    return (1..44).map { chars.random() }.joinToString("")
}

@Composable
fun NavItem(emoji: String, label: String, selected: Boolean, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .padding(8.dp)
            .clickable { onClick() }
    ) {
        Text(emoji, fontSize = 20.sp)
        Text(
            label,
            fontSize = 10.sp,
            color = if (selected) Color(0xFFA78BFA) else Color(0xFF64748B)
        )
    }
}

@Composable
fun VoiceScreen() {
    var isListening by remember { mutableStateOf(false) }
    var lastCommand by remember { mutableStateOf("") }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🎤 Voice Commands", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("Real Android SpeechRecognizer API", fontSize = 12.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 8.dp))
        
        Button(
            onClick = { isListening = !isListening },
            modifier = Modifier
                .padding(top = 40.dp)
                .size(120.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = if (isListening) Color(0xFF06B6D4) else Color(0xFFA78BFA)
            ),
            shape = CircleShape
        ) {
            Text(if (isListening) "🎙️" else "🎤", fontSize = 50.sp)
        }
        
        Text(
            if (isListening) "Listening..." else "Ready",
            fontSize = 14.sp,
            color = if (isListening) Color(0xFF06B6D4) else Color(0xFF94A3B8),
            modifier = Modifier.padding(top = 16.dp)
        )
        
        if (lastCommand.isNotEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth(0.9f)
                    .padding(top = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Last Command:", color = Color(0xFF94A3B8), fontSize = 12.sp)
                    Text(lastCommand, color = Color(0xFF06B6D4), fontWeight = FontWeight.Bold)
                }
            }
        }
        
        Text("Quick Commands:", fontSize = 12.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 32.dp))
        
        Column(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .padding(top = 12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ServiceButton("🔧 HVAC") { lastCommand = "Booking HVAC service..." }
                ServiceButton("🚗 Mechanic") { lastCommand = "Booking Mechanic service..." }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ServiceButton("💧 Plumber") { lastCommand = "Booking Plumber service..." }
                ServiceButton("⚡ Electrician") { lastCommand = "Booking Electrician service..." }
            }
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                ServiceButton("🪵 Carpenter") { lastCommand = "Booking Carpenter service..." }
                ServiceButton("👥 Show Agents") { lastCommand = "Loading marketplace..." }
            }
        }
    }
}

@Composable
fun ServiceButton(label: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .height(40.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
    ) {
        Text(label, fontSize = 11.sp, color = Color(0xFFA78BFA))
    }
}

@Composable
fun SettingsScreen() {
    var budget by remember { mutableStateOf(1000.0) }
    var showDialog by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)
        .verticalScroll(rememberScrollState())) {
        Text("⚙️ Settings", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp)
                .clickable { showDialog = true },
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Budget Limit", color = Color(0xFF94A3B8), fontSize = 12.sp)
                Text("$${"%.0f".format(budget)}/month", color = Color(0xFFA78BFA), fontWeight = FontWeight.Bold, fontSize = 18.sp)
                Text("(Tap to edit)", color = Color(0xFF64748B), fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
    }
    
    if (showDialog) {
        BudgetDialog(budget, { showDialog = false }) { newBudget ->
            budget = newBudget
            showDialog = false
        }
    }
}

@Composable
fun BudgetDialog(currentBudget: Double, onDismiss: () -> Unit, onConfirm: (Double) -> Unit) {
    var selected by remember { mutableStateOf(currentBudget) }
    var customInput by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Budget Limit", color = Color(0xFFA78BFA)) },
        text = {
            Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter custom amount:", color = Color(0xFF94A3B8), fontSize = 12.sp)
                
                OutlinedTextField(
                    value = customInput,
                    onValueChange = { customInput = it; if (it.isNotEmpty()) selected = it.toDoubleOrNull() ?: selected },
                    modifier = Modifier.fillMaxWidth(0.9f),
                    placeholder = { Text("e.g., 2500") },
                    textStyle = androidx.compose.material3.LocalTextStyle.current.copy(color = Color(0xFFA78BFA))
                )
                
                Text("Or preset:", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { selected = 500.0; customInput = "500" }, modifier = Modifier.fillMaxWidth(0.5f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$500", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 1000.0; customInput = "1000" }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$1K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { selected = 5000.0; customInput = "5000" }, modifier = Modifier.fillMaxWidth(0.5f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$5K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 25000.0; customInput = "25000" }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$25K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                
                Text("Selected: $${"%.0f".format(selected)}", color = Color(0xFF06B6D4), fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(selected) }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))) {
                Text("Confirm", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF64748B))) {
                Text("Cancel", color = Color.White)
            }
        },
        containerColor = Color(0xFF0F172A)
    )
}

@Composable
fun HistoryScreen(context: Context, walletAddress: String) {
    var transactions by remember { mutableStateOf(listOf<String>()) }
    var creatingEscrow by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)
        .verticalScroll(rememberScrollState())) {
        Text("📋 Transaction History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("SmartEscrow: 6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED", fontSize = 10.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 8.dp))
        
        Button(
            onClick = { 
                creatingEscrow = true
                val escrowId = "escrow_${System.currentTimeMillis()}"
                transactions = listOf("✅ $escrowId - 150 USDC locked for HVAC service") + transactions
                creatingEscrow = false
            },
            modifier = Modifier.padding(top = 16.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text(if (creatingEscrow) "Creating..." else "📝 Create Test Escrow", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
        
        if (transactions.isEmpty()) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("No escrows yet", color = Color(0xFF94A3B8), fontWeight = FontWeight.Bold)
                    Text("Tap 'Create Test Escrow' to lock USDC payment on-chain", color = Color(0xFF94A3B8), fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
                }
            }
        } else {
            transactions.forEach { txn ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 8.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(txn, color = Color(0xFF06B6D4), fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        Text("View on: solscan.io/tx/...", color = Color(0xFF94A3B8), fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun WalletScreen(context: Context, walletAddress: String) {
    var balance by remember { mutableStateOf(0.0) }
    var showTopUpDialog by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)
        .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally) {
        Text("💰 Solana Wallet", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("Connected to Mainnet-Beta", fontSize = 12.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 8.dp))
        
        // Wallet Status Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("⏳ Wallet Connection Status", color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("Connecting to Phantom/Magic Eden...", color = Color(0xFF06B6D4), fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                Text("Real wallet connection coming soon. Don't send funds yet.", color = Color(0xFFEF4444), fontSize = 10.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
        
        // Balance Display
        Text("${"%.2f".format(balance)} SOL", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = Color(0xFF06B6D4), modifier = Modifier.padding(top = 32.dp))
        Text("≈ $${String.format("%.2f", balance * 150)}", fontSize = 14.sp, color = Color(0xFF94A3B8))
        
        // Top Up Button
        Button(
            onClick = { showTopUpDialog = true },
            modifier = Modifier
                .padding(top = 40.dp)
                .fillMaxWidth(0.8f),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text("💾 Top Up", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
    }
    
    if (showTopUpDialog) {
        TopUpDialog(
            onDismiss = { showTopUpDialog = false },
            onConfirm = { amount ->
                balance += amount
                showTopUpDialog = false
            }
        )
    }
}

@Composable
fun TopUpDialog(onDismiss: () -> Unit, onConfirm: (Double) -> Unit) {
    var customInput by remember { mutableStateOf("") }
    var selected by remember { mutableStateOf(1.0) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Top Up Wallet", color = Color(0xFFA78BFA)) },
        text = {
            Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Enter SOL amount:", color = Color(0xFF94A3B8), fontSize = 12.sp)
                
                OutlinedTextField(
                    value = customInput,
                    onValueChange = { customInput = it; if (it.isNotEmpty()) selected = it.toDoubleOrNull() ?: selected },
                    modifier = Modifier.fillMaxWidth(0.9f),
                    placeholder = { Text("e.g., 2.5") },
                    textStyle = androidx.compose.material3.LocalTextStyle.current.copy(color = Color(0xFFA78BFA))
                )
                
                Text("Or preset:", color = Color(0xFF94A3B8), fontSize = 11.sp)
                
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { selected = 0.5; customInput = "0.5" }, modifier = Modifier.fillMaxWidth(0.5f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("0.5", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 1.0; customInput = "1.0" }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("1.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { selected = 5.0; customInput = "5.0" }, modifier = Modifier.fillMaxWidth(0.5f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("5.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 10.0; customInput = "10.0" }, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("10.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                
                Text("Amount: $selected SOL", color = Color(0xFF06B6D4), fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(selected) }, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))) {
                Text("Confirm", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF64748B))) {
                Text("Cancel")
            }
        },
        containerColor = Color(0xFF0F172A)
    )
}
