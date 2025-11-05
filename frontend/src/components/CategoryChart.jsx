import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { profileService } from '../services/profileService.js';
import { transactionUtils } from '../utils/transactionUtils.js';
import { chartOptions, chartDataFormatters, chartUtils } from '../utils/chartConfig.js';

const CategoryChart = ({ showNotification }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topCategories, setTopCategories] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchCategoryData();
  }, []);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const categoryAnalytics = await profileService.getCategoryAnalytics();
      
      // Check if data is empty
      if (chartUtils.isDataEmpty(categoryAnalytics.datasets[0].data)) {
        setChartData(chartDataFormatters.formatEmptyData('pie'));
        setTopCategories([]);
        setTotalExpenses(0);
      } else {
        setChartData(categoryAnalytics);
        
        // Calculate top categories and total
        const categories = categoryAnalytics.labels.map((label, index) => ({
          name: label,
          amount: categoryAnalytics.datasets[0].data[index],
          color: categoryAnalytics.datasets[0].backgroundColor[index],
          icon: transactionUtils.getCategoryIcon(label)
        }));
        
        // Sort by amount and get top categories
        const sortedCategories = categories.sort((a, b) => b.amount - a.amount);
        setTopCategories(sortedCategories);
        
        const total = categoryAnalytics.datasets[0].data.reduce((sum, value) => sum + value, 0);
        setTotalExpenses(total);
      }
    } catch (err) {
      console.error('Failed to fetch category analytics:', err);
      setError(err.message || 'Failed to load category analytics');
      setChartData(chartDataFormatters.formatEmptyData('pie'));
      setTopCategories([]);
      setTotalExpenses(0);
      
      if (showNotification) {
        showNotification('Failed to load category analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (amount) => {
    if (totalExpenses === 0) return 0;
    return ((amount / totalExpenses) * 100).toFixed(1);
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
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-700">🏷️ Category Breakdown</h3>
            <div className="h-4 bg-gray-200 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-700">🏷️ Category Breakdown</h3>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <button
              onClick={fetchCategoryData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-700 flex items-center">
            🏷️ Category Breakdown
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            See where your money goes by category
          </p>
        </div>
        <div className="text-right">
          <p className="text-gray-600 text-sm">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
      </div>

      {/* Chart and Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doughnut Chart */}
        <div className="h-80 flex items-center justify-center">
          {chartData && !chartUtils.isDataEmpty(chartData.datasets[0].data) ? (
            <Doughnut 
              data={chartData} 
              options={{
                ...chartOptions.pieChart,
                plugins: {
                  ...chartOptions.pieChart.plugins,
                  legend: {
                    display: false // We'll create custom legend
                  }
                }
              }} 
            />
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">
                No Category Data
              </h4>
              <p className="text-gray-500">
                Start adding expenses to see category breakdown
              </p>
            </div>
          )}
        </div>

        {/* Custom Legend */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-700 mb-4">Categories</h4>
          {topCategories.length > 0 ? (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {topCategories.map((category, index) => (
                <div 
                  key={category.name} 
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {formatCurrency(category.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getPercentage(category.amount)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📝</div>
              <p>No categories to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Spending Insights */}
      {topCategories.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-700 mb-4">💡 Spending Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">{topCategories[0]?.icon}</span>
                <span className="font-semibold text-blue-800">Top Category</span>
              </div>
              <p className="text-blue-700">
                <span className="font-bold">{topCategories[0]?.name}</span> accounts for{' '}
                <span className="font-bold">{getPercentage(topCategories[0]?.amount)}%</span> of your expenses
              </p>
            </div>
            
            {topCategories.length > 1 && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">📈</span>
                  <span className="font-semibold text-green-800">Categories</span>
                </div>
                <p className="text-green-700">
                  You're spending across{' '}
                  <span className="font-bold">{topCategories.length} categories</span>,{' '}
                  showing diverse expense patterns
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryChart;