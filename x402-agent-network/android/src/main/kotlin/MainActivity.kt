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
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.agentpay.solana.MultiWalletManager
import com.agentpay.agents.AgentIntegration
import com.agentpay.agents.AgentConfig
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private lateinit var walletManager: MultiWalletManager
    private var agent: AgentIntegration? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        walletManager = MultiWalletManager(this)
        
        // Initialize autonomous agent system
        try {
            val config = AgentConfig(
                autoStart = true,
                port = 8000,
                rpcEndpoint = "https://api.mainnet-beta.solana.com",
                maxRequestAmount = 100.0,
                minRequestAmount = 0.5,
                requiredMinBalance = 10.0
            )
            agent = AgentIntegration(this, config)
            
            if (agent!!.initialize()) {
                Log.d("AgentPay", "✅ Agent initialized")
                if (agent!!.start()) {
                    Log.d("AgentPay", "✅ Agent started on port 8000")
                } else {
                    Log.e("AgentPay", "❌ Failed to start agent")
                }
            } else {
                Log.e("AgentPay", "❌ Failed to initialize agent")
            }
        } catch (e: Exception) {
            Log.e("AgentPay", "❌ Agent initialization error: ${e.message}", e)
        }
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { }
                .launch(Manifest.permission.RECORD_AUDIO)
        }
        
        setContent {
            AgentPayApp(this, walletManager, agent)
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        agent?.stop()
        Log.d("AgentPay", "✅ Agent stopped")
    }
}

@Composable
fun AgentPayApp(context: Context, walletManager: MultiWalletManager, agent: AgentIntegration?) {
    var currentTab by remember { mutableStateOf(0) }
    var walletAddress by remember { mutableStateOf("") }
    var isWalletConnected by remember { mutableStateOf(false) }
    var selectedWalletType by remember { mutableStateOf<MultiWalletManager.WalletType?>(null) }
    var showWalletSelector by remember { mutableStateOf(false) }
    var installedWallets by remember { mutableStateOf(listOf<MultiWalletManager.WalletInfo>()) }
    var showWalletModal by remember { mutableStateOf(false) }
    var agentStatus by remember { mutableStateOf(agent?.getStatus()) }
    val scope = rememberCoroutineScope()
    
    // Load wallet state on app start
    LaunchedEffect(Unit) {
        isWalletConnected = walletManager.isWalletConnected()
        selectedWalletType = walletManager.getConnectedWalletType()
        walletAddress = walletManager.getConnectedWalletAddress() ?: generateWalletAddress()
        installedWallets = walletManager.discoverInstalledWallets()
        
        Log.d("AgentPay", "🟢 App started - Wallets detected: ${installedWallets.size}")
        installedWallets.forEach {
            Log.d("AgentPay", "   ✅ ${it.displayName} installed")
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
                    "🤖 AgentPay",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF60a5fa)
                )
                
                // Wallet status indicator
                if (isWalletConnected && selectedWalletType != null) {
                    Chip(
                        onClick = { showWalletModal = true },
                        colors = ChipDefaults.chipColors(
                            containerColor = Color(0xFF10b981)
                        ),
                        modifier = Modifier.height(36.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text("✅ ${selectedWalletType?.name}", fontSize = 12.sp)
                        }
                    }
                } else {
                    Button(
                        onClick = { showWalletModal = true },
                        modifier = Modifier.height(36.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF3b82f6)
                        )
                    ) {
                        Text("Connect Wallet", fontSize = 12.sp)
                    }
                }
            }
        }
        
        // Tab content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
        ) {
            when (currentTab) {
                0 -> VoiceTab(context, isWalletConnected)
                1 -> SettingsTab()
                2 -> HistoryTab()
                3 -> WalletTab(walletAddress, isWalletConnected, { showWalletModal = true })
                4 -> AgentTab(agent)
            }
        }
        
        // Bottom navigation
        NavigationBar(
            modifier = Modifier.fillMaxWidth(),
            containerColor = Color(0xFF1e293b)
        ) {
            NavigationBarItem(
                icon = { Text("🎤", fontSize = 20.sp) },
                label = { Text("Voice", fontSize = 11.sp) },
                selected = currentTab == 0,
                onClick = { currentTab = 0 }
            )
            NavigationBarItem(
                icon = { Text("⚙️", fontSize = 20.sp) },
                label = { Text("Settings", fontSize = 11.sp) },
                selected = currentTab == 1,
                onClick = { currentTab = 1 }
            )
            NavigationBarItem(
                icon = { Text("📋", fontSize = 20.sp) },
                label = { Text("History", fontSize = 11.sp) },
                selected = currentTab == 2,
                onClick = { currentTab = 2 }
            )
            NavigationBarItem(
                icon = { Text("💰", fontSize = 20.sp) },
                label = { Text("Wallet", fontSize = 11.sp) },
                selected = currentTab == 3,
                onClick = { currentTab = 3 }
            )
            NavigationBarItem(
                icon = { Text("🤖", fontSize = 20.sp) },
                label = { Text("Agent", fontSize = 11.sp) },
                selected = currentTab == 4,
                onClick = { currentTab = 4 }
            )
        }
    }
    
    // Wallet selection modal
    if (showWalletModal) {
        WalletSelectionModal(
            installedWallets = installedWallets,
            isConnected = isWalletConnected,
            currentWallet = selectedWalletType,
            onWalletSelected = { wallet ->
                scope.launch {
                    if (walletManager.connectWallet(wallet.type)) {
                        isWalletConnected = true
                        selectedWalletType = wallet.type
                        walletAddress = generateWalletAddress() // Mock address
                        showWalletModal = false
                        Toast.makeText(context, "✅ Connected to ${wallet.displayName}", Toast.LENGTH_SHORT).show()
                        Log.d("AgentPay", "✅ Connected to ${wallet.displayName}")
                    } else {
                        Toast.makeText(context, "❌ Failed to connect wallet", Toast.LENGTH_SHORT).show()
                    }
                }
            },
            onDisconnect = {
                walletManager.disconnectWallet()
                isWalletConnected = false
                selectedWalletType = null
                showWalletModal = false
                Toast.makeText(context, "Wallet disconnected", Toast.LENGTH_SHORT).show()
            },
            onDismiss = { showWalletModal = false }
        )
    }
}

@Composable
fun WalletSelectionModal(
    installedWallets: List<MultiWalletManager.WalletInfo>,
    isConnected: Boolean,
    currentWallet: MultiWalletManager.WalletType?,
    onWalletSelected: (MultiWalletManager.WalletInfo) -> Unit,
    onDisconnect: () -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isConnected) "Wallet Connected" else "Select Wallet") },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                if (installedWallets.isEmpty()) {
                    Text("❌ No wallets installed.\n\nInstall Phantom, Solflare, or Jupiter wallet app to continue.")
                } else {
                    installedWallets.forEach { wallet ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onWalletSelected(wallet) }
                                .padding(8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (currentWallet == wallet.type) Color(0xFF10b981) else Color(0xFF1e293b)
                            ),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(wallet.displayName, fontWeight = FontWeight.Bold)
                                    Text("${wallet.packageName}", fontSize = 10.sp, color = Color.Gray)
                                }
                                if (currentWallet == wallet.type) {
                                    Text("✅", fontSize = 18.sp)
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (isConnected) {
                Button(onClick = onDisconnect, colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFef4444))) {
                    Text("Disconnect")
                }
            }
        },
        dismissButton = {
            Button(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}

@Composable
fun VoiceTab(context: Context, isWalletConnected: Boolean) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            if (isWalletConnected) "🎤 Ready to Book" else "⚠️ Connect Wallet First",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = if (isWalletConnected) Color(0xFF10b981) else Color(0xFFf59e0b)
        )
        
        if (isWalletConnected) {
            Button(
                onClick = { Toast.makeText(context, "Say: 'Book HVAC in Phoenix'", Toast.LENGTH_LONG).show() },
                modifier = Modifier
                    .size(120.dp)
                    .background(Color(0xFF3b82f6), CircleShape),
                shape = CircleShape
            ) {
                Text("🎤", fontSize = 48.sp)
            }
            
            Text("Tap mic and say:\n'Book [SERVICE] in [LOCATION]'", fontSize = 14.sp, color = Color.Gray)
        } else {
            Text("Connect wallet to book services", fontSize = 14.sp, color = Color.Gray)
        }
    }
}

@Composable
fun SettingsTab() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("⚙️ Settings", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("Coming soon...", fontSize = 14.sp, color = Color.Gray)
    }
}

@Composable
fun HistoryTab() {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("📋 History", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        Text("No transactions yet", fontSize = 14.sp, color = Color.Gray)
    }
}

@Composable
fun WalletTab(walletAddress: String, isConnected: Boolean, onConnect: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text("💰 Wallet", fontSize = 20.sp, fontWeight = FontWeight.Bold)
        
        if (isConnected) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Wallet Address", fontSize = 12.sp, color = Color.Gray)
                    Text(walletAddress.take(12) + "...", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("0.00 SOL (placeholder)", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
                }
            }
            
            Text("⚠️ Wallet integration in progress", fontSize = 12.sp, color = Color(0xFFf59e0b))
        } else {
            Text("Connect wallet to see balance", fontSize = 14.sp, color = Color.Gray)
            Button(onClick = onConnect, modifier = Modifier.fillMaxWidth()) {
                Text("Connect Wallet")
            }
        }
    }
}

@Composable
fun AgentTab(agent: AgentIntegration?) {
    var agentStatus by remember { mutableStateOf(agent?.getStatus()) }
    var agentStats by remember { mutableStateOf(agent?.getStatistics()) }
    
    // Update status every 5 seconds
    LaunchedEffect(Unit) {
        while (true) {
            try {
                agentStatus = agent?.getStatus()
                agentStats = agent?.getStatistics()
            } catch (e: Exception) {
                Log.e("AgentTab", "Error updating status: ${e.message}")
            }
            kotlinx.coroutines.delay(5000)
        }
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text("🤖 Agent System", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF60a5fa))
        
        if (agent == null) {
            Text("Agent not initialized", fontSize = 14.sp, color = Color(0xFFef4444))
            return@Column
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        // Status Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF3b82f6))
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Status:", color = Color(0xFF cbd5e1), fontSize = 14.sp)
                    Text(
                        if (agentStatus?.isRunning == true) "✅ RUNNING" else "⏸️ STOPPED",
                        fontWeight = FontWeight.Bold,
                        color = if (agentStatus?.isRunning == true) Color(0xFF10b981) else Color(0xFFef4444),
                        fontSize = 14.sp
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text("Port: 8000 (HTTP API)", fontSize = 12.sp, color = Color(0xFF94a3b8))
                
                if (agentStatus?.agentAddress != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Address:", fontSize = 12.sp, color = Color(0xFF94a3b8))
                    Text(agentStatus!!.agentAddress!!.take(25) + "...", fontSize = 11.sp, color = Color(0xFF60a5fa))
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Stats
        Text("Statistics", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF60a5fa))
        
        agentStats?.let { stats ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatRow("Total Requests", stats.optInt("totalRequests", 0).toString(), Color(0xFF60a5fa))
                    StatRow("Accepted", stats.optInt("acceptedRequests", 0).toString(), Color(0xFF10b981))
                    StatRow("Rejected", stats.optInt("rejectedRequests", 0).toString(), Color(0xFFef4444))
                    StatRow("Balance", "${stats.optDouble("currentBalance", 0.0)} USDC", Color(0xFF10b981))
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Features
        Text("Features", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF60a5fa))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                FeatureRow("✅ Autonomous Decisions")
                FeatureRow("✅ SmartEscrow Integration")
                FeatureRow("✅ Transaction Signing")
                FeatureRow("✅ HTTP API (6 endpoints)")
                FeatureRow("✅ Real-time Monitoring")
            }
        }
    }
}

@Composable
fun StatRow(label: String, value: String, color: Color) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, fontSize = 12.sp, color = Color(0xFF cbd5e1))
        Text(value, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@Composable
fun FeatureRow(feature: String) {
    Text(feature, fontSize = 12.sp, color = Color(0xFF cbd5e1))
}

fun generateWalletAddress(): String {
    return "AgentPay_" + (System.currentTimeMillis() % 1000000).toString()
}
