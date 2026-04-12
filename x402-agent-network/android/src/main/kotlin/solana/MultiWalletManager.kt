package com.agentpay.solana

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.util.Base64

/**
 * MultiWalletManager - Support for Phantom, Solflare, and Jupiter wallets
 * Handles wallet discovery, connection, and transaction signing
 */
class MultiWalletManager(private val context: Context) {
    
    private val TAG = "MultiWalletManager"
    
    // Wallet types
    enum class WalletType {
        PHANTOM, SOLFLARE, JUPITER, UNKNOWN
    }
    
    data class WalletInfo(
        val type: WalletType,
        val packageName: String,
        val deepLinkScheme: String,
        val displayName: String,
        val isInstalled: Boolean
    )
    
    data class SignedTransaction(
        val transactionSignature: String,
        val walletAddress: String,
        val walletType: WalletType,
        val timestamp: Long
    )
    
    companion object {
        // Wallet package names
        const val PHANTOM_PACKAGE = "app.phantom"
        const val SOLFLARE_PACKAGE = "com.solflare.mobile"
        const val JUPITER_PACKAGE = "com.jupiter.app"
        
        // Deep link schemes
        const val PHANTOM_SCHEME = "phantom://"
        const val SOLFLARE_SCHEME = "solflare://"
        const val JUPITER_SCHEME = "jupiter://"
        
        // Shared preferences key
        const val PREF_CONNECTED_WALLET = "connected_wallet"
        const val PREF_WALLET_ADDRESS = "wallet_address"
    }
    
    /**
     * Discover installed wallets on device
     */
    fun discoverInstalledWallets(): List<WalletInfo> {
        val installed = mutableListOf<WalletInfo>()
        val pm = context.packageManager
        
        // Check Phantom
        try {
            pm.getPackageInfo(PHANTOM_PACKAGE, 0)
            installed.add(WalletInfo(
                type = WalletType.PHANTOM,
                packageName = PHANTOM_PACKAGE,
                deepLinkScheme = PHANTOM_SCHEME,
                displayName = "Phantom",
                isInstalled = true
            ))
            Log.d(TAG, "✅ Phantom wallet detected")
        } catch (e: Exception) {
            Log.d(TAG, "Phantom not installed")
        }
        
        // Check Solflare
        try {
            pm.getPackageInfo(SOLFLARE_PACKAGE, 0)
            installed.add(WalletInfo(
                type = WalletType.SOLFLARE,
                packageName = SOLFLARE_PACKAGE,
                deepLinkScheme = SOLFLARE_SCHEME,
                displayName = "Solflare",
                isInstalled = true
            ))
            Log.d(TAG, "✅ Solflare wallet detected")
        } catch (e: Exception) {
            Log.d(TAG, "Solflare not installed")
        }
        
        // Check Jupiter
        try {
            pm.getPackageInfo(JUPITER_PACKAGE, 0)
            installed.add(WalletInfo(
                type = WalletType.JUPITER,
                packageName = JUPITER_PACKAGE,
                deepLinkScheme = JUPITER_SCHEME,
                displayName = "Jupiter",
                isInstalled = true
            ))
            Log.d(TAG, "✅ Jupiter wallet detected")
        } catch (e: Exception) {
            Log.d(TAG, "Jupiter not installed")
        }
        
        Log.d(TAG, "Found ${installed.size} installed wallets")
        return installed
    }
    
    /**
     * Connect to a specific wallet
     */
    suspend fun connectWallet(walletType: WalletType): Boolean = withContext(Dispatchers.IO) {
        try {
            val scheme = when (walletType) {
                WalletType.PHANTOM -> PHANTOM_SCHEME
                WalletType.SOLFLARE -> SOLFLARE_SCHEME
                WalletType.JUPITER -> JUPITER_SCHEME
                else -> return@withContext false
            }
            
            // Save preference
            val prefs = context.getSharedPreferences("agentpay_wallet", Context.MODE_PRIVATE)
            prefs.edit().apply {
                putString("wallet_type", walletType.name)
                apply()
            }
            
            Log.d(TAG, "Connected to ${walletType.name}")
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Connection failed: ${e.message}")
            return@withContext false
        }
    }
    
    /**
     * Get connected wallet address
     * In real implementation, this would fetch from wallet via deep link
     */
    fun getConnectedWalletAddress(): String? {
        val prefs = context.getSharedPreferences("agentpay_wallet", Context.MODE_PRIVATE)
        return prefs.getString(PREF_WALLET_ADDRESS, null)
    }
    
    /**
     * Get current connected wallet type
     */
    fun getConnectedWalletType(): WalletType? {
        val prefs = context.getSharedPreferences("agentpay_wallet", Context.MODE_PRIVATE)
        val typeName = prefs.getString("wallet_type", null) ?: return null
        return try {
            WalletType.valueOf(typeName)
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Sign a transaction with connected wallet
     * Each wallet uses slightly different signing format
     */
    fun signTransaction(
        transactionBase64: String,
        onSuccess: (SignedTransaction) -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            val walletType = getConnectedWalletType()
                ?: run { onError("No wallet connected"); return }
            
            val walletAddress = getConnectedWalletAddress()
                ?: run { onError("Wallet address not found"); return }
            
            Log.d(TAG, "Signing transaction with ${walletType.name}...")
            
            when (walletType) {
                WalletType.PHANTOM -> signWithPhantom(transactionBase64, walletAddress, onSuccess, onError)
                WalletType.SOLFLARE -> signWithSolflare(transactionBase64, walletAddress, onSuccess, onError)
                WalletType.JUPITER -> signWithJupiter(transactionBase64, walletAddress, onSuccess, onError)
                else -> onError("Unknown wallet type")
            }
        } catch (e: Exception) {
            onError("Signing error: ${e.message}")
        }
    }
    
    /**
     * Sign with Phantom wallet via deep link
     */
    private fun signWithPhantom(
        transactionBase64: String,
        walletAddress: String,
        onSuccess: (SignedTransaction) -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            // Build Phantom deep link for signing
            // Format: phantom://sign-tx?tx={base64}&returnUrl={app_scheme}
            val returnUrl = "agentpay://transaction-signed"
            val deepLink = "phantom://sign-tx?tx=$transactionBase64&returnUrl=$returnUrl"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            context.startActivity(intent)
            Log.d(TAG, "✅ Phantom signing request sent")
            
            // In real implementation, you'd use a callback/listener for the signed response
            // For now, simulate success after delay
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val signature = generateMockSignature()
                onSuccess(SignedTransaction(
                    transactionSignature = signature,
                    walletAddress = walletAddress,
                    walletType = WalletType.PHANTOM,
                    timestamp = System.currentTimeMillis()
                ))
            }, 2000)
            
        } catch (e: Exception) {
            onError("Phantom signing failed: ${e.message}")
        }
    }
    
    /**
     * Sign with Solflare wallet via deep link
     */
    private fun signWithSolflare(
        transactionBase64: String,
        walletAddress: String,
        onSuccess: (SignedTransaction) -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            // Build Solflare deep link
            val returnUrl = "agentpay://transaction-signed"
            val deepLink = "solflare://sign-tx?tx=$transactionBase64&returnUrl=$returnUrl"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            context.startActivity(intent)
            Log.d(TAG, "✅ Solflare signing request sent")
            
            // Simulate callback
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val signature = generateMockSignature()
                onSuccess(SignedTransaction(
                    transactionSignature = signature,
                    walletAddress = walletAddress,
                    walletType = WalletType.SOLFLARE,
                    timestamp = System.currentTimeMillis()
                ))
            }, 2000)
            
        } catch (e: Exception) {
            onError("Solflare signing failed: ${e.message}")
        }
    }
    
    /**
     * Sign with Jupiter wallet via deep link
     */
    private fun signWithJupiter(
        transactionBase64: String,
        walletAddress: String,
        onSuccess: (SignedTransaction) -> Unit,
        onError: (String) -> Unit
    ) {
        try {
            // Build Jupiter deep link
            val returnUrl = "agentpay://transaction-signed"
            val deepLink = "jupiter://sign-tx?tx=$transactionBase64&returnUrl=$returnUrl"
            
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLink))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            context.startActivity(intent)
            Log.d(TAG, "✅ Jupiter signing request sent")
            
            // Simulate callback
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                val signature = generateMockSignature()
                onSuccess(SignedTransaction(
                    transactionSignature = signature,
                    walletAddress = walletAddress,
                    walletType = WalletType.JUPITER,
                    timestamp = System.currentTimeMillis()
                ))
            }, 2000)
            
        } catch (e: Exception) {
            onError("Jupiter signing failed: ${e.message}")
        }
    }
    
    /**
     * Generate mock signature for testing
     * In production, this comes from the wallet app
     */
    private fun generateMockSignature(): String {
        val bytes = ByteArray(64) { (System.nanoTime() % 256).toByte() }
        return Base64.getEncoder().encodeToString(bytes)
    }
    
    /**
     * Disconnect wallet
     */
    fun disconnectWallet() {
        val prefs = context.getSharedPreferences("agentpay_wallet", Context.MODE_PRIVATE)
        prefs.edit().apply {
            remove("wallet_type")
            remove(PREF_WALLET_ADDRESS)
            apply()
        }
        Log.d(TAG, "Wallet disconnected")
    }
    
    /**
     * Check if wallet is connected
     */
    fun isWalletConnected(): Boolean {
        val prefs = context.getSharedPreferences("agentpay_wallet", Context.MODE_PRIVATE)
        return prefs.getString("wallet_type", null) != null
    }
}
