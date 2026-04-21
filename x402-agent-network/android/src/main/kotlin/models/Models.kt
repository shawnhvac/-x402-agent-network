package com.agentpay.provider.models

import java.io.Serializable

data class UserPreferences(
    val budgetLimit: Double = 1000.0,
    val serviceTypes: List<String> = listOf("Mechanic", "HVAC", "Plumbing"),
    val latitude: Double = 33.4484,
    val longitude: Double = -112.0742,
    val preferredHours: String = "9 AM - 6 PM"
) : Serializable

data class AgentProfile(
    val id: String,
    val name: String,
    val serviceType: String,
    val walletAddress: String,
    val reputation: Int,
    val costPerHour: Double,
    val latitude: Double,
    val longitude: Double,
    val distance: Double,
    val responseTime: Int,
    val completionRate: Double
) : Serializable

data class ServiceQuery(
    val serviceType: String,
    val latitude: Double,
    val longitude: Double,
    val budget: Double,
    val maxDistance: Double = 50.0
) : Serializable

data class Transaction(
    val id: String,
    val agentId: String,
    val amount: Double,
    val currency: String = "USDC",
    val status: String,
    val timestamp: Long = System.currentTimeMillis()
) : Serializable
