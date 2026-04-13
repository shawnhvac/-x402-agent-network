package com.agentpay.agents

import android.content.Context
import android.util.Log
import com.sun.net.httpserver.HttpExchange
import com.sun.net.httpserver.HttpHandler
import com.sun.net.httpserver.HttpServer
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONException
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetSocketAddress
import java.nio.charset.StandardCharsets
import java.util.concurrent.Executors

/**
 * AgentAPIListener - HTTP server for autonomous agent communication
 * 
 * Responsibilities:
 * 1. Listen for incoming requests from other agents (OX, muskox2)
 * 2. Route requests to decision engine
 * 3. Return responses (accept, reject, counter)
 * 4. Report agent status and statistics
 * 5. Execute transactions when needed
 * 
 * API Endpoints:
 * POST /agent/request - Receive booking/negotiation request
 * GET  /agent/status  - Get agent status and balance
 * GET  /agent/history - Get request/decision history
 * POST /agent/execute - Execute decision (sign transaction)
 */

class AgentAPIListener(
    private val context: Context,
    private val decisionEngine: AgentDecisionEngine,
    private val keyManager: AgentKeyManager,
    private val port: Int = 8000
) {
    
    private val TAG = "AgentAPIListener"
    private var httpServer: HttpServer? = null
    private val scope = CoroutineScope(Dispatchers.Default)
    
    /**
     * Start HTTP server (must call on background thread)
     */
    fun start(): Boolean {
        return try {
            Log.d(TAG, "🌐 Starting agent API listener on port $port...")
            
            httpServer = HttpServer.create(InetSocketAddress(port), 50)
            httpServer!!.executor = Executors.newFixedThreadPool(4)
            
            // POST /agent/request - Receive incoming request
            httpServer!!.createContext("/agent/request", RequestHandler(this))
            
            // GET /agent/status - Get agent status
            httpServer!!.createContext("/agent/status", StatusHandler(this))
            
            // GET /agent/history - Get request/decision history
            httpServer!!.createContext("/agent/history", HistoryHandler(this))
            
            // POST /agent/execute - Execute decision
            httpServer!!.createContext("/agent/execute", ExecuteHandler(this))
            
            // GET /agent/stats - Get statistics
            httpServer!!.createContext("/agent/stats", StatsHandler(this))
            
            // GET /health - Health check
            httpServer!!.createContext("/health", HealthHandler(this))
            
            httpServer!!.start()
            Log.d(TAG, "✅ Agent API listener started successfully")
            Log.d(TAG, "   Endpoints ready:")
            Log.d(TAG, "   POST http://localhost:$port/agent/request")
            Log.d(TAG, "   GET  http://localhost:$port/agent/status")
            Log.d(TAG, "   GET  http://localhost:$port/agent/history")
            Log.d(TAG, "   POST http://localhost:$port/agent/execute")
            Log.d(TAG, "   GET  http://localhost:$port/agent/stats")
            Log.d(TAG, "   GET  http://localhost:$port/health")
            
            true
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Failed to start API listener: ${e.message}", e)
            false
        }
    }
    
    /**
     * Stop HTTP server
     */
    fun stop() {
        try {
            httpServer?.stop(0)
            Log.d(TAG, "✅ Agent API listener stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping server: ${e.message}")
        }
    }
    
    /**
     * Helper: Read request body as string
     */
    private fun readRequestBody(exchange: HttpExchange): String {
        val reader = BufferedReader(InputStreamReader(exchange.requestBody, StandardCharsets.UTF_8))
        return reader.readText()
    }
    
    /**
     * Helper: Send JSON response
     */
    private fun sendResponse(
        exchange: HttpExchange,
        statusCode: Int,
        json: JSONObject
    ) {
        try {
            val responseBytes = json.toString().toByteArray(StandardCharsets.UTF_8)
            exchange.responseHeaders.set("Content-Type", "application/json")
            exchange.responseHeaders.set("Access-Control-Allow-Origin", "*")
            exchange.sendResponseHeaders(statusCode, responseBytes.size.toLong())
            exchange.responseBody.write(responseBytes)
            exchange.responseBody.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error sending response: ${e.message}")
        }
    }
    
    /**
     * Handler: POST /agent/request
     * Receive incoming booking/negotiation request
     */
    inner class RequestHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                if (exchange.requestMethod != "POST") {
                    val error = JSONObject().put("error", "POST required")
                    sendResponse(exchange, 405, error)
                    return
                }
                
                val body = readRequestBody(exchange)
                Log.d(TAG, "📨 Received request: $body")
                
                val requestJson = JSONObject(body)
                val request = AgentRequest(
                    requestId = requestJson.optString("requestId", "req_${System.currentTimeMillis()}"),
                    from = requestJson.getString("from"),
                    action = requestJson.getString("action"),
                    service = requestJson.optString("service"),
                    amount = requestJson.optDouble("amount", 0.0),
                    description = requestJson.optString("description"),
                    escrowAddress = requestJson.optString("escrowAddress"),
                    timestamp = System.currentTimeMillis()
                )
                
                // Process asynchronously
                scope.launch {
                    // Receive request
                    val received = decisionEngine.receiveRequest(request)
                    if (!received) {
                        val error = JSONObject().put("error", "Failed to receive request")
                        sendResponse(exchange, 400, error)
                        return@launch
                    }
                    
                    // Make decision
                    val decision = decisionEngine.makeDecision(request)
                    
                    // Send response
                    val response = JSONObject()
                        .put("status", "success")
                        .put("requestId", decision.requestId)
                        .put("decision", decision.decision)
                        .put("reason", decision.reason)
                        .put("counterAmount", decision.counterAmount)
                        .put("timestamp", decision.timestamp)
                    
                    Log.d(TAG, "✅ Sent response: ${response.toString()}")
                    sendResponse(exchange, 200, response)
                }
                
            } catch (e: JSONException) {
                Log.e(TAG, "JSON parse error: ${e.message}")
                val error = JSONObject().put("error", "Invalid JSON: ${e.message}")
                sendResponse(exchange, 400, error)
            } catch (e: Exception) {
                Log.e(TAG, "Error handling request: ${e.message}", e)
                val error = JSONObject().put("error", e.message ?: "Unknown error")
                sendResponse(exchange, 500, error)
            }
        }
    }
    
    /**
     * Handler: GET /agent/status
     * Return current agent status
     */
    inner class StatusHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                val agentAddress = keyManager.getAgentAddress()
                val stats = decisionEngine.getAgentStats()
                
                val response = JSONObject()
                    .put("status", "operational")
                    .put("agentAddress", agentAddress)
                    .put("balance", stats.currentBalance)
                    .put("totalRequests", stats.totalRequests)
                    .put("acceptedRequests", stats.acceptedRequests)
                    .put("rejectedRequests", stats.rejectedRequests)
                    .put("counteredRequests", stats.counteredRequests)
                    .put("timestamp", System.currentTimeMillis())
                
                Log.d(TAG, "📊 Status request: $response")
                sendResponse(exchange, 200, response)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error handling status request: ${e.message}")
                val error = JSONObject().put("error", e.message)
                sendResponse(exchange, 500, error)
            }
        }
    }
    
    /**
     * Handler: GET /agent/history
     * Return request and decision history
     */
    inner class HistoryHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                val requests = decisionEngine.getRequestHistory().take(50)
                val decisions = decisionEngine.getDecisionHistory().take(50)
                
                val requestsArray = org.json.JSONArray().apply {
                    requests.forEach { req ->
                        put(JSONObject()
                            .put("requestId", req.requestId)
                            .put("from", req.from)
                            .put("action", req.action)
                            .put("amount", req.amount)
                            .put("timestamp", req.timestamp)
                        )
                    }
                }
                
                val decisionsArray = org.json.JSONArray().apply {
                    decisions.forEach { dec ->
                        put(JSONObject()
                            .put("requestId", dec.requestId)
                            .put("decision", dec.decision)
                            .put("reason", dec.reason)
                            .put("timestamp", dec.timestamp)
                        )
                    }
                }
                
                val response = JSONObject()
                    .put("requests", requestsArray)
                    .put("decisions", decisionsArray)
                    .put("total", requests.size + decisions.size)
                
                Log.d(TAG, "📋 History request: ${requests.size} requests, ${decisions.size} decisions")
                sendResponse(exchange, 200, response)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error handling history request: ${e.message}")
                val error = JSONObject().put("error", e.message)
                sendResponse(exchange, 500, error)
            }
        }
    }
    
    /**
     * Handler: POST /agent/execute
     * Execute decision (sign and submit transaction)
     */
    inner class ExecuteHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                if (exchange.requestMethod != "POST") {
                    val error = JSONObject().put("error", "POST required")
                    sendResponse(exchange, 405, error)
                    return
                }
                
                val body = readRequestBody(exchange)
                val executeJson = JSONObject(body)
                
                val requestId = executeJson.getString("requestId")
                val transactionHex = executeJson.optString("transaction", "")
                
                Log.d(TAG, "⚡ Execute request for $requestId")
                
                scope.launch {
                    // Convert hex to bytes
                    val transactionBytes = if (transactionHex.isNotEmpty()) {
                        transactionHex.chunked(2)
                            .map { it.toInt(16).toByte() }
                            .toByteArray()
                    } else {
                        ByteArray(0)
                    }
                    
                    // Execute (sign transaction)
                    val executed = decisionEngine.executeDecision(
                        AgentDecision(
                            requestId = requestId,
                            decision = "EXECUTE",
                            reason = "Transaction execution",
                            counterAmount = null,
                            requiresSignature = true
                        ),
                        transactionBytes
                    )
                    
                    val response = JSONObject()
                        .put("status", if (executed) "executed" else "failed")
                        .put("requestId", requestId)
                        .put("timestamp", System.currentTimeMillis())
                    
                    Log.d(TAG, "✅ Execution response: ${response.toString()}")
                    sendResponse(exchange, if (executed) 200 else 500, response)
                }
                
            } catch (e: Exception) {
                Log.e(TAG, "Error handling execute request: ${e.message}")
                val error = JSONObject().put("error", e.message)
                sendResponse(exchange, 500, error)
            }
        }
    }
    
    /**
     * Handler: GET /agent/stats
     * Return detailed statistics
     */
    inner class StatsHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                val stats = decisionEngine.getAgentStats()
                
                val response = JSONObject()
                    .put("totalRequests", stats.totalRequests)
                    .put("acceptedRequests", stats.acceptedRequests)
                    .put("rejectedRequests", stats.rejectedRequests)
                    .put("counteredRequests", stats.counteredRequests)
                    .put("acceptanceRate", if (stats.totalRequests > 0) {
                        (stats.acceptedRequests.toDouble() / stats.totalRequests * 100).toInt()
                    } else 0)
                    .put("currentBalance", stats.currentBalance)
                    .put("agentAddress", stats.agentAddress)
                    .put("timestamp", System.currentTimeMillis())
                
                Log.d(TAG, "📈 Stats request: ${response.toString()}")
                sendResponse(exchange, 200, response)
                
            } catch (e: Exception) {
                Log.e(TAG, "Error handling stats request: ${e.message}")
                val error = JSONObject().put("error", e.message)
                sendResponse(exchange, 500, error)
            }
        }
    }
    
    /**
     * Handler: GET /health
     * Health check endpoint
     */
    inner class HealthHandler(val listener: AgentAPIListener) : HttpHandler {
        override fun handle(exchange: HttpExchange) {
            try {
                val response = JSONObject()
                    .put("status", "healthy")
                    .put("service", "agent-api-listener")
                    .put("port", port)
                    .put("timestamp", System.currentTimeMillis())
                
                sendResponse(exchange, 200, response)
            } catch (e: Exception) {
                Log.e(TAG, "Error handling health check: ${e.message}")
                val error = JSONObject().put("status", "error")
                sendResponse(exchange, 500, error)
            }
        }
    }
}
