import Foundation

struct Booking: Codable {
    let id: String
    let customerName: String
    let service: String
    let scheduledTime: String
    let status: String
    let amount: Double
}

@MainActor
class AgentPayService {
    static let shared = AgentPayService()
    
    private let baseURL = "https://www.x402-agent-pay.com/api/v1"
    
    private var authToken: String? {
        UserDefaults.standard.string(forKey: "agentpay_token")
    }
    
    func fetchBookings() async -> [Booking] {
        guard let token = authToken,
              let url = URL(string: "\(baseURL)/provider/bookings") else { return [] }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            let decoded = try JSONDecoder().decode([Booking].self, from: data)
            return decoded
        } catch {
            print("fetchBookings error: \(error)")
            return []
        }
    }
    
    func fetchNextPendingBooking() async -> Booking? {
        let all = await fetchBookings()
        return all.first { $0.status == "pending" }
    }
    
    func acceptBooking(id: String) async -> Bool {
        guard let token = authToken,
              let url = URL(string: "\(baseURL)/provider/bookings/\(id)/accept") else { return false }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let (_, response) = try await URLSession.shared.data(for: request)
            return (response as? HTTPURLResponse)?.statusCode == 200
        } catch { return false }
    }
    
    func fetchTodayEarnings() async -> Double {
        guard let token = authToken,
              let url = URL(string: "\(baseURL)/provider/earnings/today") else { return 0 }
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        do {
            let (data, _) = try await URLSession.shared.data(for: request)
            if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any],
               let amount = json["total"] as? Double {
                return amount
            }
        } catch {}
        return 0
    }
}
