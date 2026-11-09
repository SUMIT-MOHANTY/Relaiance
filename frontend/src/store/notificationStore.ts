/**
 * notificationStore.ts
 * Global notification state management using Zustand
 * Provides a stack-based notification system for the application
 */

import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (type: NotificationType, message: string) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Generate unique ID for notifications
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (type: NotificationType, message: string) => {
    const notification: Notification = {
      id: generateId(),
      type,
      message,
      timestamp: Date.now(),
    };
    set((state) => ({
      notifications: [...state.notifications, notification],
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },
}));

// Convenience hook for components
export const useNotification = () => {
  const { addNotification, removeNotification, clearAll, notifications } = useNotificationStore();
  
  return {
    notifications,
    showSuccess: (message: string) => addNotification('success', message),
    showError: (message: string) => addNotification('error', message),
    showWarning: (message: string) => addNotification('warning', message),
    showInfo: (message: string) => addNotification('info', message),
    removeNotification,
    clearAll,
  };
};
