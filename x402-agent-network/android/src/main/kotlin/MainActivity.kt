package com.agentpay

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
                "AgentPay™",
                fontSize = 28.sp,
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
    Column(
        modifier = Modifier
            .fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("🎤 Voice Commands", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("Tap to book a service", fontSize = 14.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 8.dp))
        
        Button(
            onClick = {},
            modifier = Modifier
                .padding(top = 24.dp)
                .size(100.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text("🎤", fontSize = 40.sp)
        }
    }
}

@Composable
fun SettingsScreen() {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        Text("⚙️ Settings", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Budget Limit", color = Color(0xFF94A3B8))
                Text("$1,000/month", color = Color(0xFFA78BFA), fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun HistoryScreen() {
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        Text("📋 History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("No transactions yet", fontSize = 14.sp, color = Color(0xFF94A3B8), modifier = Modifier.padding(top = 16.dp))
    }
}

@Composable
fun WalletScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("💰 Wallet", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        Text("0.50 SOL", fontSize = 48.sp, fontWeight = FontWeight.Bold, color = Color(0xFF06B6D4), modifier = Modifier.padding(top = 24.dp))
        
        Button(
            onClick = {},
            modifier = Modifier
                .padding(top = 40.dp)
                .fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text("Top Up", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
    }
}
