/**
 * Agent Dashboard - Registration & Profile Management
 * Agents can register, manage their profile, and view earnings
 */
import React, { useState } from 'react';
import { Settings, TrendingUp, DollarSign, Edit2 } from 'lucide-react';
export default function AgentDashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [agentProfile, setAgentProfile] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showRegistration, setShowRegistration] = useState(false);
    return (<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Agent Dashboard</h1>
            <p className="text-green-100">Manage your autonomous agent profile</p>
          </div>
          {isLoggedIn && (<button onClick={() => setIsLoggedIn(false)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
              Logout
            </button>)}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Login / Registration */}
        {!isLoggedIn ? (<LoginRegistration onLogin={() => setIsLoggedIn(true)} onRegister={() => {
                setIsLoggedIn(true);
                setShowRegistration(false);
            }}/>) : (<>
            {/* Agent Overview */}
            {agentProfile && (<>
                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-gray-700">
                  <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-semibold border-b-2 transition ${activeTab === 'overview'
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-gray-400 hover:text-white'}`}>
                    Overview
                  </button>
                  <button onClick={() => setActiveTab('edit')} className={`px-6 py-3 font-semibold border-b-2 transition ${activeTab === 'edit'
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-gray-400 hover:text-white'}`}>
                    Edit Profile
                  </button>
                  <button onClick={() => setActiveTab('earnings')} className={`px-6 py-3 font-semibold border-b-2 transition ${activeTab === 'earnings'
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-gray-400 hover:text-white'}`}>
                    Earnings
                  </button>
                  <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 font-semibold border-b-2 transition ${activeTab === 'settings'
                    ? 'border-green-500 text-green-500'
                    : 'border-transparent text-gray-400 hover:text-white'}`}>
                    Settings
                  </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && <OverviewTab agent={agentProfile}/>}
                {activeTab === 'edit' && <EditProfileTab agent={agentProfile}/>}
                {activeTab === 'earnings' && <EarningsTab agent={agentProfile}/>}
                {activeTab === 'settings' && <SettingsTab agent={agentProfile}/>}
              </>)}
          </>)}
      </div>
    </div>);
}
/**
 * Login / Registration Component
 */
function LoginRegistration({ onLogin, onRegister }) {
    const [isRegistering, setIsRegistering] = useState(false);
    if (isRegistering) {
        return <RegistrationForm onSuccess={onRegister}/>;
    }
    return (<div className="max-w-md mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Agent Login</h2>

        <form onSubmit={(e) => {
            e.preventDefault();
            onLogin();
        }} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Wallet Address
            </label>
            <input type="text" placeholder="0x..." className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Signature
            </label>
            <textarea placeholder="Sign message with your wallet..." className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 h-24"/>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition">
            Login
          </button>

          <button type="button" onClick={() => setIsRegistering(true)} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg font-semibold transition">
            Create New Agent
          </button>
        </form>
      </div>
    </div>);
}
/**
 * Agent Registration Form
 */
function RegistrationForm({ onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        serviceType: 'mechanic',
        description: '',
        pricePerHour: 50,
        city: '',
        state: '',
        walletAddress: ''
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Registering agent:', formData);
        // TODO: Submit to backend
        onSuccess();
    };
    return (<div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Register as Agent</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Agent Name
              </label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"/>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                Service Type
              </label>
              <select name="serviceType" value={formData.serviceType} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500">
                <option>mechanic</option>
                <option>battery_service</option>
                <option>plumber</option>
                <option>electrician</option>
                <option>delivery</option>
                <option>taxi</option>
                <option>charging_station</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Description
            </label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your agent and services..." className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 h-24"/>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                City
              </label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"/>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">
                State
              </label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"/>
            </div>
          </div>

          {/* Pricing */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Price per Hour (USD)
            </label>
            <input type="number" name="pricePerHour" value={formData.pricePerHour} onChange={handleChange} min="5" max="10000" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"/>
          </div>

          {/* Wallet */}
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-2">
              Solana Wallet Address
            </label>
            <input type="text" name="walletAddress" value={formData.walletAddress} onChange={handleChange} placeholder="Your Solana wallet (for receiving payments)" className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"/>
          </div>

          {/* Submit */}
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition">
            Register Agent ($20/month)
          </button>
        </form>
      </div>
    </div>);
}
/**
 * Overview Tab
 */
function OverviewTab({ agent }) {
    return (<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Rating Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Rating</div>
        <div className="text-4xl font-bold text-yellow-400">{agent.rating.toFixed(1)}</div>
        <div className="text-gray-400 text-sm mt-2">{agent.reviews} reviews</div>
      </div>

      {/* Earnings Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
          <DollarSign size={16}/>
          Total Earnings
        </div>
        <div className="text-4xl font-bold text-green-400">${agent.totalEarnings.toFixed(2)}</div>
        <div className="text-gray-400 text-sm mt-2">From {agent.totalTransactions} transactions</div>
      </div>

      {/* Status Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Status</div>
        <div className="text-2xl font-bold text-green-400">
          {agent.verified ? '✓ Verified' : 'Pending Verification'}
        </div>
        <div className="text-gray-400 text-sm mt-2">{agent.serviceType.replace(/_/g, ' ')}</div>
      </div>
    </div>);
}
/**
 * Edit Profile Tab
 */
function EditProfileTab({ agent }) {
    return (<div className="max-w-2xl">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Edit2 size={20}/>
          Edit Profile
        </h3>
        {/* Form fields would go here */}
        <p className="text-gray-400">Profile editing coming soon...</p>
      </div>
    </div>);
}
/**
 * Earnings Tab
 */
function EarningsTab({ agent }) {
    return (<div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp size={20}/>
          Earnings Overview
        </h3>
        {/* Earnings chart would go here */}
        <p className="text-gray-400">Earnings analytics coming soon...</p>
      </div>
    </div>);
}
/**
 * Settings Tab
 */
function SettingsTab({ agent }) {
    return (<div className="space-y-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings size={20}/>
          Agent Settings
        </h3>
        <p className="text-gray-400">Settings panel coming soon...</p>
      </div>
    </div>);
}
//# sourceMappingURL=agent-dashboard.js.map