// src/components/TimeGateStatusBadge.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { checkPaymentTimeGate } from '@/lib/paymentTimeGate';

export const TimeGateStatusBadge: React.FC = () => {
  const [istTime, setIstTime] = useState<string>('');
  const [isAudioOpen, setIsAudioOpen] = useState<boolean>(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const hours = istDate.getHours();

      setIstTime(istString);
      // Audio: 2 PM (14) to 7 PM (19)
      setIsAudioOpen(hours >= 14 && hours < 19);
      // Payments: 10 AM (10) to 11 AM (11)
      setIsPaymentOpen(hours >= 10 && hours < 11);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400">
      <div className="flex items-center gap-1.5 font-mono text-neutral-300">
        <Clock className="h-3.5 w-3.5 text-sky-400" />
        <span>IST: {istTime || 'Loading...'}</span>
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        <span className="flex items-center gap-1">
          {isAudioOpen ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
          )}
          <span>Audio: {isAudioOpen ? 'Open (2PM-7PM)' : 'Locked'}</span>
        </span>

        <span className="flex items-center gap-1">
          {isPaymentOpen ? (
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
          )}
          <span>Payments: {isPaymentOpen ? 'Open (10AM-11AM)' : 'Locked'}</span>
        </span>
      </div>
    </div>
  );
};

export default TimeGateStatusBadge;