// src/components/LanguageSelectorModal.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Globe, Mail, Smartphone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { EXACT_SUPPORTED_LANGUAGES } from '@/lib/translationService';
import axiosInstance from '@/lib/axiosInstance';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userPhone?: string;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
  userEmail = 'user@example.com',
  userPhone = '+91-9876543210',
}) => {
  const { currentLanguage, setLanguageDirectly } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<string>(currentLanguage);
  const [step, setStep] = useState<'SELECT' | 'OTP'>('SELECT');
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInitiateChange = async () => {
    setError(null);
    if (selectedLang === 'en') {
      setLanguageDirectly('en');
      onClose();
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post('/translate', {
        action: 'REQUEST_OTP',
        targetLang: selectedLang,
        email: userEmail,
        phone: userPhone,
      });

      setInfoMsg(res.data.message);
      setStep('OTP');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await axiosInstance.post('/translate', {
        action: 'VERIFY_OTP',
        targetLang: selectedLang,
        email: userEmail,
        phone: userPhone,
        otp: otp.trim(),
      });

      if (res.data?.success) {
        setLanguageDirectly(selectedLang);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const isFrench = selectedLang === 'fr';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-neutral-950 border-neutral-800 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
            <Globe className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-bold">Select Interface Language</CardTitle>
          <CardDescription className="text-neutral-400 text-xs">
            Choose your preferred language. Security verification is required.
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
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {EXACT_SUPPORTED_LANGUAGES.map((lang) => {
                  const isSelected = selectedLang === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setSelectedLang(lang.code)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'border-sky-500 bg-sky-500/10 text-white'
                          : 'border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">{lang.nativeName}</span>
                      <span className="text-[11px] text-neutral-500">{lang.name}</span>
                    </button>
                  );
                })}
              </div>

              {selectedLang !== 'en' && (
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs space-y-1 text-neutral-400">
                  <div className="flex items-center gap-2 text-sky-400 font-semibold">
                    {isFrench ? <Mail className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                    <span>{isFrench ? 'Email OTP Required' : 'Mobile Phone OTP Required'}</span>
                  </div>
                  <p className="text-[11px]">
                    {isFrench
                      ? `French verification code will be sent to registered email: ${userEmail}`
                      : `Verification code will be sent via SMS to registered phone: ${userPhone}`}
                  </p>
                </div>
              )}

              <Button
                type="button"
                onClick={handleInitiateChange}
                disabled={loading}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl py-2.5 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Continue'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-neutral-300">{infoMsg}</p>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-center font-mono tracking-widest text-lg focus:outline-none focus:border-sky-500"
              />
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || otp.trim().length < 6}
                className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-xl py-2.5 transition"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Language Switch'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSelectorModal;