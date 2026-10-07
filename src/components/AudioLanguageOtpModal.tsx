// src/components/AudioLanguageOtpModal.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Languages, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { SUPPORTED_LANGUAGES } from '@/lib/translationService';

interface AudioLanguageOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  targetLanguage: string;
  onVerified: (language: string) => void;
}

export const AudioLanguageOtpModal: React.FC<AudioLanguageOtpModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  targetLanguage,
  onVerified,
}) => {
  const [step, setStep] = useState<'SELECT' | 'OTP'>('SELECT');
  const [selectedLang, setSelectedLang] = useState<string>(targetLanguage || 'hi');
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async () => {
    setError(null);
    try {
      setLoading(true);
      await axiosInstance.post('/auth/auth-otp', {
        action: 'SEND',
        email: userEmail || 'user@example.com',
        context: 'AUDIO_LANGUAGE_VERIFICATION',
      });
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch verification OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await axiosInstance.post('/auth/auth-otp', {
        action: 'VERIFY',
        email: userEmail || 'user@example.com',
        otp: otp.trim(),
      });

      if (res.data?.success) {
        onVerified(selectedLang);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-neutral-950 border-neutral-800 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
            <Languages className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold">Audio Language Security Gate</CardTitle>
          <CardDescription className="text-neutral-400">
            Verify your email identity before uploading audio content in regional or international languages.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'SELECT' ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-300">
                  Select Audio Spoken Language
                </label>
                <select
                  value={selectedLang}
                  onChange={(e) => setSelectedLang(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-sky-500 transition"
                >
                  {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'en').map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-start gap-2.5 text-xs text-sky-300">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  A one-time verification PIN will be sent to{' '}
                  <strong className="text-white">{userEmail || 'user@example.com'}</strong>.
                </span>
              </div>

              <Button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl py-2.5 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Verification OTP'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Enter the 6-digit OTP code sent to{' '}
                <span className="text-white font-medium">{userEmail || 'user@example.com'}</span>.
              </p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-center font-mono tracking-widest text-lg focus:outline-none focus:border-sky-500 transition"
              />
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.trim().length < 6}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl py-2.5 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm & Authenticate'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AudioLanguageOtpModal;