import React, { useState, useEffect } from 'react';
import MonthlyBarChart from './MonthlyBarChart.jsx';
import DailyBarChart from './DailyBarChart.jsx';
import CategoryChart from './CategoryChart.jsx';

const ExpenseAnalytics = ({ showNotification, refreshTrigger }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh charts when refreshTrigger changes (e.g., when new transactions are added)
  useEffect(() => {
    if (refreshTrigger) {
      setRefreshKey(prev => prev + 1);
    }
  }, [refreshTrigger]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'monthly', label: 'Monthly', icon: '📅' },
    { id: 'daily', label: 'Daily', icon: '📆' },
    { id: 'categories', label: 'Categories', icon: '🏷️' }
  ];

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    if (showNotification) {
      showNotification('Analytics refreshed successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">📈 Expense Analytics</h2>
            <p className="text-gray-600 mt-1">
              Comprehensive insights into your spending patterns
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div key={refreshKey}>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyBarChart showNotification={showNotification} />
              <DailyBarChart showNotification={showNotification} />
            </div>
            <CategoryChart showNotification={showNotification} />
          </div>
        )}

        {activeTab === 'monthly' && (
          <MonthlyBarChart showNotification={showNotification} />
        )}

        {activeTab === 'daily' && (
          <DailyBarChart showNotification={showNotification} />
        )}

        {activeTab === 'categories' && (
          <CategoryChart showNotification={showNotification} />
        )}
      </div>

      {/* Analytics Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          💡 Analytics Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-2">
            <span className="text-blue-600 font-bold">•</span>
            <p className="text-gray-700">
              <strong>Monthly View:</strong> Track spending trends across different months to identify patterns
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-purple-600 font-bold">•</span>
            <p className="text-gray-700">
              <strong>Daily View:</strong> Monitor daily expenses to understand your spending habits
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-600 font-bold">•</span>
            <p className="text-gray-700">
              <strong>Categories:</strong> See which expense categories consume most of your budget
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-orange-600 font-bold">•</span>
            <p className="text-gray-700">
              <strong>Overview:</strong> Get a comprehensive view of all your analytics in one place
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          ⚡ Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('monthly')}
            className="flex items-center space-x-3 p-4 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-colors group"
          >
            <div className="text-2xl">📊</div>
            <div className="text-left">
              <p className="font-medium text-red-800 group-hover:text-red-900">
                View Monthly Trends
              </p>
              <p className="text-sm text-red-600">
                Analyze spending by month
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors group"
          >
            <div className="text-2xl">🏷️</div>
            <div className="text-left">
              <p className="font-medium text-blue-800 group-hover:text-blue-900">
                Category Breakdown
              </p>
              <p className="text-sm text-blue-600">
                See spending by category
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('daily')}
            className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors group"
          >
            <div className="text-2xl">📅</div>
            <div className="text-left">
              <p className="font-medium text-green-800 group-hover:text-green-900">
                Daily Analysis
              </p>
              <p className="text-sm text-green-600">
                Track daily expenses
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;