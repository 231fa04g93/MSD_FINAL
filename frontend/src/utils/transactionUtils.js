import { profileService } from '../services/profileService.js';

export const transactionUtils = {
  // Enhanced transaction formatting with all required fields
  formatTransactionForDisplay(transaction) {
    return {
      ...transaction,
      category: profileService.categorizeTransaction(transaction),
      formattedDate: this.formatDate(transaction.createdAt),
      formattedTime: this.formatTime(transaction.createdAt),
      formattedAmount: this.formatCurrency(Math.abs(transaction.amount)),
      displayAmount: this.getDisplayAmount(transaction.amount),
      type: transaction.amount >= 0 ? 'income' : 'expense',
      isExpense: transaction.amount < 0,
      isIncome: transaction.amount >= 0,
      absoluteAmount: Math.abs(transaction.amount)
    };
  },

  // Format multiple transactions
  formatTransactionsForDisplay(transactions) {
    return transactions.map(transaction => this.formatTransactionForDisplay(transaction));
  },

  // Group transactions by date
  groupTransactionsByDate(transactions) {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const dateKey = this.formatDate(transaction.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(this.formatTransactionForDisplay(transaction));
    });
    
    return grouped;
  },

  // Group transactions by category
  groupTransactionsByCategory(transactions) {
    const grouped = {};
    
    transactions.forEach(transaction => {
      const category = profileService.categorizeTransaction(transaction);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(this.formatTransactionForDisplay(transaction));
    });
    
    return grouped;
  },

  // Group transactions by month
  groupTransactionsByMonth(transactions, year = new Date().getFullYear()) {
    const grouped = {};
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    transactions
      .filter(transaction => new Date(transaction.createdAt).getFullYear() === year)
      .forEach(transaction => {
        const date = new Date(transaction.createdAt);
        const monthKey = monthNames[date.getMonth()];
        if (!grouped[monthKey]) {
          grouped[monthKey] = [];
        }
        grouped[monthKey].push(this.formatTransactionForDisplay(transaction));
      });
    
    return grouped;
  },

  // Filter transactions by date range
  filterTransactionsByDateRange(transactions, startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate >= start && transactionDate <= end;
    });
  },

  // Filter transactions by category
  filterTransactionsByCategory(transactions, category) {
    return transactions.filter(transaction => 
      profileService.categorizeTransaction(transaction) === category
    );
  },

  // Filter transactions by type (income/expense)
  filterTransactionsByType(transactions, type) {
    if (type === 'income') {
      return transactions.filter(transaction => transaction.amount >= 0);
    } else if (type === 'expense') {
      return transactions.filter(transaction => transaction.amount < 0);
    }
    return transactions;
  },

  // Sort transactions by various criteria
  sortTransactions(transactions, sortBy = 'date', order = 'desc') {
    const sorted = [...transactions];
    
    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return order === 'desc' ? dateB - dateA : dateA - dateB;
        });
        break;
      case 'amount':
        sorted.sort((a, b) => {
          const amountA = Math.abs(a.amount);
          const amountB = Math.abs(b.amount);
          return order === 'desc' ? amountB - amountA : amountA - amountB;
        });
        break;
      case 'category':
        sorted.sort((a, b) => {
          const categoryA = profileService.categorizeTransaction(a);
          const categoryB = profileService.categorizeTransaction(b);
          return order === 'desc' ? categoryB.localeCompare(categoryA) : categoryA.localeCompare(categoryB);
        });
        break;
      case 'description':
        sorted.sort((a, b) => {
          return order === 'desc' ? b.text.localeCompare(a.text) : a.text.localeCompare(b.text);
        });
        break;
      default:
        break;
    }
    
    return sorted;
  },

  // Calculate transaction statistics
  calculateTransactionStats(transactions) {
    const expenses = transactions.filter(t => t.amount < 0);
    const income = transactions.filter(t => t.amount >= 0);
    
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    
    return {
      totalTransactions: transactions.length,
      totalExpenses,
      totalIncome,
      netAmount,
      expenseCount: expenses.length,
      incomeCount: income.length,
      avgExpense,
      avgIncome,
      formattedTotalExpenses: this.formatCurrency(totalExpenses),
      formattedTotalIncome: this.formatCurrency(totalIncome),
      formattedNetAmount: this.formatCurrency(Math.abs(netAmount)),
      isProfit: netAmount >= 0
    };
  },

  // Get current month transactions
  getCurrentMonthTransactions(transactions) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
  },

  // Get current week transactions
  getCurrentWeekTransactions(transactions) {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return this.filterTransactionsByDateRange(transactions, startOfWeek, endOfWeek);
  },

  // Get today's transactions
  getTodayTransactions(transactions) {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    return this.filterTransactionsByDateRange(transactions, startOfDay, endOfDay);
  },

  // Utility formatting functions
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

  getDisplayAmount(amount) {
    const sign = amount < 0 ? '-' : '+';
    return `${sign}₹${Math.abs(amount).toFixed(2)}`;
  },

  // Search transactions
  searchTransactions(transactions, searchTerm) {
    if (!searchTerm) return transactions;
    
    const term = searchTerm.toLowerCase();
    return transactions.filter(transaction => {
      const category = profileService.categorizeTransaction(transaction).toLowerCase();
      const description = transaction.text.toLowerCase();
      const amount = transaction.amount.toString();
      const date = this.formatDate(transaction.createdAt).toLowerCase();
      
      return category.includes(term) || 
             description.includes(term) || 
             amount.includes(term) || 
             date.includes(term);
    });
  },

  // Get category color for UI consistency
  getCategoryColor(category) {
    const colorMap = {
      'Food': '#ef4444',
      'Transport': '#3b82f6',
      'Entertainment': '#10b981',
      'Shopping': '#f59e0b',
      'Bills': '#8b5cf6',
      'Healthcare': '#ec4899',
      'Education': '#22c55e',
      'Other': '#6b7280'
    };
    
    return colorMap[category] || colorMap['Other'];
  },

  // Get category icon for UI
  getCategoryIcon(category) {
    const iconMap = {
      'Food': '🍽️',
      'Transport': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Bills': '📄',
      'Healthcare': '🏥',
      'Education': '📚',
      'Other': '📝'
    };
    
    return iconMap[category] || iconMap['Other'];
  }
};

export default transactionUtils;