// src/app/forgot-password/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, KeyRound, Dices, ArrowLeft, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';
import { generateLettersOnlyPassword } from '@/lib/passwordGenerator';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleGeneratePassword = () => {
    const generated = generateLettersOnlyPassword(14);
    setNewPassword(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setWarningMessage(null);

    if (!identifier.trim()) {
      setWarningMessage('Please enter your email address or phone number.');
      return;
    }

    try {
      setLoading(true);
      const res = await axiosInstance.post('/auth/forgot-password', {
        identifier: identifier.trim(),
        newPassword: newPassword.trim() || undefined,
      });

      setMessage(res.data.message || 'Password reset link sent successfully.');
    } catch (err: any) {
      const errorText = err.response?.data?.message || 'Failed to request password reset.';
      setWarningMessage(errorText);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-neutral-950 border-neutral-800 text-white shadow-2xl">
        <CardHeader className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-neutral-400 hover:text-white transition mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back to Home
          </Link>
          <div className="w-12 h-12 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2">
            <KeyRound className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription className="text-neutral-400">
            Enter your registered email address or phone number to recover your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {warningMessage && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 text-amber-400 text-sm font-medium">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{warningMessage}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{message}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Email or Phone Number
              </label>
              <input
                type="text"
                placeholder="name@example.com or +919876543210"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300">
                  New Password (Letters Only)
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                >
                  <Dices className="h-3.5 w-3.5" /> Generate
                </button>
              </div>

              <input
                type="text"
                placeholder="Auto-generate or enter letters only"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-sky-500 transition text-sm font-mono"
              />
              <p className="text-[11px] text-neutral-500">
                Only uppercase and lowercase letters permitted. No numbers or symbols.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-2.5 font-semibold transition"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}