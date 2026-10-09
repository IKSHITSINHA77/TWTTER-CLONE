// src/app/api/auth/login-security/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseUserAgent, checkMobileLoginTimeGate } from '@/lib/deviceDetector';
import { recordLoginSession, getLoginHistory } from '@/lib/sessionHistoryStore';

const pendingChromeLoginOtps = new Map<string, { otp: string; expiresAt: number; metadata: any }>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'user_demo';
  const history = getLoginHistory(userId);
  return NextResponse.json({ success: true, history });
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const metadata = parseUserAgent(userAgent, ip);

    const body = await req.json();
    const { action, email, password, otp } = body;
    const activeUserId = email || 'user_demo';

    // 1. Enforce Mobile Device Time-Gate (10:00 AM – 1:00 PM IST)
    if (metadata.deviceCategory === 'mobile') {
      const timeGate = checkMobileLoginTimeGate();
      if (!timeGate.isAllowed) {
        return NextResponse.json(
          {
            error: 'MOBILE_TIME_RESTRICTION',
            message: timeGate.message,
            currentIst: timeGate.currentIstTime,
          },
          { status: 403 }
        );
      }
    }

    // 2. Initial Login Attempt
    if (action === 'INITIATE_LOGIN') {
      // Validate credentials (demo check)
      if (!email || !password) {
        return NextResponse.json({ message: 'Email and password required.' }, { status: 400 });
      }

      // Browser Branch 1: Microsoft Edge -> Direct login without OTP
      if (metadata.browser === 'edge') {
        const session = recordLoginSession(activeUserId, metadata, 'direct_password');
        return NextResponse.json({
          success: true,
          requireOtp: false,
          browser: 'Microsoft Edge',
          message: 'Direct authentication successful (Microsoft browser bypass).',
          session,
        });
      }

      // Browser Branch 2: Google Chrome -> Requires Email OTP
      if (metadata.browser === 'chrome') {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        pendingChromeLoginOtps.set(email.toLowerCase(), {
          otp: generatedOtp,
          expiresAt: Date.now() + 5 * 60 * 1000,
          metadata,
        });

        console.log(`\n========================================`);
        console.log(`🔐 [CHROME LOGIN EMAIL OTP GENERATED]`);
        console.log(`To: ${email}`);
        console.log(`Browser: Google Chrome | IP: ${metadata.ipAddress}`);
        console.log(`OTP Code: ${generatedOtp} (Valid for 5 mins)`);
        console.log(`========================================\n`);

        return NextResponse.json({
          success: true,
          requireOtp: true,
          browser: 'Google Chrome',
          message: `Chrome login security: OTP sent to your registered email ${email}.`,
        });
      }

      // Other browsers default to direct login
      const session = recordLoginSession(activeUserId, metadata, 'direct_password');
      return NextResponse.json({
        success: true,
        requireOtp: false,
        browser: metadata.browserRaw,
        message: 'Authentication successful.',
        session,
      });
    }

    // 3. Verify Chrome Email OTP
    if (action === 'VERIFY_CHROME_OTP') {
      const record = pendingChromeLoginOtps.get(email?.toLowerCase());
      if (!record) {
        return NextResponse.json({ message: 'No login OTP pending for this account.' }, { status: 400 });
      }

      if (Date.now() > record.expiresAt) {
        pendingChromeLoginOtps.delete(email.toLowerCase());
        return NextResponse.json({ message: 'Login OTP has expired.' }, { status: 400 });
      }

      if (record.otp !== otp?.trim()) {
        return NextResponse.json({ message: 'Invalid OTP code.' }, { status: 400 });
      }

      pendingChromeLoginOtps.delete(email.toLowerCase());
      const session = recordLoginSession(activeUserId, record.metadata, 'chrome_email_otp');

      return NextResponse.json({
        success: true,
        message: 'Chrome identity verified successfully. Logged in.',
        session,
      });
    }

    return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('Login security error:', err);
    return NextResponse.json({ message: 'Authentication process failed.' }, { status: 500 });
  }
}