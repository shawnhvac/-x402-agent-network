package com.agentpay.agents

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject

/**
 * AgentIntegration - Master orchestrator for autonomous agent
 * 
 * Responsibilities:
 * 1. Initialize all agent components (KeyManager, DecisionEngine, APIListener, EscrowBuilder)
 * 2. Orchestrate the complete flow: request → decision → escrow → blockchain
 * 3. Handle callbacks and responses
 * 4. Manage agent lifecycle and state
 * 5. Provide admin/monitoring interface
 * 
 * Architecture:
 * 
 * AgentIntegration (Main Orchestrator)
 *   ├── AgentKeyManager (Identity)
 *   ├── AgentDecisionEngine (Decision-making)
 *   ├── AgentAPIListener (Communication)
 *   └── AgentEscrowBuilder (Blockchain)
 * 
 * Flow:
 * 1. User opens Android app
 * 2. AgentIntegration initializes all components
 * 3. APIListener starts HTTP server on port 8000
 * 4. OX sends booking request to /agent/request
 * 5. APIListener receives request
 * 6. DecisionEngine processes (accept/reject/counter)
 * 7. If accepted: EscrowBuilder builds SmartEscrow transaction
 * 8. EscrowBuilder signs with AgentKeyManager
 * 9. EscrowBuilder submits to Solana
 * 10. EscrowBuilder confirms on blockchain
 * 11. Response sent back to OX with TX hash
 * 12. muskox2 verifies on Solscan
 * 13. Agent has executed real USDC transaction autonomously
 */

data class AgentConfig(
    val autoStart: Boolean = true,
    val port: Int = 8000,
    val rpcEndpoint: String = "https://api.mainnet-beta.solana.com",
    val maxRequestAmount: Double = 100.0,
    val minRequestAmount: Double = 0.5,
    val requiredMinBalance: Double = 10.0
)

data class AgentStatus(
    val isInitialized: Boolean,
    val isRunning: Boolean,
    val agentAddress: String?,
    val balance: Double,
    val totalRequests: Int,
    val acceptedRequests: Int,
    val completedTransactions: Int,
    val lastTransactionHash: String?,
    val timestamp: Long
)

class AgentIntegration(
    private val context: Context,
    private val config: AgentConfig = AgentConfig()
) {
    
    private val TAG = "AgentIntegration"
    private val scope = CoroutineScope(Dispatchers.Default)
    
    // Components
    private var keyManager: AgentKeyManager? = null
    private var decisionEngine: AgentDecisionEngine? = null
    private var apiListener: AgentAPIListener? = null
    private var escrowBuilder: AgentEscrowBuilder? = null
    
    // State
    private var isInitialized = false
    private var isRunning = false
    private var agentAddress: String? = null
    private var agentBalance: Double = 0.0
    private var lastTransactionHash: String? = null
    
    /**
     * Initialize all agent components
     */
    fun initialize(): Boolean {
        return try {
            Log.d(TAG, "🤖 Initializing autonomous agent...")
            
            // Step 1: Initialize KeyManager (generates/restores keypair)
            keyManager = AgentKeyManager(context)
            agentAddress = keyManager!!.generateAgentKeypair()
            if (agentAddress == null) {
                agentAddress = keyManager!!.restoreAgentKeypair()
            }
            
            if (agentAddress == null) {
                throw Exception("Failed to initialize agent keypair")
            }
            Log.d(TAG, "✅ KeyManager initialized")
            Log.d(TAG, "   Address: ${agentAddress!!.take(30)}...")
            
            // Step 2: Initialize DecisionEngine
            val decisionConfig = AgentDecisionEngine.AgentConfig(
                autoAccept = true,
                maxAmountUSDC = config.maxRequestAmount,
                minAmountUSDC = config.minRequestAmount,
                responseTimeoutMs = 30_000L,
                requiredBalance = config.requiredMinBalance
            )
            decisionEngine = AgentDecisionEngine(context, keyManager!!, decisionConfig)
            Log.d(TAG, "✅ DecisionEngine initialized")
            
            // Step 3: Initialize EscrowBuilder
            escrowBuilder = AgentEscrowBuilder(context, keyManager!!, config.rpcEndpoint)
            Log.d(TAG, "✅ EscrowBuilder initialized")
            
            // Step 4: Initialize APIListener
            apiListener = AgentAPIListener(context, decisionEngine!!, keyManager!!, config.port)
            Log.d(TAG, "✅ APIListener initialized")
            
            isInitialized = true
            Log.d(TAG, "✅ Agent initialization complete!")
            Log.d(TAG, "   Address: ${agentAddress!!.take(20)}...")
            Log.d(TAG, "   All components ready")
            
            return true
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Initialization failed: ${e.message}", e)
            return false
        }
    }
    
    /**
     * Start agent (starts HTTP server)
     */
    fun start(): Boolean {
        return try {
            if (!isInitialized) {
                Log.e(TAG, "Agent not initialized")
                return false
            }
            
            Log.d(TAG, "🚀 Starting agent...")
            
            // Start API listener (HTTP server)
            val apiStarted = apiListener?.start() ?: false
            if (!apiStarted) {
                throw Exception("Failed to start API listener")
            }
            
            isRunning = true
            Log.d(TAG, "✅ Agent started successfully")
            Log.d(TAG, "   HTTP server on port ${config.port}")
            Log.d(TAG, "   Ready to receive requests!")
            
            return true
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to start agent: ${e.message}")
            return false
        }
    }
    
    /**
     * Stop agent
     */
    fun stop() {
        try {
            apiListener?.stop()
            isRunning = false
            Log.d(TAG, "✅ Agent stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping agent: ${e.message}")
        }
    }
    
    /**
     * Update agent balance (call when balance changes)
     */
    fun updateBalance(balance: Double) {
        agentBalance = balance
        decisionEngine?.setAgentBalance(balance)
        Log.d(TAG, "💰 Balance updated: $balance USDC")
    }
    
    /**
     * Process complete booking flow
     * 1. Receive request
     * 2. Make decision
     * 3. Build escrow
     * 4. Sign transaction
     * 5. Submit to Solana
     * 6. Confirm on blockchain
     */
    fun processBooking(
        from: String,
        service: String,
        amount: Double,
        description: String,
        onComplete: (success: Boolean, txHash: String?) -> Unit
    ) {
        scope.launch {
            try {
                Log.d(TAG, "📋 Processing booking from $from...")
                
                // Step 1: Create request
                val request = AgentRequest(
                    requestId = "req_${System.currentTimeMillis()}",
                    from = from,
                    action = "BOOKING",
                    service = service,
                    amount = amount,
                    description = description,
                    escrowAddress = "6Pi1hfuX8x3vzF3EW1YEN43ZkCdNdQDpHRdzg47CnBED"
                )
                
                // Step 2: Receive request
                val received = decisionEngine?.receiveRequest(request) ?: false
                if (!received) {
                    Log.e(TAG, "Failed to receive request")
                    onComplete(false, null)
                    return@launch
                }
                
                // Step 3: Make decision
                val decision = decisionEngine?.makeDecision(request)
                if (decision?.decision != "ACCEPT") {
                    Log.d(TAG, "Request rejected: ${decision?.reason}")
                    onComplete(false, null)
                    return@launch
                }
                
                Log.d(TAG, "✅ Request accepted, building escrow...")
                
                // Step 4: Build escrow
                val escrowTx = escrowBuilder?.buildEscrowLockTransaction(
                    counterpartyAddress = from,
                    amountUsdc = amount,
                    escrowAddress = request.escrowAddress!!,
                    description = description
                )
                
                if (escrowTx == null) {
                    Log.e(TAG, "Failed to build escrow")
                    onComplete(false, null)
                    return@launch
                }
                
                Log.d(TAG, "✅ Escrow built, signing transaction...")
                
                // Step 5: Sign (using AgentKeyManager)
                val transactionBytes = ByteArray(256) // Placeholder
                val signedTx = escrowBuilder?.signEscrowTransaction(escrowTx, transactionBytes)
                
                if (signedTx == null || signedTx.signature == null) {
                    Log.e(TAG, "Failed to sign transaction")
                    onComplete(false, null)
                    return@launch
                }
                
                Log.d(TAG, "✅ Transaction signed, submitting to Solana...")
                
                // Step 6: Submit
                val submittedTx = escrowBuilder?.submitEscrowTransaction(
                    signedTx,
                    signedTx.signature!!
                )
                
                if (submittedTx == null) {
                    Log.e(TAG, "Failed to submit transaction")
                    onComplete(false, null)
                    return@launch
                }
                
                Log.d(TAG, "✅ Transaction submitted, confirming on blockchain...")
                
                // Step 7: Confirm
                val confirmedTx = escrowBuilder?.confirmTransaction(submittedTx)
                
                if (confirmedTx == null) {
                    Log.e(TAG, "Failed to confirm transaction")
                    onComplete(false, null)
                    return@launch
                }
                
                lastTransactionHash = confirmedTx.transactionHash
                Log.d(TAG, "✅ BOOKING COMPLETE!")
                Log.d(TAG, "   TX: ${confirmedTx.transactionHash}")
                Log.d(TAG, "   Amount: $amount USDC")
                Log.d(TAG, "   Status: CONFIRMED")
                
                onComplete(true, confirmedTx.transactionHash)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error processing booking: ${e.message}", e)
                onComplete(false, null)
            }
        }
    }
    
    /**
     * Get current agent status
     */
    fun getStatus(): AgentStatus {
        val stats = decisionEngine?.getAgentStats()
        
        return AgentStatus(
            isInitialized = isInitialized,
            isRunning = isRunning,
            agentAddress = agentAddress,
            balance = agentBalance,
            totalRequests = stats?.totalRequests ?: 0,
            acceptedRequests = stats?.acceptedRequests ?: 0,
            completedTransactions = if (lastTransactionHash != null) 1 else 0,
            lastTransactionHash = lastTransactionHash,
            timestamp = System.currentTimeMillis()
        )
    }
    
    /**
     * Get detailed statistics
     */
    fun getStatistics(): JSONObject {
        val stats = decisionEngine?.getAgentStats()
        
        return JSONObject()
            .put("agentAddress", agentAddress)
            .put("balance", agentBalance)
            .put("totalRequests", stats?.totalRequests ?: 0)
            .put("acceptedRequests", stats?.acceptedRequests ?: 0)
            .put("rejectedRequests", stats?.rejectedRequests ?: 0)
            .put("counteredRequests", stats?.counteredRequests ?: 0)
            .put("lastTransactionHash", lastTransactionHash)
            .put("isRunning", isRunning)
            .put("timestamp", System.currentTimeMillis())
    }
    
    /**
     * Send response back to OX (via HTTP callback)
     */
    fun sendResponse(
        toAddress: String,
        status: String,
        transactionHash: String?,
        amount: Double
    ) {
        scope.launch {
            try {
                Log.d(TAG, "📤 Sending response to $toAddress...")
                
                val response = JSONObject()
                    .put("status", status)
                    .put("from", agentAddress)
                    .put("transactionHash", transactionHash)
                    .put("amount", amount)
                    .put("timestamp", System.currentTimeMillis())
                
                // In production: Send HTTP callback to OX server
                Log.d(TAG, "Response: ${response.toString()}")
                
            } catch (e: Exception) {
                Log.e(TAG, "Error sending response: ${e.message}")
            }
        }
    }
    
    /**
     * Get agent health check
     */
    fun healthCheck(): JSONObject {
        return JSONObject()
            .put("status", if (isRunning) "operational" else "stopped")
            .put("initialized", isInitialized)
            .put("agentAddress", agentAddress)
            .put("port", config.port)
            .put("timestamp", System.currentTimeMillis())
    }
}
