'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { ShieldCheck, Mail, Loader2, X } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

interface AudioOtpModalProps {
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const AudioOtpModal: React.FC<AudioOtpModalProps> = ({
  email,
  isOpen,
  onClose,
  onVerified,
}) => {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post('/auth/audio-otp', {
        action: 'send',
        email,
      });
      setOtpSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the 6-digit code.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await axiosInstance.post('/auth/audio-otp', {
        action: 'verify',
        email,
        otp,
      });
      onVerified();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-sky-500/20 text-sky-400 rounded-full">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Audio Upload Security Check</h3>
            <p className="text-xs text-neutral-400">Email OTP verification is required to post audio.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-neutral-800/60 rounded-xl border border-neutral-700/50 flex items-center gap-3">
            <Mail className="h-5 w-5 text-neutral-400 shrink-0" />
            <span className="text-sm font-medium text-neutral-200 truncate">{email}</span>
          </div>

          {error && <p className="text-xs text-red-400 font-medium">{error}</p>}

          {!otpSent ? (
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-2.5 font-semibold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Verification OTP'}
            </Button>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full bg-black border border-neutral-700 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-white focus:outline-none focus:border-sky-500"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  variant="ghost"
                  className="w-1/3 text-xs text-neutral-400 hover:text-white"
                >
                  Resend
                </Button>
                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.length < 6}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-2 font-semibold"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Verify & Allow'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};