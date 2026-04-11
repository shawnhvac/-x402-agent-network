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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import android.util.Log

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Request permissions
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
                .launch(Manifest.permission.RECORD_AUDIO)
        }
        
        setContent {
            AgentPayApp()
        }
    }
}

@Composable
fun AgentPayApp() {
    var currentTab by remember { mutableStateOf(0) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1E293B))
                .padding(16.dp)
        ) {
            Text(
                "🦬 AgentPay™ - Solana",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA78BFA)
            )
        }
        
        // Content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            when (currentTab) {
                0 -> VoiceScreen()
                1 -> SettingsScreen()
                2 -> HistoryScreen()
                3 -> WalletScreen()
            }
        }
        
        // Bottom Navigation
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
            .fillMaxSize(),
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
        
        Row(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .padding(top = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            QuickButton("🔧 HVAC") { lastCommand = "Book HVAC service" }
            QuickButton("🚗 Mechanic") { lastCommand = "Book mechanic service" }
        }
    }
}

@Composable
fun QuickButton(label: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier.height(40.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))
    ) {
        Text(label, fontSize = 10.sp, color = Color(0xFFA78BFA))
    }
}

@Composable
fun SettingsScreen() {
    var budget by remember { mutableStateOf(1000.0) }
    var showDialog by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
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
        
        Card(modifier = Modifier.fillMaxWidth().padding(top = 16.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Notifications", color = Color(0xFF94A3B8), fontSize = 12.sp)
                Text("✅ Enabled", color = Color(0xFF06B6D4), fontWeight = FontWeight.Bold)
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
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Budget Limit", color = Color(0xFFA78BFA)) },
        text = {
            Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(onClick = { selected = 500.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$500", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 1000.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$1K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 8.dp)) {
                    Button(onClick = { selected = 5000.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$5K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 25000.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("$25K", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                Text("Selected: $${"%.0f".format(selected)}", color = Color(0xFF06B6D4), fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 16.dp))
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
fun HistoryScreen() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("📋 Transaction History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Card(modifier = Modifier.fillMaxWidth().padding(top = 24.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("SmartEscrow Ready", color = Color(0xFF06B6D4), fontWeight = FontWeight.Bold)
                Text("Program: 6Pi1hfuX...", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                Text("Transactions will appear here", color = Color(0xFF94A3B8), fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
    }
}

@Composable
fun WalletScreen() {
    var balance by remember { mutableStateOf(10.5) }
    var showDialog by remember { mutableStateOf(false) }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text("💰 Solana Wallet", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Text("${"%.2f".format(balance)} SOL", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = Color(0xFF06B6D4), modifier = Modifier.padding(top = 32.dp))
        
        Button(
            onClick = { showDialog = true },
            modifier = Modifier
                .padding(top = 40.dp)
                .fillMaxWidth(0.8f),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text("Top Up", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
    }
    
    if (showDialog) {
        TopUpDialog({ showDialog = false }) { amount ->
            balance += amount
            showDialog = false
        }
    }
}

@Composable
fun TopUpDialog(onDismiss: () -> Unit, onConfirm: (Double) -> Unit) {
    var selected by remember { mutableStateOf(1.0) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Top Up", color = Color(0xFFA78BFA)) },
        text = {
            Column(modifier = Modifier.padding(8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Button(onClick = { selected = 0.5 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("0.5", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 1.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("1.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 8.dp)) {
                    Button(onClick = { selected = 5.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("5.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                    Button(onClick = { selected = 10.0 }, modifier = Modifier.weight(1f), colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF1E293B))) { Text("10.0", fontSize = 10.sp, color = Color(0xFFA78BFA)) }
                }
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
