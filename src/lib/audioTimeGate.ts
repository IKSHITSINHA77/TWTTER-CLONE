// src/lib/audioTimeGate.ts

export interface TimeGateStatus {
  isAllowed: boolean;
  message: string;
  nextAllowedWindow?: string;
}

/**
 * Validates if the current time is between 2:00 PM IST (14:00) and 7:00 PM IST (19:00).
 * Indian Standard Time is UTC + 5:30.
 */
export const checkAudioUploadTimeGate = (date: Date = new Date()): TimeGateStatus => {
  // Convert current UTC time to IST (UTC + 5 hours 30 mins)
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  const istOffsetMinutes = 330; // 5 hours * 60 + 30 mins
  const istDate = new Date(utcTime + istOffsetMinutes * 60000);

  const hours = istDate.getHours();
  const minutes = istDate.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const startWindowMinutes = 14 * 60; // 14:00 (2:00 PM)
  const endWindowMinutes = 19 * 60;   // 19:00 (7:00 PM)

  const isAllowed = totalMinutes >= startWindowMinutes && totalMinutes < endWindowMinutes;

  if (isAllowed) {
    return {
      isAllowed: true,
      message: "Audio tweet uploads are currently open (Active window: 2:00 PM – 7:00 PM IST).",
    };
  }

  return {
    isAllowed: false,
    message: "Audio tweets are only permitted between 2:00 PM and 7:00 PM IST.",
    nextAllowedWindow: "2:00 PM IST",
  };
};