package com.agentpay.provider

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException

data class BusinessService(
    val id: String = "",
    val name: String = "",
    val category: String = "",
    val description: String = "",
    val price: Double = 0.0,
    val duration: Int = 60,
    val available: Boolean = true,
    val image: String = ""
)

data class BusinessProfile(
    val id: String = "",
    val businessName: String = "",
    val category: String = "",
    val location: String = "",
    val address: String = "",
    val phone: String = "",
    val email: String = "",
    val description: String = "",
    val rating: Float = 0f,
    val reviews: Int = 0
)

data class Booking(
    val id: String = "",
    val customerName: String = "",
    val date: String = "",
    val time: String = "",
    val service: String = "",
    val amount: Double = 0.0,
    val status: String = "pending" // pending, confirmed, completed, cancelled
)

class MainActivityProvider : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgentPayProviderApp()
        }
    }
}

@Composable
fun AgentPayProviderApp() {
    var currentScreen by remember { mutableStateOf("login") }
    var businessProfile by remember { mutableStateOf<BusinessProfile?>(null) }
    var authToken by remember { mutableStateOf("") }
    
    when (currentScreen) {
        "login" -> LoginScreen(
            onLogin = { email, password ->
                // TODO: Authenticate business
                currentScreen = "dashboard"
            }
        )
        "dashboard" -> DashboardScreen(
            profile = businessProfile,
            onLogout = { currentScreen = "login" },
            onNavigate = { screen -> currentScreen = screen }
        )
        "services" -> ServicesManagementScreen(
            onBack = { currentScreen = "dashboard" },
            businessId = businessProfile?.id ?: ""
        )
        "bookings" -> BookingsScreen(
            onBack = { currentScreen = "dashboard" },
            businessId = businessProfile?.id ?: ""
        )
        "analytics" -> AnalyticsScreen(
            onBack = { currentScreen = "dashboard" }
        )
        "settings" -> SettingsScreen(
            profile = businessProfile,
            onBack = { currentScreen = "dashboard" }
        )
    }
}

@Composable
fun LoginScreen(onLogin: (String, String) -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
            .padding(20.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // Logo/Title
        Text(
            "AgentPay Provider",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(bottom = 40.dp)
        )
        
        // Email Field
        TextField(
            value = email,
            onValueChange = { email = it },
            label = { Text("Email") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF1e293b),
                unfocusedContainerColor = Color(0xFF1e293b),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        
        // Password Field
        TextField(
            value = password,
            onValueChange = { password = it },
            label = { Text("Password") },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF1e293b),
                unfocusedContainerColor = Color(0xFF1e293b),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            )
        )
        
        // Login Button
        Button(
            onClick = { onLogin(email, password) },
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF3b82f6)
            )
        ) {
            if (isLoading) {
                CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
            } else {
                Text("Sign In", fontSize = 16.sp)
            }
        }
        
        // Register Link
        Row(modifier = Modifier.padding(top = 20.dp)) {
            Text("Don't have an account? ", color = Color.Gray)
            Text("Register", color = Color(0xFF3b82f6), modifier = Modifier.clickable { })
        }
    }
}

@Composable
fun DashboardScreen(
    profile: BusinessProfile?,
    onLogout: () -> Unit,
    onNavigate: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(20.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    "AgentPay Provider Dashboard",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                if (profile != null) {
                    Text(
                        profile.businessName,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
        }
        
        // Content
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Quick Stats
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard("Revenue", "$0", Modifier.weight(1f))
                    StatCard("Bookings", "0", Modifier.weight(1f))
                }
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard("Rating", "0.0★", Modifier.weight(1f))
                    StatCard("Reviews", "0", Modifier.weight(1f))
                }
            }
            
            // Menu Items
            item { Spacer(modifier = Modifier.height(20.dp)) }
            
            item {
                MenuButton(
                    icon = Icons.Default.ShoppingCart,
                    title = "Services",
                    subtitle = "Manage your services",
                    onClick = { onNavigate("services") }
                )
            }
            
            item {
                MenuButton(
                    icon = Icons.Default.DateRange,
                    title = "Bookings",
                    subtitle = "View pending & confirmed bookings",
                    onClick = { onNavigate("bookings") }
                )
            }
            
            item {
                MenuButton(
                    icon = Icons.Default.BarChart,
                    title = "Analytics",
                    subtitle = "Revenue & performance metrics",
                    onClick = { onNavigate("analytics") }
                )
            }
            
            item {
                MenuButton(
                    icon = Icons.Default.Settings,
                    title = "Settings",
                    subtitle = "Business profile & preferences",
                    onClick = { onNavigate("settings") }
                )
            }
            
            item {
                Button(
                    onClick = onLogout,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7f1d1d))
                ) {
                    Text("Logout")
                }
            }
        }
    }
}

@Composable
fun ServicesManagementScreen(
    onBack: () -> Unit,
    businessId: String
) {
    var services by remember { mutableStateOf(listOf<BusinessService>()) }
    var showAddService by remember { mutableStateOf(false) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text(
                    "Manage Services",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                IconButton(onClick = { showAddService = true }) {
                    Icon(Icons.Default.Add, contentDescription = "Add", tint = Color.White)
                }
            }
        }
        
        if (showAddService) {
            AddServiceDialog(
                onAdd = { service ->
                    services = services + service
                    showAddService = false
                },
                onDismiss = { showAddService = false }
            )
        }
        
        // Services List
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (services.isEmpty()) {
                item {
                    Text(
                        "No services yet. Tap + to add one.",
                        color = Color.Gray,
                        modifier = Modifier.padding(20.dp)
                    )
                }
            } else {
                items(services) { service ->
                    ServiceCard(
                        service = service,
                        onEdit = { /* TODO */ },
                        onDelete = { services = services.filter { it.id != service.id } }
                    )
                }
            }
        }
    }
}

@Composable
fun ServiceCard(
    service: BusinessService,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onEdit() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        service.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        service.category,
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = Color(0xFFef4444))
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "\$${service.price}",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10b981)
                )
                Text(
                    "${service.duration} min",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
                if (service.available) {
                    Text("Available", fontSize = 12.sp, color = Color(0xFF10b981))
                } else {
                    Text("Unavailable", fontSize = 12.sp, color = Color(0xFFef4444))
                }
            }
        }
    }
}

@Composable
fun AddServiceDialog(
    onAdd: (BusinessService) -> Unit,
    onDismiss: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var duration by remember { mutableStateOf("60") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Service", color = Color.White) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                TextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Service Name") },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF1e293b),
                        unfocusedContainerColor = Color(0xFF1e293b),
                        focusedTextColor = Color.White
                    )
                )
                TextField(
                    value = category,
                    onValueChange = { category = it },
                    label = { Text("Category") },
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF1e293b),
                        unfocusedContainerColor = Color(0xFF1e293b),
                        focusedTextColor = Color.White
                    )
                )
                TextField(
                    value = price,
                    onValueChange = { price = it },
                    label = { Text("Price (\$)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF1e293b),
                        unfocusedContainerColor = Color(0xFF1e293b),
                        focusedTextColor = Color.White
                    )
                )
                TextField(
                    value = duration,
                    onValueChange = { duration = it },
                    label = { Text("Duration (minutes)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    colors = TextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF1e293b),
                        unfocusedContainerColor = Color(0xFF1e293b),
                        focusedTextColor = Color.White
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onAdd(
                        BusinessService(
                            id = System.currentTimeMillis().toString(),
                            name = name,
                            category = category,
                            price = price.toDoubleOrNull() ?: 0.0,
                            duration = duration.toIntOrNull() ?: 60
                        )
                    )
                }
            ) {
                Text("Add")
            }
        },
        dismissButton = {
            Button(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun BookingsScreen(onBack: () -> Unit, businessId: String) {
    var bookings by remember { mutableStateOf(listOf<Booking>()) }
    var selectedTab by remember { mutableStateOf("pending") }
    
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0f172a))) {
        // Header
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text(
                    "Bookings",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
        
        // Tabs
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(horizontal = 20.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            listOf("Pending", "Confirmed", "Completed", "Cancelled").forEach { tab ->
                Button(
                    onClick = { selectedTab = tab.lowercase() },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedTab == tab.lowercase()) Color(0xFF3b82f6) else Color(0xFF334155)
                    ),
                    modifier = Modifier.padding(vertical = 12.dp)
                ) {
                    Text(tab, fontSize = 12.sp)
                }
            }
        }
        
        // Bookings List
        LazyColumn(modifier = Modifier.fillMaxSize().padding(20.dp)) {
            if (bookings.isEmpty()) {
                item {
                    Text("No ${selectedTab} bookings", color = Color.Gray)
                }
            } else {
                items(bookings.filter { it.status == selectedTab }) { booking ->
                    BookingCard(booking)
                }
            }
        }
    }
}

@Composable
fun BookingCard(booking: Booking) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(booking.customerName, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(booking.status.uppercase(), fontSize = 12.sp, color = Color(0xFF3b82f6))
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text("${booking.date} at ${booking.time}", fontSize = 12.sp, color = Color.Gray)
            Text("${booking.service} - \$${booking.amount}", fontSize = 12.sp, color = Color(0xFF10b981))
        }
    }
}

@Composable
fun AnalyticsScreen(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0f172a))) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text("Analytics", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
        LazyColumn(modifier = Modifier.fillMaxSize().padding(20.dp)) {
            item { Text("Revenue analytics coming soon", color = Color.Gray) }
        }
    }
}

@Composable
fun SettingsScreen(profile: BusinessProfile?, onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize().background(Color(0xFF0f172a))) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(20.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Text("Settings", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
        LazyColumn(modifier = Modifier.fillMaxSize().padding(20.dp)) {
            item { Text("Profile settings coming soon", color = Color.Gray) }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(100.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(title, fontSize = 12.sp, color = Color.Gray)
            Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}

@Composable
fun MenuButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(icon, contentDescription = title, tint = Color(0xFF3b82f6), modifier = Modifier.size(32.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(subtitle, fontSize = 12.sp, color = Color.Gray)
            }
            Icon(Icons.Default.ChevronRight, contentDescription = "Go", tint = Color.Gray)
        }
    }
}
