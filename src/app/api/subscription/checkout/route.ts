// src/app/api/subscription/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentTimeGate } from '@/lib/paymentTimeGate';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscriptionConfig';

export async function POST(req: NextRequest) {
  try {
    const timeGate = checkPaymentTimeGate();

    // Enforce 10:00 AM - 11:00 AM IST time restriction
    if (!timeGate.isAllowed) {
      return NextResponse.json(
        {
          message: timeGate.message,
          currentIstTime: timeGate.currentIstTime,
        },
        { status: 403 }
      );
    }

    const { planId, userId, userEmail } = await req.json();

    if (!planId || !SUBSCRIPTION_PLANS[planId as SubscriptionTier]) {
      return NextResponse.json(
        { message: 'Invalid subscription plan selected.' },
        { status: 400 }
      );
    }

    const selectedPlan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];

    if (selectedPlan.id === 'free') {
      return NextResponse.json(
        { message: 'Free plan does not require payment processing.' },
        { status: 400 }
      );
    }

    // Mock order session creation (compatible with Stripe / Razorpay order structure)
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return NextResponse.json({
      success: true,
      orderId,
      amount: selectedPlan.priceINR,
      currency: 'INR',
      plan: selectedPlan,
      userEmail: userEmail || 'user@example.com',
      message: `Checkout session initialized for ${selectedPlan.name}.`,
    });
  } catch (error) {
    console.error('Subscription checkout error:', error);
    return NextResponse.json(
      { message: 'Internal server error while initializing payment checkout.' },
      { status: 500 }
    );
  }
}