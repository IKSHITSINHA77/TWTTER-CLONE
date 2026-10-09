// src/lib/deviceDetector.ts

export type DeviceCategory = 'mobile' | 'laptop' | 'desktop';
export type BrowserType = 'chrome' | 'edge' | 'firefox' | 'safari' | 'other';

export interface DeviceMetadata {
  browser: BrowserType;
  browserRaw: string;
  os: string;
  deviceCategory: DeviceCategory;
  ipAddress: string;
}

export const parseUserAgent = (userAgentString: string, ip: string = '127.0.0.1'): DeviceMetadata => {
  const ua = (userAgentString || '').toLowerCase();

  // 1. Device Category Detection
  let deviceCategory: DeviceCategory = 'desktop';
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) {
    deviceCategory = 'mobile';
  } else if (/ipad|tablet/i.test(ua)) {
    deviceCategory = 'mobile';
  } else if (/macintosh|windows nt|linux/i.test(ua)) {
    // Distinguish laptop/desktop heuristics
    deviceCategory = /touch/i.test(ua) ? 'laptop' : 'desktop';
  }

  // 2. Browser Detection (Edge must be checked before Chrome because Edge includes 'Chrome' in UA)
  let browser: BrowserType = 'other';
  let browserRaw = 'Unknown Browser';

  if (/edg\//i.test(ua) || /edge\//i.test(ua)) {
    browser = 'edge';
    browserRaw = 'Microsoft Edge';
  } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua) && !/opr/i.test(ua)) {
    browser = 'chrome';
    browserRaw = 'Google Chrome';
  } else if (/firefox|fxios/i.test(ua)) {
    browser = 'firefox';
    browserRaw = 'Mozilla Firefox';
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    browser = 'safari';
    browserRaw = 'Apple Safari';
  }

  // 3. Operating System Detection
  let os = 'Unknown OS';
  if (/windows nt 10.0/i.test(ua)) os = 'Windows 10/11';
  else if (/windows nt/i.test(ua)) os = 'Windows';
  else if (/mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return {
    browser,
    browserRaw,
    os,
    deviceCategory,
    ipAddress: ip,
  };
};

/**
 * Mobile Device Login Time-Gate: Strictly 10:00 AM to 1:00 PM IST
 */
export const checkMobileLoginTimeGate = (): { isAllowed: boolean; message: string; currentIstTime: string } => {
  const now = new Date();
  const istDateString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(istDateString);

  const hours = istDate.getHours();
  const isAllowed = hours >= 10 && hours < 13; // 10:00:00 AM to 12:59:59 PM

  const currentIstTime = istDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return {
    isAllowed,
    currentIstTime,
    message: isAllowed
      ? 'Mobile access window is OPEN (10:00 AM – 1:00 PM IST).'
      : `Mobile login is restricted to 10:00 AM – 1:00 PM IST. Current IST is ${currentIstTime}. Access blocked.`,
  };
};