import React, { useState, useEffect } from 'react';
import { isAuthenticated } from '../services/api.js';
import { transactionService } from '../services/transactionService.js';
import { transactionUtils } from '../utils/transactionUtils.js';

const ProfilePage = ({ user, showNotification, setCurrentPage }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileStats, setProfileStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const initializeProfile = async () => {
      try {
        if (!isAuthenticated()) {
          setError('Please log in to view your profile');
          setLoading(false);
          return;
        }
        
        // Fetch user's transaction data for profile stats
        const transactions = await transactionService.fetchTransactions();
        const stats = transactionUtils.calculateTransactionStats(transactions);
        const recent = transactions.slice(0, 10); // Get 10 most recent transactions
        
        setProfileStats(stats);
        setRecentTransactions(recent);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    initializeProfile();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getJoinDate = () => {
    // Since we don't have actual join date, we'll use a placeholder
    return 'January 2024';
  };

  const handleEditProfile = () => {
    if (showNotification) {
      showNotification('Edit Profile feature coming soon!');
    }
  };

  const handleViewDashboard = () => {
    if (setCurrentPage) {
      setCurrentPage('dashboard');
    }
  };

  const handlePrivacySettings = () => {
    if (showNotification) {
      showNotification('Privacy Settings feature coming soon!');
    }
  };

  if (loading) {
    return (
      <div className="bg-pink-400 min-h-screen flex flex-col items-center py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-pink-400 min-h-screen flex flex-col items-center py-8 px-4">
        <div className="bg-white shadow-lg rounded-lg w-full max-w-4xl p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 min-h-screen w-full py-6 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg mb-6">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">
                {user?.name || 'User'}
              </h1>
              <p className="text-blue-100 text-lg mb-1">{user?.email || 'user@example.com'}</p>
              <p className="text-blue-200 text-sm">Member since {getJoinDate()}</p>
            </div>
          </div>
        </div>

        {/* Profile Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Account Information */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              👤 Account Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-lg text-gray-800">{user?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email Address</label>
                <p className="text-lg text-gray-800">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Status</label>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  ✅ Active
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Member Since</label>
                <p className="text-lg text-gray-800">{getJoinDate()}</p>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              📊 Account Statistics
            </h3>
            {profileStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Transactions</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {profileStats.totalTransactions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Income</span>
                  <span className="text-lg font-semibold text-green-600">
                    {formatCurrency(profileStats.totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="text-lg font-semibold text-red-600">
                    {formatCurrency(profileStats.totalExpenses)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-gray-600 font-medium">Net Balance</span>
                  <span className={`text-xl font-bold ${
                    profileStats.isProfit ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(profileStats.netAmount)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                Loading statistics...
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            🕒 Recent Activity
          </h3>
          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      transaction.amount >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-800">{transaction.text}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold ${
                    transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No recent transactions</p>
            </div>
          )}
        </div>

        {/* Profile Actions */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            ⚙️ Profile Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={handleEditProfile}
              className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
            >
              <span>✏️</span>
              <span className="font-medium text-blue-800">Edit Profile</span>
            </button>
            <button 
              onClick={handleViewDashboard}
              className="flex items-center justify-center space-x-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
            >
              <span>📊</span>
              <span className="font-medium text-green-800">View Dashboard</span>
            </button>
            <button 
              onClick={handlePrivacySettings}
              className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
            >
              <span>🔒</span>
              <span className="font-medium text-purple-800">Privacy Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;