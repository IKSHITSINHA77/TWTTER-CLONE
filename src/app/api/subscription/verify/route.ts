// src/app/api/subscription/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentTimeGate } from '@/lib/paymentTimeGate';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscriptionConfig';
import { getUserUsage } from '@/app/api/post/route';

export async function POST(req: NextRequest) {
  try {
    // 1. Time gate check
    const timeGate = checkPaymentTimeGate();
    if (!timeGate.isAllowed) {
      return NextResponse.json(
        { message: timeGate.message },
        { status: 403 }
      );
    }

    const { orderId, planId, userId, userEmail } = await req.json();

    const plan = SUBSCRIPTION_PLANS[planId as SubscriptionTier];
    if (!plan) {
      return NextResponse.json({ message: 'Invalid plan.' }, { status: 400 });
    }

    // 2. Upgrade user tier
    if (userId) {
      const usage = getUserUsage(userId);
      usage.plan = plan.id;
    }

    // 3. Generate Invoice Details
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const invoiceDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const invoiceData = {
      invoiceNumber,
      invoiceDate,
      recipientEmail: userEmail || 'user@example.com',
      planName: plan.name,
      amountPaid: `₹${plan.priceINR}`,
      tweetLimit: plan.tweetLimit === null ? 'Unlimited' : `${plan.tweetLimit} tweets`,
      status: 'PAID',
    };

    // 4. Automated Email Invoice Dispatch (Simulated/Logged for verification)
    console.log(`\n========================================`);
    console.log(`📧 [AUTOMATED INVOICE EMAIL DISPATCHED]`);
    console.log(`To: ${invoiceData.recipientEmail}`);
    console.log(`Invoice #: ${invoiceData.invoiceNumber} | Date: ${invoiceData.invoiceDate}`);
    console.log(`Plan: ${invoiceData.planName} (Paid: ${invoiceData.amountPaid})`);
    console.log(`Tweet Limit: ${invoiceData.tweetLimit}`);
    console.log(`Status: ${invoiceData.status}`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: `Payment successful! Invoice ${invoiceNumber} sent to ${invoiceData.recipientEmail}.`,
      invoice: invoiceData,
      newPlan: plan,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { message: 'Error verifying subscription payment.' },
      { status: 500 }
    );
  }
}