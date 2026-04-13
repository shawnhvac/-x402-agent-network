package com.agentpay.agents

import android.content.Context
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.ConcurrentHashMap

/**
 * AgentDecisionEngine - Autonomous decision making for service bookings
 * 
 * Responsibilities:
 * 1. Listen for incoming requests from other agents (OX, muskox2)
 * 2. Parse request type (booking, negotiation, status check)
 * 3. Autonomously decide: accept, reject, or counter-offer
 * 4. Execute decision (sign transaction, send response)
 * 5. No human input during decision making
 */

data class AgentRequest(
    val requestId: String,
    val from: String,              // "ox_agent", "muskox2_agent", etc
    val action: String,            // "BOOKING", "NEGOTIATION", "STATUS"
    val service: String?,          // "hvac_repair", "plumbing", etc
    val amount: Double?,           // USDC amount
    val description: String?,      // Service description
    val escrowAddress: String?,    // SmartEscrow address
    val timestamp: Long = System.currentTimeMillis()
)

data class AgentDecision(
    val requestId: String,
    val decision: String,          // "ACCEPT", "REJECT", "COUNTER"
    val reason: String,
    val counterAmount: Double?,
    val timestamp: Long = System.currentTimeMillis(),
    val requiresSignature: Boolean = false
)

data class AgentConfig(
    val autoAccept: Boolean = true,
    val maxAmountUSDC: Double = 100.0,
    val minAmountUSDC: Double = 0.5,
    val responseTimeoutMs: Long = 30_000L,
    val requiredBalance: Double = 10.0  // Must maintain 10 USDC minimum
)

class AgentDecisionEngine(
    private val context: Context,
    private val keyManager: AgentKeyManager,
    private val config: AgentConfig = AgentConfig()
) {
    
    private val TAG = "AgentDecisionEngine"
    private val requestHistory = ConcurrentHashMap<String, AgentRequest>()
    private val decisionHistory = ConcurrentHashMap<String, AgentDecision>()
    private val processedRequests = mutableSetOf<String>()
    
    // Agent state
    private var agentBalance: Double = 0.0
    private var agentAddress: String? = null
    
    init {
        agentAddress = keyManager.getAgentAddress()
        Log.d(TAG, "🤖 Agent Decision Engine initialized")
        Log.d(TAG, "   Address: ${agentAddress?.take(20)}...")
        Log.d(TAG, "   Config: $config")
    }
    
    /**
     * Set current agent balance (updated from RPC or wallet)
     */
    fun setAgentBalance(balance: Double) {
        this.agentBalance = balance
        Log.d(TAG, "💰 Agent balance updated: $balance USDC")
    }
    
    /**
     * Receive incoming request from another agent
     */
    suspend fun receiveRequest(request: AgentRequest): Boolean = withContext(Dispatchers.IO) {
        try {
            // Prevent duplicate processing
            if (processedRequests.contains(request.requestId)) {
                Log.d(TAG, "⚠️ Duplicate request: ${request.requestId}")
                return@withContext false
            }
            
            Log.d(TAG, "📨 Received request from ${request.from}")
            Log.d(TAG, "   Action: ${request.action}")
            Log.d(TAG, "   Amount: ${request.amount} USDC")
            
            requestHistory[request.requestId] = request
            processedRequests.add(request.requestId)
            
            true
        } catch (e: Exception) {
            Log.e(TAG, "Error receiving request: ${e.message}")
            false
        }
    }
    
    /**
     * Parse request to determine type
     */
    fun parseRequest(request: AgentRequest): String {
        return when {
            request.action.contains("BOOKING", ignoreCase = true) -> "BOOKING"
            request.action.contains("NEGOTIATION", ignoreCase = true) -> "NEGOTIATION"
            request.action.contains("STATUS", ignoreCase = true) -> "STATUS"
            request.action.contains("PAYMENT", ignoreCase = true) -> "PAYMENT"
            else -> "UNKNOWN"
        }
    }
    
    /**
     * Make autonomous decision on request
     * Returns: ACCEPT, REJECT, or COUNTER
     */
    suspend fun makeDecision(request: AgentRequest): AgentDecision = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "🤔 Analyzing request ${request.requestId}...")
            
            val requestType = parseRequest(request)
            
            val decision = when (requestType) {
                "BOOKING" -> handleBookingRequest(request)
                "NEGOTIATION" -> handleNegotiationRequest(request)
                "STATUS" -> handleStatusRequest(request)
                "PAYMENT" -> handlePaymentRequest(request)
                else -> AgentDecision(
                    requestId = request.requestId,
                    decision = "REJECT",
                    reason = "Unknown request type: ${request.action}",
                    counterAmount = null,
                    requiresSignature = false
                )
            }
            
            Log.d(TAG, "✅ Decision made: ${decision.decision} (${decision.reason})")
            
            decisionHistory[request.requestId] = decision
            decision
            
        } catch (e: Exception) {
            Log.e(TAG, "Error making decision: ${e.message}")
            AgentDecision(
                requestId = request.requestId,
                decision = "ERROR",
                reason = "Decision engine error: ${e.message}",
                counterAmount = null,
                requiresSignature = false
            )
        }
    }
    
    /**
     * Handle booking request
     * Autonomously decide: accept or reject based on criteria
     */
    private fun handleBookingRequest(request: AgentRequest): AgentDecision {
        Log.d(TAG, "📋 Handling BOOKING request...")
        
        val amount = request.amount ?: return AgentDecision(
            requestId = request.requestId,
            decision = "REJECT",
            reason = "No amount specified",
            counterAmount = null,
            requiresSignature = false
        )
        
        // Check 1: Amount within limits
        if (amount < config.minAmountUSDC) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "REJECT",
                reason = "Amount too small (min ${config.minAmountUSDC} USDC)",
                counterAmount = config.minAmountUSDC,
                requiresSignature = false
            )
        }
        
        if (amount > config.maxAmountUSDC) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "COUNTER",
                reason = "Amount too high, proposing lower",
                counterAmount = config.maxAmountUSDC,
                requiresSignature = false
            )
        }
        
        // Check 2: Sufficient balance
        val requiredBalance = amount + config.requiredBalance
        if (agentBalance < requiredBalance) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "REJECT",
                reason = "Insufficient balance (need $requiredBalance, have $agentBalance)",
                counterAmount = null,
                requiresSignature = false
            )
        }
        
        // Check 3: Valid requester
        val trustedRequesters = listOf("ox_agent", "muskox2_agent", "shawn_agent")
        if (!trustedRequesters.contains(request.from)) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "REJECT",
                reason = "Untrusted requester: ${request.from}",
                counterAmount = null,
                requiresSignature = false
            )
        }
        
        // Check 4: Escrow address provided
        if (request.escrowAddress.isNullOrEmpty()) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "REJECT",
                reason = "No escrow address provided",
                counterAmount = null,
                requiresSignature = false
            )
        }
        
        // All checks passed - ACCEPT
        return AgentDecision(
            requestId = request.requestId,
            decision = "ACCEPT",
            reason = "All criteria met - accepting booking for ${request.service}",
            counterAmount = null,
            requiresSignature = true  // Will need to sign escrow transaction
        )
    }
    
    /**
     * Handle negotiation request
     * Counter-offer if amount is reasonable
     */
    private fun handleNegotiationRequest(request: AgentRequest): AgentDecision {
        Log.d(TAG, "💬 Handling NEGOTIATION request...")
        
        val amount = request.amount ?: return AgentDecision(
            requestId = request.requestId,
            decision = "REJECT",
            reason = "No amount specified in negotiation",
            counterAmount = null,
            requiresSignature = false
        )
        
        // Propose counter if outside range
        if (amount < config.minAmountUSDC) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "COUNTER",
                reason = "Counter-offer with minimum acceptable",
                counterAmount = config.minAmountUSDC,
                requiresSignature = false
            )
        }
        
        if (amount > config.maxAmountUSDC) {
            return AgentDecision(
                requestId = request.requestId,
                decision = "COUNTER",
                reason = "Counter-offer with maximum acceptable",
                counterAmount = config.maxAmountUSDC,
                requiresSignature = false
            )
        }
        
        // Within acceptable range - accept
        return AgentDecision(
            requestId = request.requestId,
            decision = "ACCEPT",
            reason = "Negotiated amount acceptable",
            counterAmount = null,
            requiresSignature = false
        )
    }
    
    /**
     * Handle status request
     * Report current agent state
     */
    private fun handleStatusRequest(request: AgentRequest): AgentDecision {
        Log.d(TAG, "📊 Handling STATUS request...")
        
        return AgentDecision(
            requestId = request.requestId,
            decision = "RESPOND",
            reason = "Agent operational - balance: $agentBalance USDC, ${decisionHistory.size} decisions made",
            counterAmount = agentBalance,
            requiresSignature = false
        )
    }
    
    /**
     * Handle payment release request
     */
    private fun handlePaymentRequest(request: AgentRequest): AgentDecision {
        Log.d(TAG, "💳 Handling PAYMENT request...")
        
        // Verify booking was completed
        val bookingRequest = requestHistory.values
            .filter { it.from == request.from }
            .maxByOrNull { it.timestamp }
        
        return if (bookingRequest != null) {
            AgentDecision(
                requestId = request.requestId,
                decision = "ACCEPT",
                reason = "Releasing payment for completed booking",
                counterAmount = null,
                requiresSignature = true  // Need to sign release transaction
            )
        } else {
            AgentDecision(
                requestId = request.requestId,
                decision = "REJECT",
                reason = "No matching booking found",
                counterAmount = null,
                requiresSignature = false
            )
        }
    }
    
    /**
     * Execute decision (sign transaction if needed)
     */
    suspend fun executeDecision(
        decision: AgentDecision,
        transactionBytes: ByteArray? = null
    ): Boolean = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "⚡ Executing decision: ${decision.decision}")
            
            // If decision requires signing, sign the transaction
            if (decision.requiresSignature && transactionBytes != null) {
                val signature = keyManager.signTransaction(transactionBytes)
                if (signature != null) {
                    Log.d(TAG, "✅ Transaction signed autonomously")
                    return@withContext true
                } else {
                    Log.e(TAG, "❌ Failed to sign transaction")
                    return@withContext false
                }
            }
            
            // For non-signing decisions, just acknowledge
            Log.d(TAG, "✅ Decision executed: ${decision.decision}")
            return@withContext true
            
        } catch (e: Exception) {
            Log.e(TAG, "Error executing decision: ${e.message}")
            return@withContext false
        }
    }
    
    /**
     * Get decision history
     */
    fun getDecisionHistory(): List<AgentDecision> {
        return decisionHistory.values.sortedByDescending { it.timestamp }
    }
    
    /**
     * Get request history
     */
    fun getRequestHistory(): List<AgentRequest> {
        return requestHistory.values.sortedByDescending { it.timestamp }
    }
    
    /**
     * Get agent statistics
     */
    fun getAgentStats(): AgentStats {
        val decisions = decisionHistory.values
        val acceptCount = decisions.count { it.decision == "ACCEPT" }
        val rejectCount = decisions.count { it.decision == "REJECT" }
        val counterCount = decisions.count { it.decision == "COUNTER" }
        
        return AgentStats(
            totalRequests = requestHistory.size,
            acceptedRequests = acceptCount,
            rejectedRequests = rejectCount,
            counteredRequests = counterCount,
            currentBalance = agentBalance,
            agentAddress = agentAddress ?: "unknown"
        )
    }
}

/**
 * Agent statistics data class
 */
data class AgentStats(
    val totalRequests: Int,
    val acceptedRequests: Int,
    val rejectedRequests: Int,
    val counteredRequests: Int,
    val currentBalance: Double,
    val agentAddress: String
)
