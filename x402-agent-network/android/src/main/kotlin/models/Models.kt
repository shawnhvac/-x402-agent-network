package com.agentpay.personal.models

import java.io.Serializable

// User preferences
data class UserPreferences(
    val budgetLimit: Double = 1000.0,
    val serviceTypes: List<String> = listOf("Mechanic", "HVAC", "Plumbing"),
    val latitude: Double = 33.4484,  // Phoenix
    val longitude: Double = -112.0742,
    val preferredHours: String = "9 AM - 6 PM"
) : Serializable

// Agent profile
data class AgentProfile(
    val id: String,
    val name: String,
    val serviceType: String,
    val walletAddress: String,
    val reputation: Int,  // 0-100
    val costPerHour: Double,
    val latitude: Double,
    val longitude: Double,
    val distance: Double,  // kilometers
    val responseTime: Int,  // seconds
    val completionRate: Double  // 0-100
) : Serializable

// Service query
data class ServiceQuery(
    val serviceType: String,
    val latitude: Double,
    val longitude: Double,
    val budget: Double,
    val maxDistance: Double = 50.0
) : Serializable

// Transaction
data class Transaction(
    val id: String,
    val agentName: String,
    val serviceType: String,
    val amount: Double,
    val timestamp: Long,
    val status: String,  // pending, completed, failed
    val txHash: String?
) : Serializable

// Escrow
data class EscrowAccount(
    val id: String,
    val buyerAddress: String,
    val sellerAddress: String,
    val amount: Double,
    val milestones: List<Milestone>,
    val status: String,
    val createdAt: Long,
    val completedAt: Long?
) : Serializable

// Milestone for escrow
data class Milestone(
    val id: String,
    val description: String,
    val amount: Double,
    val dueDate: Long,
    val completed: Boolean
) : Serializable
