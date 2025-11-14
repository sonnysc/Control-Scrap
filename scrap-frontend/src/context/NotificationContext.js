/* src/context/NotificationContext.js */
import React, { createContext, useState, useContext, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification debe usarse dentro de NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    const notification = { id, message, type, duration };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const value = {
    addNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  const styles = {
    container: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    },
    notification: {
      padding: '16px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      animation: 'slideInRight 0.3s ease-out',
      minWidth: '300px'
    },
    success: {
      backgroundColor: '#28a745',
      borderLeft: '4px solid #1e7e34'
    },
    error: {
      backgroundColor: '#dc3545',
      borderLeft: '4px solid #c82333'
    },
    warning: {
      backgroundColor: '#ffc107',
      color: '#212529',
      borderLeft: '4px solid #e0a800'
    },
    info: {
      backgroundColor: '#17a2b8',
      borderLeft: '4px solid #138496'
    },
    content: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    message: {
      margin: 0,
      fontSize: '14px',
      lineHeight: '1.4'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: 'inherit',
      cursor: 'pointer',
      fontSize: '18px',
      padding: '0',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px'
    }
  };

  const getNotificationStyle = (type) => ({
    ...styles.notification,
    ...styles[type]
  });

  return (
    <div style={styles.container}>
      {notifications.map(notification => (
        <div
          key={notification.id}
          style={getNotificationStyle(notification.type)}
        >
          <div style={styles.content}>
            <span>
              {notification.type === 'success' && '✅'}
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'info' && '💡'}
            </span>
            <p style={styles.message}>{notification.message}</p>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            style={styles.closeButton}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
      ))}
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationContext;