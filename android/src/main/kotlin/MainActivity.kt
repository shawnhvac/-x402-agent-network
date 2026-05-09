package com.agentpay

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

data class Provider(
    val id: String,
    val name: String,
    val service: String,
    val price: Double,
    val rating: Float,
    val reviews: Int,
    val distance: Double,
    val address: String,
    val phone: String
)

data class Booking(
    val id: String,
    val provider: String,
    val date: String,
    val time: String,
    val amount: Double,
    val status: String
)

class MainActivityMarketplace : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AgentPayApp()
        }
    }
}

@Composable
fun AgentPayApp(apiKey: String = "") {
    var currentScreen by remember { mutableStateOf("home") }
    var selectedProvider by remember { mutableStateOf<Provider?>(null) }
    
    when (currentScreen) {
        "home" -> HomeScreen { selectedScreen -> currentScreen = selectedScreen }
        "marketplace" -> MarketplaceScreen(
            onBooking = { currentScreen = "booking"; selectedProvider = it },
            onHome = { currentScreen = "home" }
        )
        "booking" -> if (selectedProvider != null) {
            BookingScreen(
                provider = selectedProvider!!,
                onBook = { currentScreen = "dashboard" },
                onBack = { currentScreen = "marketplace" }
            )
        }
        "dashboard" -> DashboardScreen(
            onHome          = { currentScreen = "home" },
            onEscrow        = { currentScreen = "escrow" },
            onNotifications = { currentScreen = "notifications" }
        )
        "escrow" -> EscrowScreen(
            apiKey = apiKey,
            onBack = { currentScreen = "dashboard" }
        )
        "notifications" -> NotificationsScreen(
            apiKey = apiKey,
            onBack = { currentScreen = "dashboard" }
        )
    }
}

@Composable
fun HomeScreen(onNavigate: (String) -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
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
                    "🤖 AgentPay",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF60a5fa)
                )
                Text(
                    "AI-Powered Booking Platform",
                    fontSize = 12.sp,
                    color = Color(0xFFcbd5e1)
                )
            }
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Hero Section
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                "Find Services Instantly",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            
            Text(
                "Book professionals near you with real-time payments",
                fontSize = 14.sp,
                color = Color(0xFFcbd5e1),
                modifier = Modifier.padding(top = 10.dp)
            )
        }

        Spacer(modifier = Modifier.height(30.dp))

        // CTA Buttons
        Button(
            onClick = { onNavigate("marketplace") },
            modifier = Modifier
                .fillMaxWidth(0.8f)
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF10b981)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("Browse Services", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(15.dp))

        Button(
            onClick = { onNavigate("dashboard") },
            modifier = Modifier
                .fillMaxWidth(0.8f)
                .height(50.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFF3b82f6)
            ),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text("My Bookings", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(40.dp))

        // Features
        FeatureCard("💳", "Secure Payments", "Stripe + Solana")
        FeatureCard("⭐", "Verified Pros", "4.8+ ratings")
        FeatureCard("🚀", "Instant Booking", "Confirm in seconds")
    }
}

@Composable
fun FeatureCard(icon: String, title: String, subtitle: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth(0.85f)
            .background(Color(0xFF1e293b), RoundedCornerShape(8.dp))
            .padding(15.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(icon, fontSize = 24.sp, modifier = Modifier.padding(end = 15.dp))
        Column {
            Text(title, fontWeight = FontWeight.Bold, color = Color.White)
            Text(subtitle, fontSize = 12.sp, color = Color(0xFFcbd5e1))
        }
    }
    Spacer(modifier = Modifier.height(15.dp))
}

@Composable
fun MarketplaceScreen(onBooking: (Provider) -> Unit, onHome: () -> Unit) {
    var searchQuery by remember { mutableStateOf("") }
    val providers = listOf(
        Provider("p1", "Pro Salon", "Haircut", 25.0, 4.8f, 42, 0.3, "123 Main St", "555-0001"),
        Provider("p2", "Quick Mechanic", "Oil Change", 45.0, 4.9f, 156, 0.5, "456 Oak Ave", "555-0002"),
        Provider("p3", "Dental Clinic", "Cleaning", 80.0, 4.7f, 89, 0.2, "789 Pine Rd", "555-0003"),
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onHome() }
            )
            Text("Services", color = Color.White, fontWeight = FontWeight.Bold)
            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF60a5fa))
        }

        // Search
        TextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search services...", color = Color(0xFF94a3b8)) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(15.dp),
            colors = TextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF1e293b),
                unfocusedContainerColor = Color(0xFF1e293b),
                focusedTextColor = Color.White
            ),
            shape = RoundedCornerShape(8.dp)
        )

        // Provider List
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 15.dp)
        ) {
            items(providers.filter { it.name.contains(searchQuery, ignoreCase = true) }) { provider ->
                ProviderCard(provider) { onBooking(provider) }
            }
        }
    }
}

@Composable
fun ProviderCard(provider: Provider, onBook: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp)
            .clickable { onBook() },
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(15.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(provider.name, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(provider.service, fontSize = 12.sp, color = Color(0xFFcbd5e1))
                }
                Text("$${provider.price}", fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
            }
            
            Spacer(modifier = Modifier.height(10.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("⭐", fontSize = 14.sp)
                    Text("${provider.rating} (${provider.reviews})", fontSize = 12.sp, color = Color(0xFFcbd5e1))
                }
                Text("${provider.distance} mi away", fontSize = 12.sp, color = Color(0xFFcbd5e1))
            }
        }
    }
}

@Composable
fun BookingScreen(provider: Provider, onBook: () -> Unit, onBack: () -> Unit) {
    var selectedDate by remember { mutableStateOf("") }
    var selectedTime by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onBack() }
            )
            Text("Book Service", color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 10.dp))
        }

        Column(modifier = Modifier.padding(20.dp)) {
            // Provider Info
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(modifier = Modifier.padding(15.dp)) {
                    Text(provider.name, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                    Text(provider.service, color = Color(0xFFcbd5e1), fontSize = 14.sp)
                    Text("${provider.address} • ${provider.phone}", color = Color(0xFF94a3b8), fontSize = 12.sp, modifier = Modifier.padding(top = 10.dp))
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Date Selection
            Text("Select Date", fontWeight = FontWeight.Bold, color = Color.White)
            TextField(
                value = selectedDate,
                onValueChange = { selectedDate = it },
                placeholder = { Text("YYYY-MM-DD", color = Color(0xFF94a3b8)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1e293b),
                    unfocusedContainerColor = Color(0xFF1e293b)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(15.dp))

            // Time Selection
            Text("Select Time", fontWeight = FontWeight.Bold, color = Color.White)
            TextField(
                value = selectedTime,
                onValueChange = { selectedTime = it },
                placeholder = { Text("HH:MM", color = Color(0xFF94a3b8)) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color(0xFF1e293b),
                    unfocusedContainerColor = Color(0xFF1e293b)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(30.dp))

            // Price Summary
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1e2e3b)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Column(modifier = Modifier.padding(15.dp)) {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Service", color = Color(0xFFcbd5e1))
                        Text("$${provider.price}", color = Color(0xFFcbd5e1))
                    }
                    Row(modifier = Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Fee", color = Color(0xFFcbd5e1))
                        Text("$${(provider.price * 0.025).toInt()}", color = Color(0xFFcbd5e1))
                    }
                    Divider(modifier = Modifier.padding(vertical = 10.dp), color = Color(0xFF334155))
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("Total", fontWeight = FontWeight.Bold, color = Color.White)
                        Text("$${(provider.price * 1.025).toInt()}", fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Book Button
            Button(
                onClick = { onBook() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10b981)),
                shape = RoundedCornerShape(8.dp),
                enabled = selectedDate.isNotEmpty() && selectedTime.isNotEmpty()
            ) {
                Text("Confirm Booking", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun DashboardScreen(onHome: () -> Unit, onEscrow: () -> Unit = {}, onNotifications: () -> Unit = {}) {
    val bookings = listOf(
        Booking("b1", "Pro Salon", "2026-04-15", "14:30", 25.0, "Confirmed"),
        Booking("b2", "Quick Mechanic", "2026-04-18", "10:00", 45.0, "Pending")
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0f172a))
    ) {
        // Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color(0xFF1e293b))
                .padding(15.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Icon(
                Icons.Default.ArrowBack,
                contentDescription = "Back",
                tint = Color(0xFF60a5fa),
                modifier = Modifier.clickable { onHome() }
            )
            Text("My Bookings", color = Color.White, fontWeight = FontWeight.Bold)
            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF60a5fa))
        }

        // Stats
        Row(modifier = Modifier
            .fillMaxWidth()
            .padding(15.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatCard("${bookings.size}", "Total Bookings")
            StatCard("$${bookings.sumOf { it.amount }}", "Spent")
            StatCard("${bookings.count { it.status == "Confirmed" }}", "Completed")
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Quick Actions — Escrow + Notifications
        Spacer(modifier = Modifier.height(8.dp))
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 15.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = onEscrow,
                colors  = ButtonDefaults.buttonColors(containerColor = Color(0xFF6366F1)),
                shape   = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(52.dp)
            ) {
                Text("💼 Escrow", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Button(
                onClick = onNotifications,
                colors  = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F2040)),
                shape   = RoundedCornerShape(12.dp),
                modifier = Modifier.weight(1f).height(52.dp)
            ) {
                Text("🔔 Alerts", fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))

        // Booking List
        LazyColumn(modifier = Modifier.padding(horizontal = 15.dp)) {
            items(bookings) { booking ->
                BookingCard(booking)
            }
        }
    }
}

@Composable
fun StatCard(value: String, label: String) {
    Card(
        modifier = Modifier
            .weight(1f)
            .padding(5.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(15.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(value, fontWeight = FontWeight.Bold, color = Color(0xFF60a5fa), fontSize = 16.sp)
            Text(label, fontSize = 11.sp, color = Color(0xFFcbd5e1))
        }
    }
}

@Composable
fun BookingCard(booking: Booking) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1e293b)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Column(modifier = Modifier.padding(15.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(booking.provider, fontWeight = FontWeight.Bold, color = Color.White)
                    Text("${booking.date} at ${booking.time}", fontSize = 12.sp, color = Color(0xFFcbd5e1))
                }
                Text("$${booking.amount}", fontWeight = FontWeight.Bold, color = Color(0xFF10b981))
            }
            
            Spacer(modifier = Modifier.height(10.dp))
            
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Status: ${booking.status}", fontSize = 12.sp, color = Color(0xFFcbd5e1))
                Button(
                    onClick = { },
                    modifier = Modifier.height(30.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF3b82f6)),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text("View", fontSize = 11.sp)
                }
            }
        }
    }
}
