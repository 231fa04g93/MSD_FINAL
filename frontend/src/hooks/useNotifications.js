import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService.js';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize notification service
    notificationService.initialize();

    // Subscribe to notification changes
    const unsubscribe = notificationService.subscribe((updatedNotifications) => {
      setNotifications(updatedNotifications);
    });

    // Set initial notifications
    setNotifications(notificationService.getNotifications());

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const addNotification = (type, title, message, options = {}) => {
    return notificationService.addNotification(type, title, message, options);
  };

  const removeNotification = (notificationId) => {
    notificationService.removeNotification(notificationId);
  };

  const clearAllNotifications = () => {
    notificationService.clearAllNotifications();
  };

  const notifySuccess = (title, message, duration) => {
    notificationService.notifySuccess(title, message, duration);
  };

  const notifyError = (title, message) => {
    notificationService.notifyError(title, message);
  };

  const notifyWarning = (title, message) => {
    notificationService.notifyWarning(title, message);
  };

  const notifyInfo = (title, message, duration) => {
    notificationService.notifyInfo(title, message, duration);
  };

  const checkExpenseLimits = async () => {
    return await notificationService.checkAndNotifyExpenseLimits();
  };

  const notifyTransactionAdded = (transaction) => {
    notificationService.notifyTransactionAdded(transaction);
  };

  const notifyTransactionDeleted = (transaction) => {
    notificationService.notifyTransactionDeleted(transaction);
  };

  const notifyLimitUpdated = (limitAmount) => {
    notificationService.notifyLimitUpdated(limitAmount);
  };

  const notifyLimitRemoved = () => {
    notificationService.notifyLimitRemoved();
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    checkExpenseLimits,
    notifyTransactionAdded,
    notifyTransactionDeleted,
    notifyLimitUpdated,
    notifyLimitRemoved,
    hasNotifications: notifications.length > 0,
    hasHighPriorityNotifications: notifications.some(n => n.priority === 'high'),
    hasLimitNotifications: notifications.some(n => n.isLimitNotification)
  };
};

export default useNotifications;