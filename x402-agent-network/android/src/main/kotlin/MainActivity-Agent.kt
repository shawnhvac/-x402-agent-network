package com.agentpay

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import android.util.Log
import android.content.Context
import android.widget.Toast
import com.agentpay.agents.AgentIntegration
import com.agentpay.agents.AgentConfig
import kotlinx.coroutines.launch

/**
 * MainActivity - AGENT VERSION
 * 
 * This version initializes and displays the autonomous agent system
 * instead of just user UI.
 */

class MainActivityAgent : ComponentActivity() {
    
    private var agent: AgentIntegration? = null
    private val TAG = "AgentPayMain"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        Log.d(TAG, "🚀 AgentPay App Starting (Agent Edition)")
        
        // Request permissions
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
                .launch(Manifest.permission.RECORD_AUDIO)
        }
        
        // Initialize agent
        val config = AgentConfig(
            autoStart = true,
            port = 8000,
            rpcEndpoint = "https://api.mainnet-beta.solana.com",
            maxRequestAmount = 100.0,
            minRequestAmount = 0.5,
            requiredMinBalance = 10.0
        )
        
        agent = AgentIntegration(this, config)
        
        if (!agent!!.initialize()) {
            Log.e(TAG, "❌ Agent initialization failed")
            Toast.makeText(this, "Agent initialization failed", Toast.LENGTH_LONG).show()
            return
        }
        
        Log.d(TAG, "✅ Agent initialized successfully")
        
        if (!agent!!.start()) {
            Log.e(TAG, "❌ Agent failed to start")
            Toast.makeText(this, "Agent failed to start", Toast.LENGTH_LONG).show()
            return
        }
        
        Log.d(TAG, "✅ Agent started successfully on port 8000")
        
        setContent {
            AgentPayAgentApp(this, agent!!)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        agent?.stop()
        Log.d(TAG, "✅ Agent stopped")
    }
}

@Composable
fun AgentPayAgentApp(context: Context, agent: AgentIntegration) {
    
    var agentStatus by remember { mutableStateOf(agent.getStatus()) }
    var agentStats by remember { mutableStateOf(agent.getStatistics()) }
    var currentTab by remember { mutableStateOf(0) }
    var statusText by remember { mutableStateOf("Initializing...") }
    val scope = rememberCoroutineScope()
    
    // Update status every 5 seconds
    LaunchedEffect(Unit) {
        while (true) {
            try {
                agentStatus = agent.getStatus()
                agentStats = agent.getStatistics()
                statusText = when {
                    agentStatus.isRunning -> "✅ Agent Running - Port 8000 Active"
                    else -> "⏸️ Agent Stopped"
                }
            } catch (e: Exception) {
                Log.e("AgentPayAgentApp", "Error updating status: ${e.message}")
            }
            kotlinx.coroutines.delay(5000)
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp),
            color = Color(0xFF1e293b)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "🤖 AgentPay Agent",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF60a5fa)
                )
                Text(
                    statusText,
                    fontSize = 12.sp,
                    color = if (agentStatus.isRunning) Color(0xFF10b981) else Color(0xFFef4444)
                )
            }
        }
        
        // Content
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(16.dp)
                .verticalScroll(rememberScrollState())
        ) {
            when (currentTab) {
                0 -> AgentStatusTab(agentStatus, statusText)
                1 -> AgentStatsTab(agentStats)
                2 -> AgentConfigTab(agent)
            }
        }
        
        // Bottom Navigation
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(80.dp),
            color = Color(0xFF1e293b)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TabButton("Status", currentTab == 0) { currentTab = 0 }
                TabButton("Stats", currentTab == 1) { currentTab = 1 }
                TabButton("Config", currentTab == 2) { currentTab = 2 }
            }
        }
    }
}

@Composable
fun AgentStatusTab(status: com.agentpay.agents.AgentStatus, statusText: String) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Status Card
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            color = Color(0xFF1e293b),
            shape = RoundedCornerShape(8.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3b82f6))
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    statusText,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (status.isRunning) Color(0xFF10b981) else Color(0xFFef4444)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Agent Address
                Text(
                    "Agent Address:",
                    fontSize = 12.sp,
                    color = Color(0xFF94a3b8)
                )
                Text(
                    status.agentAddress?.take(20) + "..." ?: "Unknown",
                    fontSize = 14.sp,
                    color = Color(0xFF60a5fa),
                    fontWeight = FontWeight.Bold
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Balance
                Text(
                    "Balance: ${status.balance} USDC",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10b981)
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                // Requests
                Text(
                    "Total Requests: ${status.totalRequests}",
                    fontSize = 14.sp,
                    color = Color(0xFF cbd5e1)
                )
                Text(
                    "Accepted: ${status.acceptedRequests} | Completed: ${status.completedTransactions}",
                    fontSize = 12.sp,
                    color = Color(0xFF94a3b8)
                )
            }
        }
        
        // Info Box
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            color = Color(0xFF0f4c81),
            shape = RoundedCornerShape(8.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "🤖 Agent System Active",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF60a5fa)
                )
                Text(
                    "HTTP API listening on port 8000\nReceiving booking requests autonomously\nNo human input required",
                    fontSize = 12.sp,
                    color = Color(0xFF cbd5e1),
                    lineHeight = 1.5.sp
                )
            }
        }
    }
}

@Composable
fun AgentStatsTab(stats: org.json.JSONObject) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            "Agent Statistics",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF60a5fa),
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        StatCard("Total Requests", stats.optInt("totalRequests", 0).toString(), Color(0xFF60a5fa))
        StatCard("Accepted", stats.optInt("acceptedRequests", 0).toString(), Color(0xFF10b981))
        StatCard("Rejected", stats.optInt("rejectedRequests", 0).toString(), Color(0xFFef4444))
        StatCard("Countered", stats.optInt("counteredRequests", 0).toString(), Color(0xFFf59e0b))
        StatCard("Balance", "${stats.optDouble("currentBalance", 0.0)} USDC", Color(0xFF10b981))
        StatCard("Acceptance Rate", "${stats.optInt("acceptanceRate", 0)}%", Color(0xFF8b5cf6))
    }
}

@Composable
fun StatCard(label: String, value: String, color: Color) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        color = Color(0xFF1e293b),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(label, color = Color(0xFF cbd5e1), fontSize = 14.sp)
            Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }
    }
}

@Composable
fun AgentConfigTab(agent: AgentIntegration) {
    Column(
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            "Agent Configuration",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF60a5fa),
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        val health = agent.healthCheck()
        
        ConfigCard("Status", health.optString("status", "unknown"), Color(0xFF10b981))
        ConfigCard("Port", health.optString("port", "8000"), Color(0xFF60a5fa))
        ConfigCard("Initialized", health.optBoolean("initialized", false).toString(), Color(0xFF8b5cf6))
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            "Agent Features:",
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF60a5fa),
            modifier = Modifier.padding(bottom = 8.dp)
        )
        
        FeatureItem("✅ Autonomous Decision Making")
        FeatureItem("✅ SmartEscrow Integration")
        FeatureItem("✅ Transaction Signing")
        FeatureItem("✅ RPC Integration")
        FeatureItem("✅ HTTP API (6 endpoints)")
        FeatureItem("✅ Statistics Tracking")
    }
}

@Composable
fun ConfigCard(label: String, value: String, color: Color) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        color = Color(0xFF1e293b),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(label, color = Color(0xFF cbd5e1), fontSize = 14.sp)
            Text(value, color = color, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
    }
}

@Composable
fun FeatureItem(text: String) {
    Text(
        text,
        fontSize = 12.sp,
        color = Color(0xFF cbd5e1),
        modifier = Modifier.padding(vertical = 4.dp)
    )
}

@Composable
fun TabButton(label: String, isSelected: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .width(80.dp)
            .height(48.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (isSelected) Color(0xFF60a5fa) else Color(0xFF334155)
        ),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

fun generateWalletAddress(): String {
    return "agent_" + (0..31).map { (('a'..'f') + ('0'..'9')).random() }.joinToString("")
}
