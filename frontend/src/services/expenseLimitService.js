import { transactionService } from './transactionService.js';
import { profileService } from './profileService.js';

export const expenseLimitService = {
  // Storage keys
  STORAGE_KEYS: {
    MONTHLY_LIMIT: 'monthlyExpenseLimit',
    LIMIT_HISTORY: 'expenseLimitHistory',
    NOTIFICATION_SETTINGS: 'limitNotificationSettings'
  },

  // Default notification settings
  DEFAULT_NOTIFICATION_SETTINGS: {
    warningThreshold: 80, // 80%
    enableWarningNotifications: true,
    enableExceededNotifications: true,
    enableDailyUpdates: false
  },

  // Get current expense limit
  async getExpenseLimit() {
    try {
      const limit = localStorage.getItem(this.STORAGE_KEYS.MONTHLY_LIMIT);
      return limit ? parseFloat(limit) : null;
    } catch (error) {
      throw new Error('Failed to retrieve expense limit');
    }
  },

  // Set new expense limit
  async setExpenseLimit(amount) {
    try {
      if (!amount || amount <= 0) {
        throw new Error('Please enter a valid limit amount greater than 0');
      }

      const limitData = {
        amount: parseFloat(amount),
        currency: 'INR',
        setDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Store the limit
      localStorage.setItem(this.STORAGE_KEYS.MONTHLY_LIMIT, amount.toString());
      
      // Save to history
      await this.saveLimitToHistory(limitData);
      
      return limitData;
    } catch (error) {
      throw new Error(`Failed to set expense limit: ${error.message}`);
    }
  },

  // Get current month expenses
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
      throw new Error('Failed to calculate current month expenses');
    }
  },

  // Get detailed limit status
  async getLimitStatus() {
    try {
      const limit = await this.getExpenseLimit();
      const currentExpenses = await this.getCurrentMonthExpenses();
      
      if (!limit) {
        return {
          hasLimit: false,
          status: 'no_limit',
          currentExpenses,
          limitAmount: null,
          percentage: 0,
          remainingAmount: 0,
          exceededAmount: 0
        };
      }
      
      const percentage = (currentExpenses / limit) * 100;
      let status = 'safe';
      
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= this.getNotificationSettings().warningThreshold) {
        status = 'warning';
      }
      
      return {
        hasLimit: true,
        status,
        currentExpenses,
        limitAmount: limit,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        remainingAmount: Math.max(0, limit - currentExpenses),
        exceededAmount: Math.max(0, currentExpenses - limit)
      };
    } catch (error) {
      throw new Error(`Failed to get limit status: ${error.message}`);
    }
  },

  // Check if limit breach notifications should be triggered
  async checkLimitBreachNotifications() {
    try {
      const limitStatus = await this.getLimitStatus();
      const settings = this.getNotificationSettings();
      const notifications = [];
      
      if (!limitStatus.hasLimit) {
        return notifications;
      }
      
      // Warning notification
      if (limitStatus.status === 'warning' && settings.enableWarningNotifications) {
        notifications.push(profileService.createNotification(
          'warning',
          'Budget Alert',
          `You have spent ${limitStatus.percentage}% of your monthly limit (₹${limitStatus.currentExpenses.toFixed(2)} of ₹${limitStatus.limitAmount})`,
          false, // Don't auto-close
          0 // No duration for manual dismiss
        ));
      }
      
      // Exceeded notification
      if (limitStatus.status === 'exceeded' && settings.enableExceededNotifications) {
        notifications.push(profileService.createNotification(
          'error',
          'Budget Exceeded',
          `You have exceeded your monthly limit by ₹${limitStatus.exceededAmount.toFixed(2)}`,
          false, // Don't auto-close
          0 // No duration for manual dismiss
        ));
      }
      
      return notifications;
    } catch (error) {
      throw new Error(`Failed to check limit notifications: ${error.message}`);
    }
  },

  // Get expense limit history
  getLimitHistory() {
    try {
      const history = localStorage.getItem(this.STORAGE_KEYS.LIMIT_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      return [];
    }
  },

  // Save limit change to history
  async saveLimitToHistory(limitData) {
    try {
      const history = this.getLimitHistory();
      history.push({
        ...limitData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 entries
      const trimmedHistory = history.slice(-50);
      localStorage.setItem(this.STORAGE_KEYS.LIMIT_HISTORY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.warn('Failed to save limit history:', error);
    }
  },

  // Get notification settings
  getNotificationSettings() {
    try {
      const settings = localStorage.getItem(this.STORAGE_KEYS.NOTIFICATION_SETTINGS);
      return settings ? { ...this.DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(settings) } : this.DEFAULT_NOTIFICATION_SETTINGS;
    } catch (error) {
      return this.DEFAULT_NOTIFICATION_SETTINGS;
    }
  },

  // Update notification settings
  updateNotificationSettings(newSettings) {
    try {
      const currentSettings = this.getNotificationSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      localStorage.setItem(this.STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      throw new Error('Failed to update notification settings');
    }
  },

  // Calculate daily spending rate
  async getDailySpendingRate() {
    try {
      const currentExpenses = await this.getCurrentMonthExpenses();
      const currentDate = new Date();
      const dayOfMonth = currentDate.getDate();
      
      return dayOfMonth > 0 ? currentExpenses / dayOfMonth : 0;
    } catch (error) {
      throw new Error('Failed to calculate daily spending rate');
    }
  },

  // Predict month-end expenses based on current rate
  async predictMonthEndExpenses() {
    try {
      const dailyRate = await this.getDailySpendingRate();
      const currentDate = new Date();
      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      
      return dailyRate * daysInMonth;
    } catch (error) {
      throw new Error('Failed to predict month-end expenses');
    }
  },

  // Get spending insights
  async getSpendingInsights() {
    try {
      const limitStatus = await this.getLimitStatus();
      const dailyRate = await this.getDailySpendingRate();
      const predictedTotal = await this.predictMonthEndExpenses();
      
      const insights = {
        dailySpendingRate: dailyRate,
        predictedMonthTotal: predictedTotal,
        isOnTrack: limitStatus.hasLimit ? predictedTotal <= limitStatus.limitAmount : true,
        daysRemaining: this.getDaysRemainingInMonth(),
        recommendedDailySpending: limitStatus.hasLimit ? 
          (limitStatus.remainingAmount / this.getDaysRemainingInMonth()) : null
      };
      
      return insights;
    } catch (error) {
      throw new Error('Failed to generate spending insights');
    }
  },

  // Get days remaining in current month
  getDaysRemainingInMonth() {
    const currentDate = new Date();
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    return lastDayOfMonth - currentDate.getDate();
  },

  // Remove expense limit
  async removeExpenseLimit() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.MONTHLY_LIMIT);
      
      // Save removal to history
      await this.saveLimitToHistory({
        amount: 0,
        currency: 'INR',
        action: 'removed',
        setDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, message: 'Expense limit removed successfully' };
    } catch (error) {
      throw new Error('Failed to remove expense limit');
    }
  },

  // Get limit progress data for UI components
  async getLimitProgressData() {
    try {
      const limitStatus = await this.getLimitStatus();
      
      if (!limitStatus.hasLimit) {
        return null;
      }
      
      return {
        current: limitStatus.currentExpenses,
        limit: limitStatus.limitAmount,
        percentage: limitStatus.percentage,
        remaining: limitStatus.remainingAmount,
        exceeded: limitStatus.exceededAmount,
        status: limitStatus.status,
        progressBarColor: this.getProgressBarColor(limitStatus.status),
        statusText: this.getStatusText(limitStatus.status, limitStatus.percentage)
      };
    } catch (error) {
      throw new Error('Failed to get limit progress data');
    }
  },

  // Get progress bar color based on status
  getProgressBarColor(status) {
    switch (status) {
      case 'safe':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'exceeded':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  },

  // Get status text
  getStatusText(status, percentage) {
    switch (status) {
      case 'safe':
        return `${percentage}% of limit used`;
      case 'warning':
        return `Warning: ${percentage}% of limit used`;
      case 'exceeded':
        return `Limit exceeded by ${(percentage - 100).toFixed(1)}%`;
      default:
        return 'No limit set';
    }
  },

  // Real-time limit checking (to be called when new transactions are added)
  async checkLimitAfterTransaction(newTransaction) {
    try {
      if (newTransaction.amount >= 0) {
        // Income transaction, no need to check limit
        return { notifications: [], limitStatus: await this.getLimitStatus() };
      }
      
      const limitStatus = await this.getLimitStatus();
      const notifications = await this.checkLimitBreachNotifications();
      
      return {
        notifications,
        limitStatus,
        shouldAlert: notifications.length > 0
      };
    } catch (error) {
      throw new Error('Failed to check limit after transaction');
    }
  },

  // Format currency for display
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }
};

export default expenseLimitService;