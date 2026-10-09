// src/lib/sessionHistoryStore.ts
import { DeviceMetadata } from './deviceDetector';

export interface LoginSessionRecord extends DeviceMetadata {
  id: string;
  userId: string;
  timestamp: string; // ISO
  authMethod: 'direct_password' | 'chrome_email_otp';
}

// In-memory session history database: userId -> LoginSessionRecord[]
const sessionStore = new Map<string, LoginSessionRecord[]>();

export const recordLoginSession = (userId: string, metadata: DeviceMetadata, authMethod: 'direct_password' | 'chrome_email_otp') => {
  const existing = sessionStore.get(userId) || [];
  const record: LoginSessionRecord = {
    id: `sess_${Date.now()}`,
    userId,
    timestamp: new Date().toISOString(),
    authMethod,
    ...metadata,
  };

  // Prepend latest session
  existing.unshift(record);
  sessionStore.set(userId, existing);
  return record;
};

export const getLoginHistory = (userId: string): LoginSessionRecord[] => {
  return sessionStore.get(userId) || [];
};