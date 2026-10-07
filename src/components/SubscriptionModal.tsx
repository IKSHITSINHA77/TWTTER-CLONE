// src/components/SubscriptionModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Check, Clock, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { SUBSCRIPTION_PLANS, SubscriptionTier } from '@/lib/subscriptionConfig';
import { checkPaymentTimeGate, PaymentTimeGateStatus } from '@/lib/paymentTimeGate';
import axiosInstance from '@/lib/axiosInstance';

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  onSuccess?: (plan: SubscriptionTier) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  userId,
  userEmail,
  onSuccess,
}) => {
  const [timeGate, setTimeGate] = useState<PaymentTimeGateStatus>({
    isAllowed: false,
    message: '',
    currentIstTime: '',
  });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionTier>('bronze');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync initial and interval-based IST time gate status
  useEffect(() => {
    if (!isOpen) return;

    setTimeGate(checkPaymentTimeGate());
    const timer = setInterval(() => {
      setTimeGate(checkPaymentTimeGate());
    }, 10000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const currentTimeCheck = checkPaymentTimeGate();
    if (!currentTimeCheck.isAllowed) {
      setErrorMessage(currentTimeCheck.message);
      return;
    }

    try {
      setLoading(true);

      // Step 1: Initialize checkout session (checked on server side)
      const checkoutRes = await axiosInstance.post('/subscription/checkout', {
        planId: selectedPlan,
        userId: userId || 'anonymous',
        userEmail: userEmail || 'user@example.com',
      });

      // Step 2: Verify payment and generate/email invoice
      const verifyRes = await axiosInstance.post('/subscription/verify', {
        orderId: checkoutRes.data.orderId,
        planId: selectedPlan,
        userId: userId || 'anonymous',
        userEmail: userEmail || 'user@example.com',
      });

      setSuccessMessage(verifyRes.data.message || 'Payment processed successfully!');
      if (onSuccess) {
        onSuccess(selectedPlan);
      }
    } catch (err: any) {
      const errorText =
        err.response?.data?.message || 'Payment processing failed. Please try again.';
      setErrorMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  const plans = Object.values(SUBSCRIPTION_PLANS).filter((p) => p.id !== 'free');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl bg-neutral-950 border-neutral-800 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-2xl font-bold">Choose a Posting Plan</CardTitle>
          <CardDescription className="text-neutral-400">
            Upgrade your account to increase or unlock your monthly posting capacity.
          </CardDescription>

          {!timeGate.isAllowed ? (
            <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-400/10 px-3 py-2 rounded-xl border border-amber-400/20 mt-2">
              <Clock className="h-4 w-4 shrink-0" />
              <span>
                Payments strictly allowed between 10:00 AM and 11:00 AM IST only. Current IST:{' '}
                {timeGate.currentIstTime || 'Syncing...'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20 mt-2">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Payment gateway is currently OPEN (10:00 AM - 11:00 AM IST).</span>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <h4 className="font-bold text-white text-base">{plan.name}</h4>
                  <p className="text-xl font-extrabold text-sky-400 my-1">
                    ₹{plan.priceINR}
                    <span className="text-xs text-neutral-400 font-normal">/mo</span>
                  </p>
                  <p className="text-xs text-neutral-300 mb-2">
                    {plan.tweetLimit === null ? 'Unlimited tweets' : `Up to ${plan.tweetLimit} tweets`}
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-tight">{plan.description}</p>
                </div>
              );
            })}
          </div>

          <Button
            type="button"
            onClick={handleSubscribe}
            disabled={!timeGate.isAllowed || loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white font-semibold py-3 rounded-xl transition mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : !timeGate.isAllowed ? (
              'Payments Locked Outside 10:00 AM – 11:00 AM IST'
            ) : (
              `Subscribe to ${SUBSCRIPTION_PLANS[selectedPlan].name} (₹${SUBSCRIPTION_PLANS[selectedPlan].priceINR})`
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionModal;