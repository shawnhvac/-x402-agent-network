package com.agentpay.personal

import android.Manifest
import android.content.Intent
import android.os.Bundle
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontSize
import androidx.compose.ui.unit.dp
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.AccountBalanceWallet
import com.agentpay.personal.ui.theme.AgentPayTheme
import com.agentpay.personal.viewmodel.AgentViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: AgentViewModel by viewModels()
    private var speechRecognizer: SpeechRecognizer? = null
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Initialize speech recognizer
        if (SpeechRecognizer.isRecognitionAvailable(this)) {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)
        }
        
        setContent {
            AgentPayTheme {
                AgentHomeScreen(viewModel, onSpeechStarted = ::startListening)
            }
        }
    }
    
    private fun startListening() {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-US")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "What do you need?")
        }
        
        speechRecognizer?.startListening(intent)
    }
    
    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer?.destroy()
    }
}

@Composable
fun AgentHomeScreen(
    viewModel: AgentViewModel,
    onSpeechStarted: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Home", "History", "Preferences", "Wallet")
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("🤖 Personal Agent") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF2563EB),
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, title ->
                    NavigationBarItem(
                        icon = {
                            when (index) {
                                0 -> Icon(Icons.Filled.Mic, contentDescription = "Home")
                                1 -> Icon(Icons.Filled.History, contentDescription = "History")
                                2 -> Icon(Icons.Filled.Settings, contentDescription = "Preferences")
                                3 -> Icon(Icons.Filled.AccountBalanceWallet, contentDescription = "Wallet")
                            }
                        },
                        label = { Text(title) },
                        selected = selectedTab == index,
                        onClick = { selectedTab = index }
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF5F5F5))
        ) {
            when (selectedTab) {
                0 -> HomeTab(viewModel, onSpeechStarted)
                1 -> HistoryTab(viewModel)
                2 -> PreferencesTab(viewModel)
                3 -> WalletTab(viewModel)
            }
        }
    }
}

@Composable
fun HomeTab(
    viewModel: AgentViewModel,
    onSpeechStarted: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            "Your Personal Agent",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(bottom = 20.dp)
        )
        
        Text(
            "Ready to listen...",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray,
            modifier = Modifier.padding(bottom = 40.dp)
        )
        
        // Large microphone button
        Button(
            onClick = onSpeechStarted,
            modifier = Modifier
                .size(120.dp),
            shape = androidx.compose.foundation.shape.CircleShape,
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF2563EB)
            )
        ) {
            Icon(
                Icons.Filled.Mic,
                contentDescription = "Speak",
                modifier = Modifier.size(60.dp),
                tint = Color.White
            )
        }
        
        Text(
            "Say what you need",
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(top = 20.dp)
        )
        
        // Last instruction status
        Spacer(modifier = Modifier.height(40.dp))
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "Last Instruction:",
                    style = MaterialTheme.typography.labelLarge
                )
                Text(
                    "No instructions yet",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }
        }
    }
}

@Composable
fun HistoryTab(viewModel: AgentViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(
            "Agent Activity",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(bottom = 20.dp)
        )
        
        Text(
            "No activity yet",
            style = MaterialTheme.typography.bodyLarge,
            color = Color.Gray
        )
    }
}

@Composable
fun PreferencesTab(viewModel: AgentViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(
            "Agent Preferences",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(bottom = 20.dp)
        )
        
        OutlinedTextField(
            value = "Phoenix, AZ",
            onValueChange = {},
            label = { Text("Location") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            readOnly = true
        )
        
        OutlinedTextField(
            value = "$200",
            onValueChange = {},
            label = { Text("Max Budget") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp),
            readOnly = true
        )
        
        OutlinedTextField(
            value = "8am - 5pm",
            onValueChange = {},
            label = { Text("Preferred Times") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 20.dp),
            readOnly = true
        )
        
        Button(
            onClick = { },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Edit Preferences")
        }
    }
}

@Composable
fun WalletTab(viewModel: AgentViewModel) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp)
    ) {
        Text(
            "Your Wallet",
            style = MaterialTheme.typography.headlineLarge,
            modifier = Modifier.padding(bottom = 20.dp)
        )
        
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(10.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "Balance",
                    style = MaterialTheme.typography.labelLarge
                )
                Text(
                    "$0.00",
                    style = MaterialTheme.typography.headlineMedium,
                    color = Color(0xFF10B981)
                )
            }
        }
        
        Button(
            onClick = { },
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 20.dp)
        ) {
            Text("Fund Wallet")
        }
    }
}
