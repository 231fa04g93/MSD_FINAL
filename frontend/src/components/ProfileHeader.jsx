import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService.js';
import { transactionUtils } from '../utils/transactionUtils.js';

const ProfileHeader = ({ user, showNotification }) => {
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBalanceData = async () => {
      try {
        setLoading(true);
        const transactions = await transactionService.fetchTransactions();
        const stats = transactionUtils.calculateTransactionStats(transactions);
        
        setBalance(stats.netAmount);
        setTotalIncome(stats.totalIncome);
        setTotalExpenses(stats.totalExpenses);
      } catch (error) {
        console.error('Failed to fetch balance data:', error);
        if (showNotification) {
          showNotification('Failed to load balance information');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBalanceData();
  }, [showNotification]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <div>
              <div className="h-6 bg-white/20 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="text-right">
            <div className="h-4 bg-white/20 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between">
        {/* Left Section - User Greeting */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {getGreeting()}, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-blue-100 text-sm">
              Welcome to your expense profile
            </p>
          </div>
        </div>

        {/* Right Section - Balance Information */}
        <div className="text-right">
          <h4 className="text-blue-100 text-sm uppercase tracking-wide mb-1">
            Current Balance
          </h4>
          <h2 className={`text-3xl font-bold mb-2 ${
            balance >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {formatCurrency(balance)}
          </h2>
          <div className="flex space-x-4 text-sm">
            <div className="text-center">
              <p className="text-green-200 font-semibold">Income</p>
              <p className="text-green-100">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-center">
              <p className="text-red-200 font-semibold">Expenses</p>
              <p className="text-red-100">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Quick Stats */}
      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-100 text-xs uppercase tracking-wide">This Month</p>
            <p className="text-white font-semibold text-lg">
              {formatCurrency(totalExpenses)}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-100 text-xs uppercase tracking-wide">Status</p>
            <p className={`font-semibold text-lg ${
              balance >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {balance >= 0 ? 'Positive' : 'Negative'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-blue-100 text-xs uppercase tracking-wide">Account</p>
            <p className="text-white font-semibold text-sm truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;