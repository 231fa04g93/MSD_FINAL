import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Common chart options
export const chartOptions = {
  // Bar chart options
  barChart: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          padding: 20,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₹${context.parsed.y.toLocaleString('en-IN')}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          color: '#6b7280'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11
          },
          color: '#6b7280',
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  },

  // Pie/Doughnut chart options
  pieChart: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter, sans-serif',
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const dataset = data.datasets[0];
                const value = dataset.data[i];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  strokeStyle: dataset.borderColor?.[i] || dataset.backgroundColor[i],
                  lineWidth: 2,
                  hidden: false,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toLocaleString('en-IN')} (${percentage}%)`;
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    cutout: '50%', // Makes it a doughnut chart
    radius: '80%'
  }
};

// Color palettes
export const colorPalettes = {
  expenses: [
    'rgba(239, 68, 68, 0.8)',   // Red
    'rgba(59, 130, 246, 0.8)',  // Blue
    'rgba(16, 185, 129, 0.8)',  // Green
    'rgba(245, 158, 11, 0.8)',  // Yellow
    'rgba(139, 92, 246, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(34, 197, 94, 0.8)',   // Emerald
    'rgba(168, 85, 247, 0.8)'   // Violet
  ],
  
  expensesBorder: [
    'rgba(239, 68, 68, 1)',
    'rgba(59, 130, 246, 1)',
    'rgba(16, 185, 129, 1)',
    'rgba(245, 158, 11, 1)',
    'rgba(139, 92, 246, 1)',
    'rgba(236, 72, 153, 1)',
    'rgba(34, 197, 94, 1)',
    'rgba(168, 85, 247, 1)'
  ],

  gradient: {
    monthly: {
      background: 'rgba(239, 68, 68, 0.8)',
      border: 'rgba(239, 68, 68, 1)'
    },
    daily: {
      background: 'rgba(59, 130, 246, 0.8)',
      border: 'rgba(59, 130, 246, 1)'
    }
  }
};

// Chart data formatters
export const chartDataFormatters = {
  // Format data for bar charts
  formatBarChartData: (labels, data, label, colorType = 'monthly') => {
    return {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: colorPalettes.gradient[colorType].background,
        borderColor: colorPalettes.gradient[colorType].border,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  },

  // Format data for pie/doughnut charts
  formatPieChartData: (labels, data, label = 'Expenses') => {
    return {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: colorPalettes.expenses.slice(0, labels.length),
        borderColor: colorPalettes.expensesBorder.slice(0, labels.length),
        borderWidth: 2,
        hoverOffset: 4,
        hoverBorderWidth: 3
      }]
    };
  },

  // Format empty state data
  formatEmptyData: (type = 'bar') => {
    if (type === 'bar') {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data Available',
          data: [0],
          backgroundColor: 'rgba(156, 163, 175, 0.5)',
          borderColor: 'rgba(156, 163, 175, 1)',
          borderWidth: 1
        }]
      };
    } else {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'No Data Available',
          data: [1],
          backgroundColor: ['rgba(156, 163, 175, 0.5)'],
          borderColor: ['rgba(156, 163, 175, 1)'],
          borderWidth: 1
        }]
      };
    }
  }
};

// Chart utility functions
export const chartUtils = {
  // Get responsive chart height based on screen size
  getChartHeight: () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 250 : 300;
    }
    return 300;
  },

  // Generate month labels for the current year
  getMonthLabels: () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  },

  // Generate day labels for current month
  getDayLabels: (year = new Date().getFullYear(), month = new Date().getMonth()) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  },

  // Check if data is empty
  isDataEmpty: (data) => {
    if (!data || !Array.isArray(data)) return true;
    return data.every(value => value === 0 || value === null || value === undefined);
  },

  // Format currency for chart display
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
};

export default {
  chartOptions,
  colorPalettes,
  chartDataFormatters,
  chartUtils
};