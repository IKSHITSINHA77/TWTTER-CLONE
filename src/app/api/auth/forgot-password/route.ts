// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Temporary rate-limit store: identifier -> YYYY-MM-DD
const resetHistory = new Map<string, string>();

const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

export async function POST(req: NextRequest) {
  try {
    const { identifier, newPassword } = await req.json();

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { message: 'Registered email address or phone number is required.' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const today = getTodayDateString();

    // Check 1-time per day constraint
    const lastResetDate = resetHistory.get(cleanIdentifier);
    if (lastResetDate === today) {
      return NextResponse.json(
        { message: 'You can use this option only one time per day.' },
        { status: 429 }
      );
    }

    // Letters-only password validation
    if (newPassword) {
      const isLettersOnly = /^[A-Za-z]+$/.test(newPassword);
      if (!isLettersOnly) {
        return NextResponse.json(
          { message: 'Password must contain only uppercase and lowercase letters.' },
          { status: 400 }
        );
      }
    }

    resetHistory.set(cleanIdentifier, today);

    return NextResponse.json({
      success: true,
      message: `Password reset instructions sent successfully to ${identifier}.`,
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Internal server error while processing password reset.' },
      { status: 500 }
    );
  }
}