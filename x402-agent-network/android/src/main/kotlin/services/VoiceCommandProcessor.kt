package com.agentpay.personal.services

/**
 * Voice Command Processing
 * Parses natural language voice input into structured commands
 */

enum class VoiceCommandType {
    BOOK_HVAC,
    BOOK_MECHANIC,
    BOOK_PLUMBER,
    BOOK_ELECTRICIAN,
    BOOK_CARPENTER,
    CHECK_BALANCE,
    SHOW_AGENTS,
    UNKNOWN
}

data class ParsedCommand(
    val type: VoiceCommandType,
    val location: String?,
    val serviceType: String?,
    val confidence: Float
)

class VoiceCommandProcessor {
    fun parseCommand(voiceInput: String, confidence: Float): ParsedCommand {
        val lower = voiceInput.lowercase()

        val type = when {
            "hvac" in lower || "heating" in lower || "air condition" in lower ->
                VoiceCommandType.BOOK_HVAC
            "mechanic" in lower || "car" in lower || "auto" in lower ->
                VoiceCommandType.BOOK_MECHANIC
            "plumb" in lower || "leak" in lower || "pipe" in lower ->
                VoiceCommandType.BOOK_PLUMBER
            "electric" in lower || "electrician" in lower || "wire" in lower ->
                VoiceCommandType.BOOK_ELECTRICIAN
            "carpenter" in lower || "wood" in lower || "build" in lower ->
                VoiceCommandType.BOOK_CARPENTER
            "balance" in lower || "wallet" in lower || "how much" in lower ->
                VoiceCommandType.CHECK_BALANCE
            "agent" in lower || "show" in lower || "list" in lower ->
                VoiceCommandType.SHOW_AGENTS
            else -> VoiceCommandType.UNKNOWN
        }

        // Extract location if present
        val locations = listOf("phoenix", "denver", "austin", "chicago", "new york", "los angeles")
        val location = locations.firstOrNull { it in lower }

        return ParsedCommand(
            type = type,
            location = location,
            serviceType = extractServiceType(type),
            confidence = confidence
        )
    }

    fun getCommandDescription(parsed: ParsedCommand): String {
        return when (parsed.type) {
            VoiceCommandType.BOOK_HVAC ->
                "📍 Book HVAC Service${parsed.location?.let { " in ${it.replaceFirstChar { c -> c.uppercase() }}" } ?: ""}"
            VoiceCommandType.BOOK_MECHANIC ->
                "🔧 Book Mechanic${parsed.location?.let { " in ${it.replaceFirstChar { c -> c.uppercase() }}" } ?: ""}"
            VoiceCommandType.BOOK_PLUMBER ->
                "💧 Book Plumber${parsed.location?.let { " in ${it.replaceFirstChar { c -> c.uppercase() }}" } ?: ""}"
            VoiceCommandType.BOOK_ELECTRICIAN ->
                "⚡ Book Electrician${parsed.location?.let { " in ${it.replaceFirstChar { c -> c.uppercase() }}" } ?: ""}"
            VoiceCommandType.BOOK_CARPENTER ->
                "🪵 Book Carpenter${parsed.location?.let { " in ${it.replaceFirstChar { c -> c.uppercase() }}" } ?: ""}"
            VoiceCommandType.CHECK_BALANCE ->
                "💰 Check Wallet Balance"
            VoiceCommandType.SHOW_AGENTS ->
                "👥 Show Available Agents"
            VoiceCommandType.UNKNOWN ->
                "❓ Command not recognized"
        }
    }

    private fun extractServiceType(type: VoiceCommandType): String {
        return when (type) {
            VoiceCommandType.BOOK_HVAC -> "HVAC"
            VoiceCommandType.BOOK_MECHANIC -> "Mechanic"
            VoiceCommandType.BOOK_PLUMBER -> "Plumber"
            VoiceCommandType.BOOK_ELECTRICIAN -> "Electrician"
            VoiceCommandType.BOOK_CARPENTER -> "Carpenter"
            else -> "Unknown"
        }
    }
}
