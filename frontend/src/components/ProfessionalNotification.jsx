import React, { useState, useEffect } from 'react';

const ProfessionalNotification = ({ 
  notification, 
  onDismiss, 
  position = 'top-right',
  autoClose = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-close functionality
    if (autoClose && notification.autoClose && notification.duration > 0) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, notification.autoClose, notification.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(notification.id);
      }
    }, 300); // Match exit animation duration
  };

  const getNotificationStyles = () => {
    const baseStyles = "relative flex items-start space-x-3 p-4 rounded-lg shadow-lg border-l-4 backdrop-blur-sm transition-all duration-300 ease-in-out max-w-md";
    
    const typeStyles = {
      success: "bg-green-50 border-green-500 text-green-800",
      error: "bg-red-50 border-red-500 text-red-800",
      warning: "bg-yellow-50 border-yellow-500 text-yellow-800",
      info: "bg-blue-50 border-blue-500 text-blue-800"
    };

    const positionStyles = {
      'top-right': 'transform translate-x-0',
      'top-left': 'transform translate-x-0',
      'bottom-right': 'transform translate-x-0',
      'bottom-left': 'transform translate-x-0'
    };

    const animationStyles = isExiting 
      ? 'opacity-0 transform translate-x-full scale-95'
      : isVisible 
        ? 'opacity-100 transform translate-x-0 scale-100'
        : 'opacity-0 transform translate-x-full scale-95';

    return `${baseStyles} ${typeStyles[notification.type] || typeStyles.info} ${positionStyles[position]} ${animationStyles}`;
  };

  const getIcon = () => {
    const iconStyles = "flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-white font-bold text-sm";
    
    const icons = {
      success: { icon: '✓', bg: 'bg-green-500' },
      error: { icon: '✕', bg: 'bg-red-500' },
      warning: { icon: '⚠', bg: 'bg-yellow-500' },
      info: { icon: 'i', bg: 'bg-blue-500' }
    };

    const { icon, bg } = icons[notification.type] || icons.info;

    return (
      <div className={`${iconStyles} ${bg}`}>
        {icon}
      </div>
    );
  };

  const getProgressBar = () => {
    if (!autoClose || !notification.autoClose || notification.duration <= 0) {
      return null;
    }

    const progressColors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };

    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden">
        <div 
          className={`h-full ${progressColors[notification.type] || progressColors.info} transition-all ease-linear`}
          style={{
            animation: `shrink ${notification.duration}ms linear forwards`
          }}
        />
      </div>
    );
  };

  return (
    <div className={getNotificationStyles()}>
      {/* Icon */}
      {getIcon()}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <h4 className="font-semibold text-sm mb-1 leading-tight">
            {notification.title}
          </h4>
        )}
        <p className="text-sm leading-relaxed">
          {notification.message}
        </p>
        {notification.timestamp && (
          <p className="text-xs opacity-75 mt-1">
            {new Date(notification.timestamp).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </div>

      {/* Dismiss Button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
        aria-label="Dismiss notification"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Progress Bar */}
      {getProgressBar()}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default ProfessionalNotification;