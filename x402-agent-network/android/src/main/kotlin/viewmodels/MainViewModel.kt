package com.agentpay.personal.viewmodels

import androidx.lifecycle.ViewModel
import androidx.room.Database
import androidx.room.Room
import androidx.room.Dao
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.Insert
import androidx.room.Query
import android.content.Context
import com.agentpay.personal.models.Transaction
import com.agentpay.personal.models.UserPreferences
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import androidx.lifecycle.viewModelScope

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val agentName: String,
    val serviceType: String,
    val amount: Double,
    val timestamp: Long,
    val status: String,
    val txHash: String?
)

@Dao
interface TransactionDao {
    @Insert
    suspend fun insertTransaction(transaction: TransactionEntity)
    
    @Query("SELECT * FROM transactions ORDER BY timestamp DESC")
    fun getAllTransactions(): Flow<List<TransactionEntity>>
}

@Database(entities = [TransactionEntity::class], version = 1)
abstract class AppDatabase : androidx.room.RoomDatabase() {
    abstract fun transactionDao(): TransactionDao
}

class MainViewModel : ViewModel() {
    private var db: AppDatabase? = null
    
    private val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: Flow<List<Transaction>> = _transactions
    
    private val _preferences = MutableStateFlow<UserPreferences>(UserPreferences())
    val preferences: Flow<UserPreferences> = _preferences
    
    fun initializeDatabase(context: Context) {
        db = Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "agentpay_db"
        ).build()
        
        // Load transactions
        viewModelScope.launch {
            db?.transactionDao()?.getAllTransactions()?.collect { entities ->
                _transactions.value = entities.map { entity ->
                    Transaction(
                        id = entity.id,
                        agentName = entity.agentName,
                        serviceType = entity.serviceType,
                        amount = entity.amount,
                        timestamp = entity.timestamp,
                        status = entity.status,
                        txHash = entity.txHash
                    )
                }
            }
        }
    }
    
    fun addTransaction(transaction: Transaction) {
        viewModelScope.launch {
            db?.transactionDao()?.insertTransaction(
                TransactionEntity(
                    id = transaction.id,
                    agentName = transaction.agentName,
                    serviceType = transaction.serviceType,
                    amount = transaction.amount,
                    timestamp = transaction.timestamp,
                    status = transaction.status,
                    txHash = transaction.txHash
                )
            )
        }
    }
    
    fun saveUserPreferences(preferences: UserPreferences) {
        viewModelScope.launch {
            _preferences.value = preferences
            // Also save to SharedPreferences for persistence
        }
    }
    
    fun loadUserPreferences() {
        // Load from SharedPreferences on app start
    }
}
