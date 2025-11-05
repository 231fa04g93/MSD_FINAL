import React, { useState, useEffect } from 'react';
import ProfessionalNotification from './ProfessionalNotification.jsx';

const NotificationContainer = ({ 
  notifications = [], 
  position = 'top-right',
  maxNotifications = 5,
  onNotificationDismiss
}) => {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Limit the number of visible notifications
    const limitedNotifications = notifications.slice(-maxNotifications);
    setVisibleNotifications(limitedNotifications);
  }, [notifications, maxNotifications]);

  const handleDismiss = (notificationId) => {
    // Remove from local state
    setVisibleNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
    
    // Notify parent component
    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    }
  };

  const getContainerStyles = () => {
    const baseStyles = "fixed z-50 pointer-events-none";
    
    const positionStyles = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    };

    return `${baseStyles} ${positionStyles[position] || positionStyles['top-right']}`;
  };

  const getStackDirection = () => {
    return position.includes('bottom') ? 'flex-col-reverse' : 'flex-col';
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className={getContainerStyles()}>
      <div className={`flex ${getStackDirection()} space-y-3 pointer-events-auto`}>
        {visibleNotifications.map((notification, index) => (
          <div
            key={notification.id}
            style={{
              zIndex: 1000 - index, // Stack notifications properly
              animationDelay: `${index * 100}ms` // Stagger entrance animations
            }}
          >
            <ProfessionalNotification
              notification={notification}
              onDismiss={handleDismiss}
              position={position}
              autoClose={notification.autoClose !== false}
            />
          </div>
        ))}
      </div>
      
      {/* Notification count indicator for overflow */}
      {notifications.length > maxNotifications && (
        <div className="mt-2 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 shadow-sm">
            +{notifications.length - maxNotifications} more notifications
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationContainer;