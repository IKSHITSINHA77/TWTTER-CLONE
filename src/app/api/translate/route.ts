// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory OTP storage for language switches: identifier -> { otp, expiresAt, targetLang }
const languageOtpStore = new Map<string, { otp: string; expiresAt: number; targetLang: string }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, targetLang, email, phone, otp } = body;

    // 1. Dispatch OTP
    if (action === 'REQUEST_OTP') {
      if (!targetLang) {
        return NextResponse.json({ message: 'Target language is required.' }, { status: 400 });
      }

      if (targetLang === 'en') {
        return NextResponse.json({ success: true, message: 'English does not require verification.' });
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000;

      if (targetLang === 'fr') {
        // French strictly requires Email OTP
        if (!email) {
          return NextResponse.json({ message: 'Email address is required for French language verification.' }, { status: 400 });
        }

        languageOtpStore.set(email.toLowerCase(), { otp: generatedOtp, expiresAt, targetLang });

        console.log(`\n========================================`);
        console.log(`📧 [EMAIL OTP FOR FRENCH LANGUAGE SWITCH]`);
        console.log(`To: ${email}`);
        console.log(`Verification OTP: ${generatedOtp} (Valid for 5 mins)`);
        console.log(`========================================\n`);

        return NextResponse.json({
          success: true,
          verificationType: 'email',
          destination: email,
          message: `Verification code sent to registered email ${email}.`,
        });
      } else {
        // Spanish, Hindi, Portuguese, Chinese require Phone OTP
        const contactPhone = phone || '+91-9876543210';
        languageOtpStore.set(contactPhone, { otp: generatedOtp, expiresAt, targetLang });

        console.log(`\n========================================`);
        console.log(`📱 [SMS PHONE OTP FOR ${targetLang.toUpperCase()} LANGUAGE SWITCH]`);
        console.log(`To Mobile: ${contactPhone}`);
        console.log(`Verification OTP: ${generatedOtp} (Valid for 5 mins)`);
        console.log(`========================================\n`);

        return NextResponse.json({
          success: true,
          verificationType: 'phone',
          destination: contactPhone,
          message: `Verification code sent to registered mobile number ${contactPhone}.`,
        });
      }
    }

    // 2. Verify OTP
    if (action === 'VERIFY_OTP') {
      const identifier = (targetLang === 'fr' ? email?.toLowerCase() : phone) || '+91-9876543210';
      const record = languageOtpStore.get(identifier);

      if (!record) {
        return NextResponse.json({ message: 'No pending OTP request found.' }, { status: 400 });
      }

      if (Date.now() > record.expiresAt) {
        languageOtpStore.delete(identifier);
        return NextResponse.json({ message: 'Verification OTP has expired.' }, { status: 400 });
      }

      if (record.otp !== otp?.trim()) {
        return NextResponse.json({ message: 'Invalid verification code.' }, { status: 400 });
      }

      languageOtpStore.delete(identifier);
      return NextResponse.json({
        success: true,
        language: record.targetLang,
        message: 'Language preference verified and applied successfully.',
      });
    }

    return NextResponse.json({ message: 'Invalid action.' }, { status: 400 });
  } catch (error) {
    console.error('Language verification error:', error);
    return NextResponse.json({ message: 'Failed to process language verification.' }, { status: 500 });
  }
}