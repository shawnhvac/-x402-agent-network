import SwiftUI

struct DashboardView: View {
    @State private var earnings: Double = 0
    @State private var bookingCount: Int = 0
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Stats cards
                    HStack(spacing: 16) {
                        StatCard(title: "Today's Earnings", value: String(format: "$%.2f", earnings), icon: "dollarsign.circle.fill", color: .green)
                        StatCard(title: "Pending Bookings", value: "\(bookingCount)", icon: "calendar.badge.clock", color: .blue)
                    }
                    .padding(.horizontal)
                    
                    // Recent activity placeholder
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Activity")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.horizontal)
                        
                        if isLoading {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                                .padding()
                        } else {
                            Text("No recent activity")
                                .foregroundColor(.gray)
                                .frame(maxWidth: .infinity)
                                .padding()
                        }
                    }
                    .background(Color(.systemGray6).opacity(0.1))
                    .cornerRadius(12)
                    .padding(.horizontal)
                }
                .padding(.top)
            }
            .navigationTitle("Dashboard")
            .background(Color(.systemBackground))
            .task {
                earnings = await AgentPayService.shared.fetchTodayEarnings()
                let bookings = await AgentPayService.shared.fetchBookings()
                bookingCount = bookings.filter { $0.status == "pending" }.count
                isLoading = false
            }
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            Text(value)
                .font(.title2)
                .bold()
                .foregroundColor(.white)
            Text(title)
                .font(.caption)
                .foregroundColor(.gray)
        }
        .padding()
        .background(Color(.systemGray6).opacity(0.2))
        .cornerRadius(12)
    }
}
