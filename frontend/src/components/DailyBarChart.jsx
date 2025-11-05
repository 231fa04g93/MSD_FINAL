import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { profileService } from '../services/profileService.js';
import { chartOptions, chartDataFormatters, chartUtils } from '../utils/chartConfig.js';

const DailyBarChart = ({ showNotification }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showEmptyState, setShowEmptyState] = useState(true);

  useEffect(() => {
    fetchDailyData();
  }, [selectedMonth, selectedYear]);

  const fetchDailyData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const dailyAnalytics = await profileService.getDailyAnalytics(selectedYear, selectedMonth);
      
      // Check if data is empty
      if (chartUtils.isDataEmpty(dailyAnalytics.datasets[0].data)) {
        setChartData(chartDataFormatters.formatEmptyData('bar'));
      } else {
        // Update the chart data with daily color scheme
        const formattedData = {
          ...dailyAnalytics,
          datasets: [{
            ...dailyAnalytics.datasets[0],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          }]
        };
        setChartData(formattedData);
      }
    } catch (err) {
      console.error('Failed to fetch daily analytics:', err);
      setError(err.message || 'Failed to load daily analytics');
      setChartData(chartDataFormatters.formatEmptyData('bar'));
      
      if (showNotification) {
        showNotification('Failed to load daily analytics');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (event) => {
    setSelectedMonth(parseInt(event.target.value));
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  const getMonthOptions = () => {
    return [
      { value: 0, label: 'January' },
      { value: 1, label: 'February' },
      { value: 2, label: 'March' },
      { value: 3, label: 'April' },
      { value: 4, label: 'May' },
      { value: 5, label: 'June' },
      { value: 6, label: 'July' },
      { value: 7, label: 'August' },
      { value: 8, label: 'September' },
      { value: 9, label: 'October' },
      { value: 10, label: 'November' },
      { value: 11, label: 'December' }
    ];
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

  const getHighestDay = () => {
    if (!chartData || !chartData.datasets[0]) return { day: 'N/A', amount: 0 };
    
    const data = chartData.datasets[0].data;
    const maxValue = Math.max(...data);
    const maxIndex = data.indexOf(maxValue);
    
    return {
      day: chartData.labels[maxIndex],
      amount: maxValue
    };
  };

  const getAverageDaily = () => {
    if (!chartData || !chartData.datasets[0]) return 0;
    
    const data = chartData.datasets[0].data;
    const nonZeroData = data.filter(value => value > 0);
    
    if (nonZeroData.length === 0) return 0;
    
    return nonZeroData.reduce((sum, value) => sum + value, 0) / nonZeroData.length;
  };

  const getSelectedMonthName = () => {
    const monthOptions = getMonthOptions();
    return monthOptions.find(month => month.value === selectedMonth)?.label || 'Unknown';
  };

  const handleDismissEmptyState = () => {
    setShowEmptyState(false);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">📅 Daily Expenses</h3>
          <div className="flex space-x-2">
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading daily analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-700">📅 Daily Expenses</h3>
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getMonthOptions().map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
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
        </div>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-red-600 font-medium mb-2">Failed to load data</p>
            <button
              onClick={fetchDailyData}
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
            📅 Daily Expenses
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            Daily spending breakdown for {getSelectedMonthName()} {selectedYear}
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {getMonthOptions().map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
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
              },
              scales: {
                ...chartOptions.barChart.scales,
                x: {
                  ...chartOptions.barChart.scales.x,
                  ticks: {
                    ...chartOptions.barChart.scales.x.ticks,
                    maxTicksLimit: 15, // Limit number of day labels shown
                    callback: function(value, index) {
                      // Show every 5th day for better readability
                      return (index + 1) % 5 === 0 || index === 0 ? this.getLabelForValue(value) : '';
                    }
                  }
                }
              }
            }} 
          />
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-gray-600 text-sm">Total Month</p>
          <p className="text-lg font-bold text-gray-800">
            {chartUtils.formatCurrency(getTotalExpenses())}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">Highest Day</p>
          <p className="text-lg font-bold text-blue-600">
            Day {getHighestDay().day}
          </p>
        </div>
        <div className="text-center">
          <p className="text-gray-600 text-sm">Daily Average</p>
          <p className="text-lg font-bold text-blue-600">
            {chartUtils.formatCurrency(getAverageDaily())}
          </p>
        </div>
      </div>


    </div>
  );
};

export default DailyBarChart;