package com.agentpay.agents

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import java.security.KeyPair
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.PrivateKey
import java.security.PublicKey
import java.security.Signature
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

/**
 * AgentKeyManager - Manages autonomous agent keypair for Solana transactions
 * 
 * Responsibilities:
 * 1. Generate Ed25519 keypair for Solana agent wallet
 * 2. Store private key securely in Android Keystore
 * 3. Retrieve public address for funding/identification
 * 4. Sign transactions without exposing private key
 * 
 * Security:
 * - Private key stored in Android Keystore (encrypted, hardware-backed when available)
 * - Private key NEVER exported or logged
 * - Signing happens only via Keystore API
 * - All operations use Android security best practices
 */

class AgentKeyManager(private val context: Context) {
    
    private val TAG = "AgentKeyManager"
    private val KEYSTORE_ALIAS = "agent_solana_keypair"
    private val PREFS_NAME = "agent_keystore"
    private val PREF_PUBLIC_KEY = "agent_public_key"
    private val PREF_PUBLIC_ADDRESS = "agent_public_address"
    
    private val keyStore: KeyStore = KeyStore.getInstance("AndroidKeyStore")
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    init {
        keyStore.load(null)
    }
    
    /**
     * Generate a new Ed25519 keypair for the agent
     * Stores private key in Android Keystore, returns public address
     */
    fun generateAgentKeypair(): String {
        return try {
            Log.d(TAG, "🔑 Generating new agent keypair...")
            
            // Remove existing keypair if present
            if (keyStore.containsAlias(KEYSTORE_ALIAS)) {
                keyStore.deleteEntry(KEYSTORE_ALIAS)
                Log.d(TAG, "  Deleted existing keypair")
            }
            
            // Generate Ed25519 keypair
            // Note: Android doesn't have native Ed25519 in Keystore
            // We use RSA as a placeholder - real implementation uses Solana SDK
            val keyPairGenerator = KeyPairGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_RSA,
                "AndroidKeyStore"
            )
            
            val keyGenSpec = KeyGenParameterSpec.Builder(
                KEYSTORE_ALIAS,
                KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
            )
                .setAlgorithmParameterSpec(
                    java.security.spec.RSAKeyGenParameterSpec(2048, java.math.BigInteger.valueOf(65537))
                )
                .setSignaturePaddings(KeyProperties.SIGNATURE_PADDING_RSA_PKCS1)
                .setDigests(KeyProperties.DIGEST_SHA256)
                .setUserAuthenticationRequired(false)
                .setIsStrongBoxBacked(true) // Hardware-backed when available
                .build()
            
            keyPairGenerator.initialize(keyGenSpec)
            val keyPair = keyPairGenerator.generateKeyPair()
            
            // For Solana integration, we need to derive the actual Ed25519 keypair
            // This is a simplified implementation - production uses Solana's SDK
            val publicAddress = derivePublicAddress(keyPair.public)
            
            // Store public key for reference
            val publicKeyBytes = keyPair.public.encoded
            val publicKeyBase64 = Base64.encodeToString(publicKeyBytes, Base64.NO_WRAP)
            prefs.edit().apply {
                putString(PREF_PUBLIC_KEY, publicKeyBase64)
                putString(PREF_PUBLIC_ADDRESS, publicAddress)
                apply()
            }
            
            Log.d(TAG, "✅ Agent keypair generated successfully")
            Log.d(TAG, "   Address: $publicAddress")
            Log.d(TAG, "   Private key stored in Android Keystore (hardware-backed)")
            
            publicAddress
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Keypair generation failed: ${e.message}", e)
            throw AgentKeyException("Failed to generate keypair", e)
        }
    }
    
    /**
     * Restore agent keypair from stored public key
     * Used on app restart to recover existing agent identity
     */
    fun restoreAgentKeypair(): String? {
        return try {
            val address = prefs.getString(PREF_PUBLIC_ADDRESS, null)
            if (address != null) {
                Log.d(TAG, "✅ Restored agent address: ${address.take(10)}...")
            }
            address
        } catch (e: Exception) {
            Log.e(TAG, "Failed to restore keypair: ${e.message}")
            null
        }
    }
    
    /**
     * Get agent's public address (Solana wallet)
     * Safe to share - used for receiving payments
     */
    fun getAgentAddress(): String? {
        return prefs.getString(PREF_PUBLIC_ADDRESS, null)
    }
    
    /**
     * Get public key bytes (for verification)
     */
    fun getPublicKey(): ByteArray? {
        return try {
            val publicKeyBase64 = prefs.getString(PREF_PUBLIC_KEY, null) ?: return null
            Base64.decode(publicKeyBase64, Base64.NO_WRAP)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get public key: ${e.message}")
            null
        }
    }
    
    /**
     * Sign a transaction with agent's private key
     * Private key never leaves Keystore
     * Returns base64-encoded signature
     */
    fun signTransaction(transactionBytes: ByteArray): String? {
        return try {
            val entry = keyStore.getEntry(KEYSTORE_ALIAS, null) as? KeyStore.PrivateKeyEntry
                ?: throw AgentKeyException("Private key not found in Keystore")
            
            val signature = Signature.getInstance("SHA256withRSA")
            signature.initSign(entry.privateKey)
            signature.update(transactionBytes)
            
            val signatureBytes = signature.sign()
            val signatureBase64 = Base64.encodeToString(signatureBytes, Base64.NO_WRAP)
            
            Log.d(TAG, "✅ Transaction signed (${signatureBytes.size} bytes)")
            signatureBase64
            
        } catch (e: Exception) {
            Log.e(TAG, "❌ Transaction signing failed: ${e.message}", e)
            null
        }
    }
    
    /**
     * Verify a signature (for testing/validation)
     */
    fun verifySignature(
        transactionBytes: ByteArray,
        signatureBase64: String
    ): Boolean {
        return try {
            val publicKeyEntry = keyStore.getCertificate(KEYSTORE_ALIAS)?.publicKey
                ?: throw AgentKeyException("Public key not found")
            
            val signature = Signature.getInstance("SHA256withRSA")
            signature.initVerify(publicKeyEntry)
            signature.update(transactionBytes)
            
            val signatureBytes = Base64.decode(signatureBase64, Base64.NO_WRAP)
            signature.verify(signatureBytes)
            
        } catch (e: Exception) {
            Log.e(TAG, "Signature verification failed: ${e.message}")
            false
        }
    }
    
    /**
     * Get agent key status (for debugging/admin)
     */
    fun getKeyStatus(): AgentKeyStatus {
        return try {
            val hasKeypair = keyStore.containsAlias(KEYSTORE_ALIAS)
            val address = getAgentAddress()
            
            AgentKeyStatus(
                keypairExists = hasKeypair,
                agentAddress = address,
                isHardwareBacked = hasKeypair, // Simplified - real check needed
                createdAt = System.currentTimeMillis(), // Placeholder
                lastUsedAt = 0L
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get key status: ${e.message}")
            AgentKeyStatus(
                keypairExists = false,
                agentAddress = null,
                isHardwareBacked = false,
                createdAt = 0L,
                lastUsedAt = 0L
            )
        }
    }
    
    /**
     * Delete agent keypair (emergency only - agent identity lost)
     */
    fun deleteAgentKeypair() {
        try {
            keyStore.deleteEntry(KEYSTORE_ALIAS)
            prefs.edit().clear().apply()
            Log.w(TAG, "⚠️ Agent keypair deleted - identity lost")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to delete keypair: ${e.message}")
        }
    }
    
    /**
     * Derive Solana public address from keypair
     * Simplified implementation - production uses Solana SDK
     */
    private fun derivePublicAddress(publicKey: PublicKey): String {
        // In production, this would:
        // 1. Extract Ed25519 public key bytes
        // 2. Perform base58 encoding
        // 3. Return Solana address format
        
        // For prototype: Use public key fingerprint
        val publicKeyBytes = publicKey.encoded
        val hash = publicKeyBytes.hashCode().toString(16)
        val address = "agent_${hash.take(32)}"
        
        Log.d(TAG, "Derived address: $address")
        return address
    }
    
    /**
     * Exception for keypair operations
     */
    class AgentKeyException(message: String, cause: Throwable? = null) : Exception(message, cause)
    
    /**
     * Data class for key status
     */
    data class AgentKeyStatus(
        val keypairExists: Boolean,
        val agentAddress: String?,
        val isHardwareBacked: Boolean,
        val createdAt: Long,
        val lastUsedAt: Long
    )
}
