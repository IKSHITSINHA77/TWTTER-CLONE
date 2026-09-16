// src/lib/notificationService.ts

export const NOTIFICATION_PREF_KEY = 'twitter_keyword_notifications_enabled';

export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

export const getNotificationPreference = (): boolean => {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem(NOTIFICATION_PREF_KEY);
  return saved !== null ? JSON.parse(saved) : true;
};

export const setNotificationPreference = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(enabled));
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!isNotificationSupported()) return false;
  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};