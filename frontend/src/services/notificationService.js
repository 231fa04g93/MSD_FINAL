import { expenseLimitService } from './expenseLimitService.js';

export const notificationService = {
  // Active notifications storage
  activeNotifications: [],
  listeners: [],

  // Add a new notification
  addNotification(type, title, message, options = {}) {
    const notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
      autoClose: options.autoClose !== false,
      duration: options.duration || this.getDefaultDuration(type),
      dismissed: false,
      ...options
    };

    this.activeNotifications.push(notification);
    this.notifyListeners();
    
    return notification;
  },

  // Remove a notification
  removeNotification(notificationId) {
    this.activeNotifications = this.activeNotifications.filter(
      notification => notification.id !== notificationId
    );
    this.notifyListeners();
  },

  // Clear all notifications
  clearAllNotifications() {
    this.activeNotifications = [];
    this.notifyListeners();
  },

  // Get all active notifications
  getNotifications() {
    return [...this.activeNotifications];
  },

  // Subscribe to notification changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  // Notify all listeners
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getNotifications());
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  },

  // Get default duration based on notification type
  getDefaultDuration(type) {
    const durations = {
      success: 3000,
      info: 5000,
      warning: 0, // Don't auto-close warnings
      error: 0    // Don't auto-close errors
    };
    return durations[type] || 5000;
  },

  // Expense limit specific notifications
  async checkAndNotifyExpenseLimits() {
    try {
      const limitNotifications = await expenseLimitService.checkLimitBreachNotifications();
      
      // Remove existing limit notifications to avoid duplicates
      this.activeNotifications = this.activeNotifications.filter(
        notification => !notification.isLimitNotification
      );

      // Add new limit notifications
      limitNotifications.forEach(notification => {
        this.addNotification(
          notification.type,
          notification.title,
          notification.message,
          {
            autoClose: false,
            isLimitNotification: true,
            priority: 'high'
          }
        );
      });

      return limitNotifications.length > 0;
    } catch (error) {
      console.error('Failed to check expense limit notifications:', error);
      return false;
    }
  },

  // Show success notification for limit updates
  notifyLimitUpdated(limitAmount) {
    this.addNotification(
      'success',
      'Limit Updated',
      `Monthly expense limit set to ₹${limitAmount.toLocaleString('en-IN')}`,
      { duration: 3000 }
    );
  },

  // Show notification when limit is removed
  notifyLimitRemoved() {
    this.addNotification(
      'info',
      'Limit Removed',
      'Monthly expense limit has been removed',
      { duration: 3000 }
    );
  },

  // Show notification for transaction-related events
  notifyTransactionAdded(transaction) {
    const isExpense = transaction.amount < 0;
    const amount = Math.abs(transaction.amount);
    
    this.addNotification(
      isExpense ? 'info' : 'success',
      isExpense ? 'Expense Added' : 'Income Added',
      `${transaction.text}: ₹${amount.toLocaleString('en-IN')}`,
      { duration: 2000 }
    );

    // Check if this expense triggers limit notifications immediately
    if (isExpense) {
      this.checkAndNotifyExpenseLimits();
    }
  },

  // Show notification for transaction deletion
  notifyTransactionDeleted(transaction) {
    const amount = Math.abs(transaction.amount);
    this.addNotification(
      'info',
      'Transaction Deleted',
      `${transaction.text}: ₹${amount.toLocaleString('en-IN')} removed`,
      { duration: 2000 }
    );

    // Recheck limits after deletion immediately
    this.checkAndNotifyExpenseLimits();
  },

  // Show error notifications
  notifyError(title, message) {
    this.addNotification('error', title, message, { autoClose: false });
  },

  // Show success notifications
  notifySuccess(title, message, duration = 3000) {
    this.addNotification('success', title, message, { duration });
  },

  // Show warning notifications
  notifyWarning(title, message) {
    this.addNotification('warning', title, message, { autoClose: false });
  },

  // Show info notifications
  notifyInfo(title, message, duration = 5000) {
    this.addNotification('info', title, message, { duration });
  },

  // Bulk notification management
  addBulkNotifications(notifications) {
    notifications.forEach(notification => {
      this.addNotification(
        notification.type,
        notification.title,
        notification.message,
        notification.options || {}
      );
    });
  },

  // Get notifications by type
  getNotificationsByType(type) {
    return this.activeNotifications.filter(notification => notification.type === type);
  },

  // Get high priority notifications
  getHighPriorityNotifications() {
    return this.activeNotifications.filter(notification => notification.priority === 'high');
  },

  // Check if there are any active limit notifications
  hasActiveLimitNotifications() {
    return this.activeNotifications.some(notification => notification.isLimitNotification);
  },

  // Periodic check for limit notifications (can be called on app focus/visibility change)
  async performPeriodicLimitCheck() {
    try {
      const hasNewNotifications = await this.checkAndNotifyExpenseLimits();
      return hasNewNotifications;
    } catch (error) {
      console.error('Periodic limit check failed:', error);
      return false;
    }
  },

  // Initialize notification service
  initialize() {
    // Perform initial limit check
    this.checkAndNotifyExpenseLimits();

    // Set up periodic checks (every 5 minutes)
    setInterval(() => {
      this.performPeriodicLimitCheck();
    }, 5 * 60 * 1000);

    // Listen for page visibility changes to check limits when user returns
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.performPeriodicLimitCheck();
        }
      });
    }
  },

  // Cleanup
  destroy() {
    this.activeNotifications = [];
    this.listeners = [];
  }
};

export default notificationService;