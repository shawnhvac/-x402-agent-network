import SwiftUI

struct ProfileView: View {
    @State private var businessName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var category = "HVAC"
    @State private var isSaving = false
    @State private var saveMessage = ""
    
    let categories = ["HVAC", "Plumbing", "Electrical", "Cleaning", "Landscaping", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Business Info")) {
                    TextField("Business Name", text: $businessName)
                    TextField("Email", text: $email)
                        .keyboardType(.emailAddress)
                    TextField("Phone", text: $phone)
                        .keyboardType(.phonePad)
                }
                
                Section(header: Text("Service Category")) {
                    Picker("Category", selection: $category) {
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                }
                
                Section {
                    Button(action: saveProfile) {
                        if isSaving {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        } else {
                            Text("Save Profile")
                                .frame(maxWidth: .infinity)
                                .foregroundColor(.white)
                        }
                    }
                    .listRowBackground(Color.blue)
                }
                
                if !saveMessage.isEmpty {
                    Section {
                        Text(saveMessage)
                            .foregroundColor(.green)
                    }
                }
            }
            .navigationTitle("My Profile")
        }
    }
    
    func saveProfile() {
        isSaving = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            isSaving = false
            saveMessage = "Profile saved successfully!"
        }
    }
}
