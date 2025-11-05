import React, { useState, useEffect } from 'react';
import { expenseLimitService } from '../services/expenseLimitService.js';

const ExpenseLimitManager = ({ showNotification, onLimitUpdate, refreshTrigger, transactionCount }) => {
  const [limitAmount, setLimitAmount] = useState('');
  const [currentLimit, setCurrentLimit] = useState(null);
  const [limitStatus, setLimitStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLimitInput, setShowLimitInput] = useState(false);

  useEffect(() => {
    fetchLimitData();
  }, []);

  // Auto-refresh when transactions change
  useEffect(() => {
    if (transactionCount !== undefined && currentLimit) {
      fetchLimitData();
    }
  }, [transactionCount, currentLimit]);

  const fetchLimitData = async () => {
    try {
      setLoading(true);
      const [limit, status] = await Promise.all([
        expenseLimitService.getExpenseLimit(),
        expenseLimitService.getLimitStatus()
      ]);
      
      setCurrentLimit(limit);
      setLimitStatus(status);
      setLimitAmount(limit ? limit.toString() : '');
      setShowLimitInput(!limit); // Show input if no limit is set
    } catch (error) {
      console.error('Failed to fetch limit data:', error);
      if (showNotification) {
        showNotification('Failed to load expense limit information');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetLimit = async (e) => {
    e.preventDefault();
    
    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      if (showNotification) {
        showNotification('Please enter a valid limit amount');
      }
      return;
    }

    try {
      setSaving(true);
      await expenseLimitService.setExpenseLimit(parseFloat(limitAmount));
      await fetchLimitData(); // Refresh data
      setShowLimitInput(false);
      
      if (showNotification) {
        showNotification('Expense limit set successfully!');
      }
      
      if (onLimitUpdate) {
        onLimitUpdate();
      }
    } catch (error) {
      console.error('Failed to set limit:', error);
      if (showNotification) {
        showNotification(error.message || 'Failed to set expense limit');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveLimit = async () => {
    if (!window.confirm('Are you sure you want to remove your expense limit?')) {
      return;
    }

    try {
      setSaving(true);
      await expenseLimitService.removeExpenseLimit();
      await fetchLimitData();
      setShowLimitInput(true);
      
      if (showNotification) {
        showNotification('Expense limit removed successfully');
      }
      
      if (onLimitUpdate) {
        onLimitUpdate();
      }
    } catch (error) {
      console.error('Failed to remove limit:', error);
      if (showNotification) {
        showNotification('Failed to remove expense limit');
      }
    } finally {
      setSaving(false);
    }
  };

  const getProgressBarColor = () => {
    if (!limitStatus) return 'bg-gray-400';
    
    switch (limitStatus.status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    if (!limitStatus) return '📊';
    
    switch (limitStatus.status) {
      case 'safe':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'exceeded':
        return '🚨';
      default:
        return '📊';
    }
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
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          💰 Monthly Expense Limit
        </h3>
        {currentLimit && !showLimitInput && (
          <div className="flex space-x-2">
            <button
              onClick={() => setShowLimitInput(true)}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              disabled={saving}
            >
              Edit
            </button>
            <button
              onClick={handleRemoveLimit}
              className="text-red-600 hover:text-red-800 font-medium text-sm"
              disabled={saving}
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {/* Limit Input Form */}
      {showLimitInput && (
        <form onSubmit={handleSetLimit} className="mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="Enter monthly limit (₹)"
                className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                step="1"
                disabled={saving}
              />
            </div>
            <button
              type="submit"
              disabled={saving || !limitAmount}
              className={`px-6 py-3 rounded-md font-semibold transition-colors ${
                saving || !limitAmount
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {saving ? 'Setting...' : 'Set Limit'}
            </button>
            {currentLimit && (
              <button
                type="button"
                onClick={() => {
                  setShowLimitInput(false);
                  setLimitAmount(currentLimit.toString());
                }}
                className="px-4 py-3 text-gray-600 hover:text-gray-800 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Limit Status Display */}
      {limitStatus && limitStatus.hasLimit && (
        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {getStatusIcon()} Current Progress
              </span>
              <span className="text-sm text-gray-600">
                {limitStatus.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ease-in-out ${getProgressBarColor()}`}
                style={{ width: `${Math.min(limitStatus.percentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Status Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Spent This Month</p>
              <p className="text-lg font-bold text-gray-800">
                {formatCurrency(limitStatus.currentExpenses)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">Monthly Limit</p>
              <p className="text-lg font-bold text-gray-800">
                {formatCurrency(limitStatus.limitAmount)}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <p className="text-gray-600 text-sm">
                {limitStatus.status === 'exceeded' ? 'Exceeded By' : 'Remaining'}
              </p>
              <p className={`text-lg font-bold ${
                limitStatus.status === 'exceeded' ? 'text-red-600' : 'text-green-600'
              }`}>
                {limitStatus.status === 'exceeded' 
                  ? formatCurrency(limitStatus.exceededAmount)
                  : formatCurrency(limitStatus.remainingAmount)
                }
              </p>
            </div>
          </div>

          {/* Status Message */}
          <div className={`p-4 rounded-lg ${
            limitStatus.status === 'safe' 
              ? 'bg-green-50 border border-green-200' 
              : limitStatus.status === 'warning'
              ? 'bg-yellow-50 border border-yellow-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-medium ${
              limitStatus.status === 'safe' 
                ? 'text-green-800' 
                : limitStatus.status === 'warning'
                ? 'text-yellow-800'
                : 'text-red-800'
            }`}>
              {limitStatus.status === 'safe' && 
                `You're doing great! You've used ${limitStatus.percentage.toFixed(1)}% of your monthly limit.`
              }
              {limitStatus.status === 'warning' && 
                `Warning: You've used ${limitStatus.percentage.toFixed(1)}% of your monthly limit. Consider monitoring your spending.`
              }
              {limitStatus.status === 'exceeded' && 
                `You have exceeded your monthly limit by ${formatCurrency(limitStatus.exceededAmount)}. Consider reviewing your expenses.`
              }
            </p>
          </div>
        </div>
      )}

      {/* No Limit Set Message */}
      {!limitStatus?.hasLimit && !showLimitInput && (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            No Monthly Limit Set
          </h4>
          <p className="text-gray-600 mb-4">
            Set a monthly expense limit to track your spending and get notifications when you're close to your budget.
          </p>
          <button
            onClick={() => setShowLimitInput(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Set Monthly Limit
          </button>
        </div>
      )}
    </div>
  );
};

export default ExpenseLimitManager;