import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { profileService } from '../services/profileService.js';
import { chartOptions, chartDataFormatters, chartUtils } from '../utils/chartConfig.js';

const MonthlyBarChart = ({ showNotification }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedYear]);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const monthlyAnalytics = await profileService.getMonthlyAnalytics(selectedYear);
      
      // Check if data is empty
      if (chartUtils.isDataEmpty(monthlyAnalytics.datasets[0].data)) {
        setChartData(chartDataFormatters.formatEmptyData('bar'));
      } else {
        setChartData(monthlyAnalytics);
      }
    } catch (err) {
      console.error('Failed to fetch monthly analytics:', err);
      setError(err.message || 'Failed to load monthly analytics');
      setChartData(chartDataFormatters.formatEmptyData('bar'));
      
      if (showNotification) {
        showNotification('Failed to load monthly analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 2; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  };

  const getTotalExpenses = () => {
    if (!chartData || !chartData.datasets[0]) return 0;
    return chartData.datasets[0].data.reduce((sum, value) => sum + (value || 0), 0);
  };

  const getHighestMonth = () => {
    if (!chartData || !chartData.datasets[0]) return { month: 'N/A', amount: 0 };
    
    const data = chartData.datasets[0].data;
    const maxValue = Math.max(...data);
    const maxIndex = data.indexOf(maxValue);
    
    return {
      month: chartData.labels[maxIndex],
      amount: maxValue
    };
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">📊 Monthly Expenses</h3>
          <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading monthly analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">📊 Monthly Expenses</h3>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getYearOptions().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <button
              onClick={fetchMonthlyData}
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
            📊 Monthly Expenses
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Track your spending patterns throughout the year
          </p>
        </div>
        <select
          value={selectedYear}
          onChange={handleYearChange}
          className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {getYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        {chartData && (
          <Bar 
            data={chartData} 
            options={{
              ...chartOptions.barChart,
              plugins: {
                ...chartOptions.barChart.plugins,
                title: {
                  display: false
                }
              }
            }} 
          />
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Total {selectedYear}</p>
          <p className="text-lg font-bold text-gray-800">
            {chartUtils.formatCurrency(getTotalExpenses())}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">Highest Month</p>
          <p className="text-lg font-bold text-red-600">
            {getHighestMonth().month}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">Peak Amount</p>
          <p className="text-lg font-bold text-red-600">
            {chartUtils.formatCurrency(getHighestMonth().amount)}
          </p>
        </div>
      </div>


    </div>
  );
};

export default MonthlyBarChart;