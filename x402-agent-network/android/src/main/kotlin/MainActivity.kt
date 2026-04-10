package com.agentpay.personal

import android.content.Context
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.SpeechRecognizer
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.agentpay.personal.api.AgentPayApiService
import com.agentpay.personal.models.*
import com.agentpay.personal.solana.SolanaWalletManager
import com.agentpay.personal.viewmodels.MainViewModel
import kotlinx.coroutines.launch
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class MainActivity : ComponentActivity() {
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var solanaWalletManager: SolanaWalletManager
    private lateinit var apiService: AgentPayApiService

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize Solana wallet
        solanaWalletManager = SolanaWalletManager(this)
        
        // Initialize AgentPay API client
        val retrofit = Retrofit.Builder()
            .baseUrl("https://x402-agent-pay.com/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(AgentPayApiService::class.java)
        
        // Initialize speech recognizer
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        
        setContent {
            AgentPayTheme {
                MainScreen(
                    solanaWalletManager = solanaWalletManager,
                    apiService = apiService,
                    speechRecognizer = speechRecognizer,
                    context = this
                )
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer.destroy()
    }
}

@Composable
fun AgentPayTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = darkColorScheme(
            primary = Color(0xFFA78BFA),      // Purple
            secondary = Color(0xFF06B6D4),    // Cyan
            background = Color(0xFF0F172A),   // Dark blue
            surface = Color(0xFF1E293B),      // Slate
        )
    ) {
        content()
    }
}

@Composable
fun MainScreen(
    solanaWalletManager: SolanaWalletManager,
    apiService: AgentPayApiService,
    speechRecognizer: SpeechRecognizer,
    context: Context,
    viewModel: MainViewModel = viewModel()
) {
    val scrollState = rememberScrollState()
    var currentTab by remember { mutableStateOf(0) }
    var isListening by remember { mutableStateOf(false) }
    var recognizedText by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    
    var walletAddress by remember { mutableStateOf("") }
    var walletBalance by remember { mutableStateOf("0.00 SOL") }
    var agents by remember { mutableStateOf<List<AgentProfile>>(emptyList()) }
    var selectedAgent by remember { mutableStateOf<AgentProfile?>(null) }
    var escrowStatus by remember { mutableStateOf("Ready") }
    
    // Initialize wallet on launch
    LaunchedEffect(Unit) {
        walletAddress = solanaWalletManager.getWalletAddress()
        walletBalance = solanaWalletManager.getWalletBalance()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .verticalScroll(scrollState)
    ) {
        // Header
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .height(60.dp),
            color = Color(0xFF1E293B)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "AgentPay™",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFA78BFA)
                )
                Text(
                    "v1.0.0",
                    fontSize = 12.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }

        when (currentTab) {
            0 -> VoiceCommandScreen(
                isListening = isListening,
                recognizedText = recognizedText,
                onStartListening = {
                    isListening = true
                    startVoiceRecognition(
                        speechRecognizer,
                        onResult = { text ->
                            recognizedText = text
                            isListening = false
                            // Process voice command
                            coroutineScope.launch {
                                processVoiceCommand(
                                    text,
                                    apiService,
                                    solanaWalletManager,
                                    { newAgents -> agents = newAgents },
                                    { agent -> selectedAgent = agent },
                                    { status -> escrowStatus = status }
                                )
                            }
                        }
                    )
                },
                selectedAgent = selectedAgent,
                escrowStatus = escrowStatus
            )
            1 -> PreferencesScreen(
                walletAddress = walletAddress,
                walletBalance = walletBalance,
                onUpdatePreferences = { preferences ->
                    // Save preferences to database
                    viewModel.saveUserPreferences(preferences)
                }
            )
            2 -> HistoryScreen(
                transactions = viewModel.transactions.collectAsState().value
            )
            3 -> WalletScreen(
                address = walletAddress,
                balance = walletBalance,
                onTopUp = { amount ->
                    coroutineScope.launch {
                        solanaWalletManager.topUpWallet(amount)
                        walletBalance = solanaWalletManager.getWalletBalance()
                    }
                }
            )
        }

        Spacer(modifier = Modifier.height(80.dp))
    }

    // Bottom Navigation
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp)
            .align(Alignment.BottomCenter),
        color = Color(0xFF1E293B)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NavigationButton(
                icon = Icons.Filled.Mic,
                label = "Voice",
                isSelected = currentTab == 0,
                onClick = { currentTab = 0 }
            )
            NavigationButton(
                icon = Icons.Filled.Settings,
                label = "Settings",
                isSelected = currentTab == 1,
                onClick = { currentTab = 1 }
            )
            NavigationButton(
                icon = Icons.Filled.History,
                label = "History",
                isSelected = currentTab == 2,
                onClick = { currentTab = 2 }
            )
            NavigationButton(
                icon = Icons.Filled.Wallet,
                label = "Wallet",
                isSelected = currentTab == 3,
                onClick = { currentTab = 3 }
            )
        }
    }
}

@Composable
fun VoiceCommandScreen(
    isListening: Boolean,
    recognizedText: String,
    onStartListening: () -> Unit,
    selectedAgent: AgentProfile?,
    escrowStatus: String
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(40.dp))

        // Large microphone button
        Button(
            onClick = onStartListening,
            modifier = Modifier
                .size(120.dp),
            shape = MaterialTheme.shapes.extraLarge,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFA78BFA),
                disabledContainerColor = Color(0xFF64748B)
            ),
            enabled = !isListening
        ) {
            Icon(
                Icons.Filled.Mic,
                contentDescription = "Voice Command",
                modifier = Modifier.size(60.dp),
                tint = Color(0xFF0F172A)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            if (isListening) "Listening..." else "Tap to speak",
            fontSize = 18.sp,
            color = if (isListening) Color(0xFF06B6D4) else Color(0xFF94A3B8)
        )

        Spacer(modifier = Modifier.height(32.dp))

        if (recognizedText.isNotEmpty()) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Recognized Command:", fontSize = 14.sp, color = Color(0xFF94A3B8))
                    Text(
                        recognizedText,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFA78BFA),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (selectedAgent != null) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Matched Agent:", fontSize = 14.sp, color = Color(0xFF94A3B8))
                    Text(
                        selectedAgent.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF06B6D4),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                    Text(
                        "Service: ${selectedAgent.serviceType}",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                    Text(
                        "Rating: ${selectedAgent.reputation}%",
                        fontSize = 12.sp,
                        color = Color(0xFF10B981),
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (escrowStatus != "Ready") {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Transaction Status:", fontSize = 14.sp, color = Color(0xFF94A3B8))
                    Text(
                        escrowStatus,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF10B981),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun PreferencesScreen(
    walletAddress: String,
    walletBalance: String,
    onUpdatePreferences: (UserPreferences) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Text("Settings", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Spacer(modifier = Modifier.height(24.dp))

        SettingCard("Budget Limit", "$1,000/month")
        SettingCard("Service Types", "Mechanic, HVAC, Plumbing")
        SettingCard("Location", "Phoenix, AZ 85001")
        SettingCard("Preferred Hours", "9 AM - 6 PM")
        
        Spacer(modifier = Modifier.height(24.dp))

        Text("Wallet Info", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF06B6D4))
        SettingCard("Address", walletAddress.take(12) + "...")
        SettingCard("Balance", walletBalance)
    }
}

@Composable
fun HistoryScreen(transactions: List<Transaction>) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
    ) {
        Text("Transaction History", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Spacer(modifier = Modifier.height(16.dp))

        if (transactions.isEmpty()) {
            Text("No transactions yet", color = Color(0xFF94A3B8))
        } else {
            transactions.forEach { tx ->
                TransactionCard(tx)
                Spacer(modifier = Modifier.height(12.dp))
            }
        }
    }
}

@Composable
fun WalletScreen(
    address: String,
    balance: String,
    onTopUp: (Double) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Wallet", fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
        
        Spacer(modifier = Modifier.height(40.dp))

        Text(
            balance,
            fontSize = 48.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF06B6D4)
        )

        Text(
            address,
            fontSize = 12.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(top = 16.dp)
        )

        Spacer(modifier = Modifier.height(40.dp))

        Button(
            onClick = { onTopUp(10.0) },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA78BFA))
        ) {
            Text("Top Up Wallet", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun NavigationButton(
    icon: androidx.compose.material.icons.materialIcon,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable(onClick = onClick)
            .padding(8.dp)
    ) {
        Icon(
            icon,
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = if (isSelected) Color(0xFFA78BFA) else Color(0xFF64748B)
        )
        Text(
            label,
            fontSize = 10.sp,
            color = if (isSelected) Color(0xFFA78BFA) else Color(0xFF64748B),
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}

@Composable
fun SettingCard(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFF1E293B), shape = MaterialTheme.shapes.medium)
            .padding(16.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, color = Color(0xFF94A3B8), fontSize = 14.sp)
        Text(value, color = Color(0xFFA78BFA), fontSize = 14.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
fun TransactionCard(transaction: Transaction) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(transaction.agentName, fontWeight = FontWeight.Bold, color = Color(0xFFA78BFA))
                Text(transaction.serviceType, fontSize = 12.sp, color = Color(0xFF94A3B8))
            }
            Text("${transaction.amount} SOL", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
        }
    }
}

fun startVoiceRecognition(
    speechRecognizer: SpeechRecognizer,
    onResult: (String) -> Unit
) {
    val intent = android.content.Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH)
    intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
    
    speechRecognizer.setRecognitionListener(object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) {}
        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) {}
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {}
        override fun onError(error: Int) {}
        override fun onResults(results: Bundle?) {
            val matches = results?.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION)
            if (matches != null && matches.isNotEmpty()) {
                onResult(matches[0])
            }
        }
        override fun onPartialResults(partialResults: Bundle?) {}
        override fun onEvent(eventType: Int, params: Bundle?) {}
    })
    
    speechRecognizer.startListening(intent)
}

suspend fun processVoiceCommand(
    command: String,
    apiService: AgentPayApiService,
    solanaWalletManager: SolanaWalletManager,
    onAgentsFound: (List<AgentProfile>) -> Unit,
    onAgentSelected: (AgentProfile) -> Unit,
    onEscrowStatusChanged: (String) -> Unit
) {
    try {
        // Parse voice command: "Book mechanic" → serviceType = "Mechanic"
        val serviceType = extractServiceType(command)
        
        onEscrowStatusChanged("Searching agents...")
        
        // Query AgentPay API
        val agents = apiService.searchAgents(
            ServiceQuery(
                serviceType = serviceType,
                latitude = 33.4484,  // Default: Phoenix, AZ
                longitude = -112.0742,
                budget = 500.0
            )
        )
        
        onAgentsFound(agents)
        
        if (agents.isNotEmpty()) {
            val selectedAgent = agents[0]  // NegotiationEngine would pick best
            onAgentSelected(selectedAgent)
            
            onEscrowStatusChanged("Creating escrow...")
            
            // Create SmartEscrow on Solana
            val escrowTx = solanaWalletManager.createEscrow(
                agentPublicKey = selectedAgent.walletAddress,
                amount = 100.0,  // Service cost
                description = command
            )
            
            onEscrowStatusChanged("Escrow locked: ${escrowTx.substring(0, 12)}...")
        }
    } catch (e: Exception) {
        onEscrowStatusChanged("Error: ${e.message}")
    }
}

fun extractServiceType(command: String): String {
    return when {
        command.contains("mechanic", ignoreCase = true) -> "Mechanic"
        command.contains("hvac", ignoreCase = true) -> "HVAC"
        command.contains("plumb", ignoreCase = true) -> "Plumber"
        command.contains("electric", ignoreCase = true) -> "Electrician"
        command.contains("carpen", ignoreCase = true) -> "Carpenter"
        else -> "Service"
    }
}
