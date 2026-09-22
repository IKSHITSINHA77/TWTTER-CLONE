// src/lib/paymentTimeGate.ts

export interface PaymentTimeGateStatus {
  isAllowed: boolean;
  message: string;
  currentIstTime: string;
}

/**
 * Checks if the current time is within the allowed payment window:
 * Strictly 10:00 AM to 11:00 AM IST (10:00 - 11:00).
 */
export const checkPaymentTimeGate = (): PaymentTimeGateStatus => {
  const now = new Date();
  // Convert to Indian Standard Time (UTC + 5:30)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 330 * 60000);

  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const currentFormatted = istTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  // 10:00 AM = 600 minutes, 11:00 AM = 660 minutes
  const isAllowed = totalMinutes >= 600 && totalMinutes < 660;

  return {
    isAllowed,
    currentIstTime: currentFormatted,
    message: isAllowed
      ? 'Payment gateway is active (10:00 AM - 11:00 AM IST).'
      : 'Payments are time-restricted and only allowed between 10:00 AM and 11:00 AM IST.',
  };
};