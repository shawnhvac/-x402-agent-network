package com.agentpay.voice

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.SpeechRecognizer
import android.speech.SpeechRecognizer.ERROR_NO_MATCH
import android.speech.SpeechRecognizer.ERROR_NETWORK
import android.speech.SpeechRecognizer.ERROR_NETWORK_TIMEOUT
import android.util.Log

/**
 * Voice Recognition for AgentPay
 * Handles real Android Speech-to-Text input
 */

interface VoiceListener {
    fun onListeningStarted()
    fun onResult(text: String)
    fun onError(error: String)
    fun onListeningEnded()
}

class VoiceRecognitionManager(private val context: Context) {
    companion object {
        private const val TAG = "VoiceRecognition"
    }

    private var speechRecognizer: SpeechRecognizer? = null
    private var listener: VoiceListener? = null

    fun setListener(listener: VoiceListener) {
        this.listener = listener
    }

    /**
     * Start listening for voice input
     */
    fun startListening() {
        try {
            if (speechRecognizer == null) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            }

            Log.d(TAG, "Starting voice recognition...")
            listener?.onListeningStarted()

            val intent = Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                    android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(android.speech.RecognizerIntent.EXTRA_MAX_RESULTS, 5)
                putExtra(android.speech.RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2000)
            }

            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d(TAG, "Ready for speech")
                }

                override fun onBeginningOfSpeech() {
                    Log.d(TAG, "Beginning of speech")
                }

                override fun onRmsChanged(rmsdB: Float) {
                    // Audio level changed (can update UI volume indicator)
                }

                override fun onBufferReceived(buffer: ByteArray?) {
                    Log.d(TAG, "Buffer received")
                }

                override fun onEndOfSpeech() {
                    Log.d(TAG, "End of speech")
                }

                override fun onError(error: Int) {
                    val errorMsg = when (error) {
                        ERROR_NETWORK -> "Network error"
                        ERROR_NETWORK_TIMEOUT -> "Network timeout"
                        ERROR_NO_MATCH -> "No speech recognized"
                        else -> "Error: $error"
                    }
                    Log.e(TAG, "Speech recognition error: $errorMsg")
                    listener?.onError(errorMsg)
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        val recognizedText = matches[0]
                        Log.d(TAG, "Recognition result: $recognizedText")
                        listener?.onResult(recognizedText)
                    }
                    listener?.onListeningEnded()
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val partial = partialResults?.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!partial.isNullOrEmpty()) {
                        Log.d(TAG, "Partial result: ${partial[0]}")
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {
                    Log.d(TAG, "Event: $eventType")
                }
            })

            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start listening: ${e.message}")
            listener?.onError("Failed to start listening: ${e.message}")
        }
    }

    /**
     * Stop listening
     */
    fun stopListening() {
        try {
            Log.d(TAG, "Stopping voice recognition...")
            speechRecognizer?.stopListening()
            listener?.onListeningEnded()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping: ${e.message}")
        }
    }

    /**
     * Release resources
     */
    fun destroy() {
        try {
            speechRecognizer?.destroy()
            speechRecognizer = null
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying: ${e.message}")
        }
    }

    /**
     * Parse voice commands
     */
    fun parseCommand(voiceInput: String): VoiceCommand? {
        val lowercaseInput = voiceInput.lowercase()

        return when {
            lowercaseInput.contains("hvac") || lowercaseInput.contains("heating") -> 
                VoiceCommand.BOOK_HVAC
            lowercaseInput.contains("mechanic") || lowercaseInput.contains("car") || lowercaseInput.contains("mechanic") ->
                VoiceCommand.BOOK_MECHANIC
            lowercaseInput.contains("plumb") ->
                VoiceCommand.BOOK_PLUMBER
            lowercaseInput.contains("electric") ->
                VoiceCommand.BOOK_ELECTRICIAN
            lowercaseInput.contains("balance") || lowercaseInput.contains("wallet") ->
                VoiceCommand.CHECK_BALANCE
            lowercaseInput.contains("history") || lowercaseInput.contains("transaction") ->
                VoiceCommand.SHOW_HISTORY
            else -> null
        }
    }
}

enum class VoiceCommand {
    BOOK_HVAC,
    BOOK_MECHANIC,
    BOOK_PLUMBER,
    BOOK_ELECTRICIAN,
    CHECK_BALANCE,
    SHOW_HISTORY
}
