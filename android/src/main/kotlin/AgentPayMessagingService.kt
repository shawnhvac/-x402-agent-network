package com.agentpay

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.net.URL
import javax.net.ssl.HttpsURLConnection

class AgentPayMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "AgentPayFCM"
        const val CHANNEL_ID_ESCROW   = "agentpay_escrow"
        const val CHANNEL_ID_GENERAL  = "agentpay_general"
        private const val PREFS_NAME   = "agentpay_prefs"
        private const val KEY_API_KEY  = "api_key"
        private const val KEY_FCM_TOKEN = "fcm_token"
    }

    // ── Called when a new FCM token is generated ─────────────────────────────
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        // Save locally
        val prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_FCM_TOKEN, token).apply()
        // Register with AgentPay API
        val apiKey = prefs.getString(KEY_API_KEY, "") ?: ""
        if (apiKey.isNotEmpty()) {
            registerTokenWithServer(apiKey, token)
        }
    }

    // ── Called when message received in foreground/background ────────────────
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "FCM message from: ${remoteMessage.from}")

        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "AgentPay"
        val body  = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: "You have a new notification"
        val data  = remoteMessage.data

        // Determine channel based on type
        val type    = data["type"] ?: data["escrow_id"]?.let { "escrow" } ?: "general"
        val channel = if (type.contains("escrow")) CHANNEL_ID_ESCROW else CHANNEL_ID_GENERAL

        sendNotification(title, body, channel, data)
    }

    // ── Build and show local notification ────────────────────────────────────
    private fun sendNotification(
        title: String, body: String,
        channelId: String, data: Map<String, String>
    ) {
        // Intent to open app
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            data.forEach { (k, v) -> putExtra(k, v) }
            // Deep link to escrow screen if applicable
            if (data.containsKey("escrow_id")) {
                putExtra("open_screen", "escrow")
            }
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val icon     = android.R.drawable.ic_dialog_info

        // Choose emoji icon based on type
        val notifTitle = when {
            title.contains("accepted", ignoreCase = true) -> "✅ $title"
            title.contains("denied",   ignoreCase = true) -> "❌ $title"
            title.contains("booking",  ignoreCase = true) -> "💰 $title"
            title.contains("expired",  ignoreCase = true) -> "⏰ $title"
            else -> title
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(icon)
            .setContentTitle(notifTitle)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setAutoCancel(true)
            .setSound(soundUri)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .build()

        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Create channels (Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            listOf(
                NotificationChannel(
                    CHANNEL_ID_ESCROW, "Escrow & Bookings",
                    NotificationManager.IMPORTANCE_HIGH
                ).apply { description = "New booking requests and escrow updates" },
                NotificationChannel(
                    CHANNEL_ID_GENERAL, "General Alerts",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply { description = "General AgentPay notifications" }
            ).forEach { manager.createNotificationChannel(it) }
        }

        manager.notify(System.currentTimeMillis().toInt(), notification)
        Log.d(TAG, "Notification shown: $notifTitle")
    }

    // ── Register FCM token with AgentPay server ───────────────────────────────
    private fun registerTokenWithServer(apiKey: String, token: String) {
        Thread {
            try {
                val url  = URL("https://www.x402-agent-pay.com/api/agentpay/device/register-token")
                val conn = url.openConnection() as HttpsURLConnection
                conn.requestMethod = "POST"
                conn.setRequestProperty("Content-Type", "application/json")
                conn.setRequestProperty("X-AgentPay-Key", apiKey)
                conn.doOutput = true
                conn.connectTimeout = 10000
                val body = JSONObject().put("fcm_token", token).toString()
                conn.outputStream.write(body.toByteArray())
                val code = conn.responseCode
                Log.d(TAG, "Token registered with server: HTTP $code")
            } catch (e: Exception) {
                Log.e(TAG, "Token registration failed: ${e.message}")
            }
        }.start()
    }
}

// ── Helper: register token on login ──────────────────────────────────────────
fun registerFcmToken(context: Context, apiKey: String) {
    com.google.firebase.messaging.FirebaseMessaging.getInstance().token
        .addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w("FCM", "Token fetch failed: ${task.exception}")
                return@addOnCompleteListener
            }
            val token = task.result
            Log.d("FCM", "Got FCM token: $token")
            // Save locally
            context.getSharedPreferences("agentpay_prefs", Context.MODE_PRIVATE)
                .edit().putString("fcm_token", token).putString("api_key", apiKey).apply()
            // Register with server
            Thread {
                try {
                    val url  = URL("https://www.x402-agent-pay.com/api/agentpay/device/register-token")
                    val conn = url.openConnection() as HttpsURLConnection
                    conn.requestMethod = "POST"
                    conn.setRequestProperty("Content-Type", "application/json")
                    conn.setRequestProperty("X-AgentPay-Key", apiKey)
                    conn.doOutput = true
                    conn.connectTimeout = 10000
                    val body = JSONObject().put("fcm_token", token).toString()
                    conn.outputStream.write(body.toByteArray())
                    Log.d("FCM", "Token registered: HTTP ${conn.responseCode}")
                } catch (e: Exception) {
                    Log.e("FCM", "Registration error: ${e.message}")
                }
            }.start()
        }
}
