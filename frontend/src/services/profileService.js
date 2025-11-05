import API from './api.js';
import { transactionService } from './transactionService.js';

export const profileService = {
  // Category detection keywords
  categoryKeywords: {
    'Food': ['restaurant', 'food', 'grocery', 'cafe', 'dining', 'meal', 'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 'burger', 'coffee', 'tea'],
    'Transport': ['uber', 'taxi', 'bus', 'train', 'fuel', 'petrol', 'metro', 'auto', 'rickshaw', 'flight', 'travel', 'parking', 'toll'],
    'Entertainment': ['movie', 'cinema', 'game', 'music', 'streaming', 'netflix', 'amazon prime', 'spotify', 'concert', 'show', 'theater'],
    'Shopping': ['amazon', 'flipkart', 'mall', 'store', 'clothes', 'shopping', 'dress', 'shirt', 'shoes', 'bag', 'electronics', 'mobile'],
    'Bills': ['electricity', 'water', 'internet', 'phone', 'rent', 'insurance', 'gas', 'maintenance', 'wifi', 'broadband', 'utility'],
    'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'medical', 'clinic', 'health', 'dentist', 'checkup', 'prescription'],
    'Education': ['course', 'book', 'tuition', 'school', 'college', 'training', 'workshop', 'certification', 'study', 'exam']
  },

  // Fetch user profile data
  async fetchUserProfile() {
    try {
      const response = await API.get('/profile');
      return response.data;
    } catch (error) {
      // If profile endpoint doesn't exist, return basic user info
      return {
        name: 'User',
        email: localStorage.getItem('userEmail') || 'user@example.com'
      };
    }
  },

  // Get monthly analytics data
  async getMonthlyAnalytics(year = new Date().getFullYear()) {
    try {
      const transactions = await transactionService.fetchTransactions();
      const monthlyData = this.calculateMonthlyData(transactions, year);
      
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Monthly Expenses',
          data: monthlyData,
          backgroundColor: 'rgba(239, 68, 68, 0.8)',
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 1
        }]
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch monthly analytics');
    }
  },

  // Get daily analytics data for current month
  async getDailyAnalytics(year = new Date().getFullYear(), month = new Date().getMonth()) {
    try {
      const transactions = await transactionService.fetchTransactions();
      const dailyData = this.calculateDailyData(transactions, year, month);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const labels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
      
      return {
        labels,
        datasets: [{
          label: 'Daily Expenses',
          data: dailyData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1
        }]
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch daily analytics');
    }
  },

  // Get category analytics data
  async getCategoryAnalytics() {
    try {
      const transactions = await transactionService.fetchTransactions();
      const categoryData = this.getCategoryBreakdown(transactions);
      
      const labels = Object.keys(categoryData);
      const data = Object.values(categoryData);
      const colors = [
        'rgba(239, 68, 68, 0.8)',   // Red
        'rgba(59, 130, 246, 0.8)',  // Blue
        'rgba(16, 185, 129, 0.8)',  // Green
        'rgba(245, 158, 11, 0.8)',  // Yellow
        'rgba(139, 92, 246, 0.8)',  // Purple
        'rgba(236, 72, 153, 0.8)',  // Pink
        'rgba(34, 197, 94, 0.8)'    // Emerald
      ];
      
      return {
        labels,
        datasets: [{
          label: 'Expense Categories',
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderWidth: 2,
          hoverOffset: 4
        }]
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to fetch category analytics');
    }
  },

  // Format transaction history with categories and timestamps
  formatTransactionHistory(transactions) {
    return transactions.map(transaction => ({
      ...transaction,
      category: this.categorizeTransaction(transaction),
      formattedDate: this.formatDate(transaction.createdAt),
      formattedTime: this.formatTime(transaction.createdAt),
      formattedAmount: this.formatCurrency(Math.abs(transaction.amount)),
      type: transaction.amount >= 0 ? 'income' : 'expense'
    }));
  },

  // Expense Limit Management
  async getExpenseLimit() {
    try {
      const limit = localStorage.getItem('monthlyExpenseLimit');
      return limit ? parseFloat(limit) : null;
    } catch (error) {
      throw this.handleError(error, 'Failed to get expense limit');
    }
  },

  async setExpenseLimit(amount) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid limit amount');
      }
      localStorage.setItem('monthlyExpenseLimit', amount.toString());
      return { amount, currency: 'INR', updatedAt: new Date() };
    } catch (error) {
      throw this.handleError(error, 'Failed to set expense limit');
    }
  },

  async getCurrentMonthExpenses() {
    try {
      const transactions = await transactionService.fetchTransactions();
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const monthlyExpenses = transactions
        .filter(transaction => {
          const transactionDate = new Date(transaction.createdAt);
          return transactionDate.getMonth() === currentMonth &&
                 transactionDate.getFullYear() === currentYear &&
                 transaction.amount < 0; // Only expenses (negative amounts)
        })
        .reduce((total, transaction) => total + Math.abs(transaction.amount), 0);
      
      return monthlyExpenses;
    } catch (error) {
      throw this.handleError(error, 'Failed to calculate current month expenses');
    }
  },

  async checkLimitStatus() {
    try {
      const limit = await this.getExpenseLimit();
      const currentExpenses = await this.getCurrentMonthExpenses();
      
      if (!limit) {
        return { status: 'no_limit', currentExpenses, limitAmount: null, percentage: 0 };
      }
      
      const percentage = (currentExpenses / limit) * 100;
      let status = 'safe';
      
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 80) {
        status = 'warning';
      }
      
      return {
        status,
        currentExpenses,
        limitAmount: limit,
        percentage: Math.round(percentage),
        remainingAmount: Math.max(0, limit - currentExpenses)
      };
    } catch (error) {
      throw this.handleError(error, 'Failed to check limit status');
    }
  },

  // Category Management
  categorizeTransaction(transaction) {
    const text = transaction.text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }
    
    return 'Other';
  },

  getCategoryBreakdown(transactions) {
    const categoryTotals = {};
    
    transactions
      .filter(transaction => transaction.amount < 0) // Only expenses
      .forEach(transaction => {
        const category = this.categorizeTransaction(transaction);
        const amount = Math.abs(transaction.amount);
        categoryTotals[category] = (categoryTotals[category] || 0) + amount;
      });
    
    return categoryTotals;
  },

  getTopSpendingCategories(limit = 5) {
    return async () => {
      try {
        const transactions = await transactionService.fetchTransactions();
        const categoryBreakdown = this.getCategoryBreakdown(transactions);
        
        return Object.entries(categoryBreakdown)
          .sort(([,a], [,b]) => b - a)
          .slice(0, limit)
          .map(([category, amount]) => ({ category, amount }));
      } catch (error) {
        throw this.handleError(error, 'Failed to get top spending categories');
      }
    };
  },

  // Notification Management
  createNotification(type, title, message, autoClose = true, duration = 5000) {
    return {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date(),
      autoClose,
      duration,
      dismissed: false
    };
  },

  async checkLimitNotifications() {
    try {
      const limitStatus = await this.checkLimitStatus();
      const notifications = [];
      
      if (limitStatus.status === 'warning') {
        notifications.push(this.createNotification(
          'warning',
          'Budget Alert',
          `You have spent ${limitStatus.percentage}% of your monthly limit (₹${limitStatus.currentExpenses.toFixed(2)} of ₹${limitStatus.limitAmount})`,
          false
        ));
      } else if (limitStatus.status === 'exceeded') {
        const exceededAmount = limitStatus.currentExpenses - limitStatus.limitAmount;
        notifications.push(this.createNotification(
          'error',
          'Budget Exceeded',
          `You have exceeded your monthly limit by ₹${exceededAmount.toFixed(2)}`,
          false
        ));
      }
      
      return notifications;
    } catch (error) {
      throw this.handleError(error, 'Failed to check limit notifications');
    }
  },

  // Utility Functions
  calculateMonthlyData(transactions, year) {
    const monthlyTotals = new Array(12).fill(0);
    
    transactions
      .filter(transaction => transaction.amount < 0) // Only expenses
      .forEach(transaction => {
        const date = new Date(transaction.createdAt);
        if (date.getFullYear() === year) {
          const month = date.getMonth();
          monthlyTotals[month] += Math.abs(transaction.amount);
        }
      });
    
    return monthlyTotals;
  },

  calculateDailyData(transactions, year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dailyTotals = new Array(daysInMonth).fill(0);
    
    transactions
      .filter(transaction => transaction.amount < 0) // Only expenses
      .forEach(transaction => {
        const date = new Date(transaction.createdAt);
        if (date.getFullYear() === year && date.getMonth() === month) {
          const day = date.getDate() - 1; // Array is 0-indexed
          dailyTotals[day] += Math.abs(transaction.amount);
        }
      });
    
    return dailyTotals;
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // Error handling
  handleError(error, defaultMessage) {
    if (error.response) {
      const serverMessage = error.response.data?.msg || error.response.data?.message;
      const errors = error.response.data?.errors;
      if (errors && Array.isArray(errors)) {
        return new Error(errors.join(', '));
      } else if (serverMessage) {
        return new Error(serverMessage);
      } else {
        return new Error(`${defaultMessage} (Status: ${error.response.status})`);
      }
    } else if (error.request) {
      return new Error('Network error. Please check your connection and try again.');
    } else {
      return new Error(error.message || defaultMessage);
    }
  }
};

export default profileService;