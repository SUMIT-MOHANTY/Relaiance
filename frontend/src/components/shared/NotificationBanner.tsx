/**
 * NotificationBanner.tsx - Global Notification Display Component
 * 
 * MUI Snackbar stack anchored to bottom-right of viewport.
 * Displays notifications from the global notification store.
 * Auto-dismisses after 5 seconds by default.
 */

import React from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { useNotificationStore, Notification, NotificationType } from '../../store/notificationStore';

const getAlertSeverity = (type: NotificationType): 'success' | 'error' | 'warning' | 'info' => {
  switch (type) {
    case 'success':
      return 'success';
    case 'error':
      return 'error';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClose }) => {
  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      sx={{
        position: 'relative',
        mb: 1,
      }}
    >
      <Alert
        severity={getAlertSeverity(notification.type)}
        onClose={onClose}
        sx={{
          minWidth: 300,
          maxWidth: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          '& .MuiAlert-icon': {
            fontSize: 24,
          },
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export const NotificationBanner: React.FC = () => {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        pointerEvents: 'none',
        '& > *': {
          pointerEvents: 'auto',
        },
      }}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </Box>
  );
};

export default NotificationBanner;
