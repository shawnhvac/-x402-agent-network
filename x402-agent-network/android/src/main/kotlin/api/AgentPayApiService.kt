package com.agentpay.personal.api

import com.agentpay.personal.models.*
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Body
import retrofit2.http.Path

interface AgentPayApiService {
    
    // Search for agents by service type and location
    @POST("api/agents/search")
    suspend fun searchAgents(
        @Body query: ServiceQuery
    ): List<AgentProfile>
    
    // Get agent details
    @GET("api/agents/{id}")
    suspend fun getAgent(
        @Path("id") agentId: String
    ): AgentProfile
    
    // Create escrow
    @POST("api/escrow/create")
    suspend fun createEscrow(
        @Body escrow: EscrowCreationRequest
    ): EscrowResponse
    
    // Complete escrow
    @POST("api/escrow/{id}/complete")
    suspend fun completeEscrow(
        @Path("id") escrowId: String,
        @Body completion: EscrowCompletion
    ): EscrowResponse
    
    // Dispute escrow
    @POST("api/escrow/{id}/dispute")
    suspend fun disputeEscrow(
        @Path("id") escrowId: String,
        @Body dispute: EscrowDispute
    ): EscrowResponse
    
    // Get escrow status
    @GET("api/escrow/{id}")
    suspend fun getEscrow(
        @Path("id") escrowId: String
    ): EscrowAccount
    
    // Update user preferences
    @POST("api/user/preferences")
    suspend fun updatePreferences(
        @Body preferences: UserPreferences
    ): PreferencesResponse
}

data class EscrowCreationRequest(
    val buyerAddress: String,
    val sellerAddress: String,
    val amount: Double,
    val serviceDescription: String,
    val milestones: List<Milestone>
)

data class EscrowResponse(
    val id: String,
    val txHash: String,
    val status: String
)

data class EscrowCompletion(
    val buyerSignature: String,
    val proofHash: String
)

data class EscrowDispute(
    val reason: String,
    val evidence: String
)

data class PreferencesResponse(
    val success: Boolean,
    val message: String
)
