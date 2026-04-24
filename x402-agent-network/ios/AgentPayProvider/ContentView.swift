import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "chart.bar.fill") }
            BookingsView()
                .tabItem { Label("Bookings", systemImage: "calendar") }
            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.fill") }
        }
        .accentColor(.blue)
        .preferredColorScheme(.dark)
    }
}
