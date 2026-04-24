import AppIntents
import Foundation

// ─── Check Bookings Intent (Siri: "Hey Siri, check my AgentPay bookings") ───
struct CheckBookingsIntent: AppIntent {
    static var title: LocalizedStringResource = "Check My Bookings"
    static var description = IntentDescription("Get a summary of your upcoming AgentPay bookings.")
    static var openAppWhenRun: Bool = false

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let bookings = await AgentPayService.shared.fetchBookings()
        let count = bookings.filter { $0.status == "pending" }.count
        return .result(dialog: "You have \(count) pending booking\(count == 1 ? "" : "s") today.")
    }
}

// ─── Accept Booking Intent (Siri: "Hey Siri, accept my next AgentPay booking") ───
struct AcceptBookingIntent: AppIntent {
    static var title: LocalizedStringResource = "Accept Next Booking"
    static var description = IntentDescription("Accept your next pending AgentPay booking.")

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        guard let booking = await AgentPayService.shared.fetchNextPendingBooking() else {
            return .result(dialog: "You have no pending bookings right now.")
        }
        let success = await AgentPayService.shared.acceptBooking(id: booking.id)
        if success {
            return .result(dialog: "Booking from \(booking.customerName) accepted. They will be notified by SMS.")
        } else {
            return .result(dialog: "Sorry, I could not accept that booking. Please try again.")
        }
    }
}

// ─── Check Earnings Intent (Siri: "Hey Siri, how much did I earn today on AgentPay?") ───
struct CheckEarningsIntent: AppIntent {
    static var title: LocalizedStringResource = "Check Today's Earnings"
    static var description = IntentDescription("Get your AgentPay earnings for today.")

    @MainActor
    func perform() async throws -> some IntentResult & ProvidesDialog {
        let earnings = await AgentPayService.shared.fetchTodayEarnings()
        let formatted = String(format: "$%.2f", earnings)
        return .result(dialog: "You have earned \(formatted) today on AgentPay.")
    }
}

// ─── App Shortcuts (appear automatically in Siri suggestions) ───
struct AgentPayShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CheckBookingsIntent(),
            phrases: [
                "Check my \(.applicationName) bookings",
                "How many bookings do I have on \(.applicationName)",
                "Show my \(.applicationName) schedule"
            ],
            shortTitle: "Check Bookings",
            systemImageName: "calendar"
        )
        AppShortcut(
            intent: AcceptBookingIntent(),
            phrases: [
                "Accept my next \(.applicationName) booking",
                "Confirm my \(.applicationName) appointment"
            ],
            shortTitle: "Accept Booking",
            systemImageName: "checkmark.circle.fill"
        )
        AppShortcut(
            intent: CheckEarningsIntent(),
            phrases: [
                "How much did I earn today on \(.applicationName)",
                "Check my \(.applicationName) earnings"
            ],
            shortTitle: "Today's Earnings",
            systemImageName: "dollarsign.circle.fill"
        )
    }
}
