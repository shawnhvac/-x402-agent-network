import SwiftUI

struct BookingsView: View {
    @State private var bookings: [Booking] = []
    @State private var isLoading = true
    
    var body: some View {
        NavigationView {
            Group {
                if isLoading {
                    ProgressView("Loading bookings...")
                } else if bookings.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "calendar.badge.exclamationmark")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        Text("No bookings yet")
                            .foregroundColor(.gray)
                    }
                } else {
                    List(bookings, id: \.id) { booking in
                        BookingRow(booking: booking)
                            .listRowBackground(Color(.systemGray6).opacity(0.1))
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Bookings")
            .task {
                bookings = await AgentPayService.shared.fetchBookings()
                isLoading = false
            }
        }
    }
}

struct BookingRow: View {
    let booking: Booking
    
    var statusColor: Color {
        switch booking.status {
        case "pending": return .orange
        case "confirmed": return .green
        case "completed": return .blue
        default: return .gray
        }
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(booking.customerName)
                    .font(.headline)
                    .foregroundColor(.white)
                Text(booking.service)
                    .font(.subheadline)
                    .foregroundColor(.gray)
                Text(booking.scheduledTime)
                    .font(.caption)
                    .foregroundColor(.gray)
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 4) {
                Text(String(format: "$%.2f", booking.amount))
                    .font(.headline)
                    .foregroundColor(.green)
                Text(booking.status.capitalized)
                    .font(.caption)
                    .foregroundColor(statusColor)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(statusColor.opacity(0.2))
                    .cornerRadius(8)
            }
        }
        .padding(.vertical, 8)
    }
}
