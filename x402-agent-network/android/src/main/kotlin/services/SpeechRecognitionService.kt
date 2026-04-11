package com.agentpay.personal.services

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.SpeechRecognizer
import android.util.Log

/**
 * Real Android Speech Recognition Service
 * Uses native SpeechRecognizer for voice-to-text
 */

class SpeechRecognitionService(private val context: Context) {
    companion object {
        private const val TAG = "SpeechRecognition"
        
        fun isSpeechRecognitionAvailable(context: Context): Boolean {
            return SpeechRecognizer.isRecognitionAvailable(context)
        }
    }

    private var speechRecognizer: SpeechRecognizer? = null

    fun startListening(
        onCommandRecognized: (command: String, confidence: Float) -> Unit,
        onPartialResult: (partial: String) -> Unit,
        onError: (error: String) -> Unit
    ) {
        try {
            if (speechRecognizer == null) {
                speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context)
            }

            Log.d(TAG, "Starting speech recognition...")

            val intent = Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(
                    android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL,
                    android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM
                )
                putExtra(android.speech.RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2000)
                putExtra(android.speech.RecognizerIntent.EXTRA_MAX_RESULTS, 5)
            }

            speechRecognizer?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {
                    Log.d(TAG, "Ready for speech")
                }

                override fun onBeginningOfSpeech() {
                    Log.d(TAG, "User started speaking")
                }

                override fun onRmsChanged(rmsdB: Float) {}

                override fun onBufferReceived(buffer: ByteArray?) {}

                override fun onEndOfSpeech() {
                    Log.d(TAG, "User stopped speaking")
                }

                override fun onError(error: Int) {
                    val errorMsg = when (error) {
                        SpeechRecognizer.ERROR_NO_MATCH -> "No speech detected"
                        SpeechRecognizer.ERROR_NETWORK -> "Network error"
                        SpeechRecognizer.ERROR_AUDIO -> "Audio recording error"
                        else -> "Error code: $error"
                    }
                    Log.e(TAG, "Recognition error: $errorMsg")
                    onError(errorMsg)
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION)
                    val confidences = results?.getFloatArray(android.speech.SpeechRecognizer.CONFIDENCE_SCORES)
                    
                    if (!matches.isNullOrEmpty()) {
                        val text = matches[0]
                        val confidence = confidences?.getOrNull(0) ?: 0.5f
                        Log.d(TAG, "Recognized: \"$text\" (confidence: $confidence)")
                        onCommandRecognized(text, confidence)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val partial = partialResults?.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!partial.isNullOrEmpty()) {
                        Log.d(TAG, "Partial: ${partial[0]}")
                        onPartialResult(partial[0])
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })

            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start listening: ${e.message}")
            onError("Failed to start listening")
        }
    }

    fun stopListening() {
        try {
            speechRecognizer?.stopListening()
            Log.d(TAG, "Stopped listening")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping: ${e.message}")
        }
    }

    fun destroy() {
        try {
            speechRecognizer?.destroy()
            speechRecognizer = null
            Log.d(TAG, "Destroyed")
        } catch (e: Exception) {
            Log.e(TAG, "Error destroying: ${e.message}")
        }
    }
}
