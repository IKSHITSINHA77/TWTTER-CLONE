// src/components/LoginHistoryTable.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Shield, Monitor, Smartphone, Laptop, CheckCircle2, Key, RefreshCw } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

export interface SessionItem {
  id: string;
  browser: string;
  browserRaw: string;
  os: string;
  deviceCategory: string;
  ipAddress: string;
  timestamp: string;
  authMethod: string;
}

export const LoginHistoryTable: React.FC<{ userId?: string }> = ({ userId = 'user_demo' }) => {
  const [history, setHistory] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/auth/login-security?userId=${userId}`);
      if (res.data?.success) {
        setHistory(res.data.history || []);
      }
    } catch (err) {
      console.error('Error fetching login history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const getDeviceIcon = (category: string) => {
    if (category === 'mobile') return <Smartphone className="h-4 w-4 text-amber-400" />;
    if (category === 'laptop') return <Laptop className="h-4 w-4 text-violet-400" />;
    return <Monitor className="h-4 w-4 text-sky-400" />;
  };

  return (
    <Card className="bg-neutral-950 border-neutral-800 text-white rounded-2xl overflow-hidden mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-sky-400" />
            Security & Login History
          </CardTitle>
          <CardDescription className="text-neutral-400 text-xs">
            Detailed device category, operating system, and IP address audit for every session
          </CardDescription>
        </div>
        <button
          type="button"
          onClick={fetchHistory}
          className="p-1.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>

      <CardContent>
        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-500">
            No session history recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Device / OS</th>
                  <th className="py-2.5 px-3">Browser</th>
                  <th className="py-2.5 px-3">IP Address</th>
                  <th className="py-2.5 px-3">Auth Flow</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-900/50 transition">
                    <td className="py-3 px-3 flex items-center gap-2">
                      {getDeviceIcon(item.deviceCategory)}
                      <div>
                        <span className="font-semibold capitalize text-neutral-200 block">
                          {item.deviceCategory}
                        </span>
                        <span className="text-[10px] text-neutral-500">{item.os}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-neutral-300">{item.browserRaw}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-neutral-400">{item.ipAddress}</td>
                    <td className="py-3 px-3">
                      {item.authMethod === 'chrome_email_otp' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                          <Key className="h-3 w-3" /> Chrome Email OTP
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Direct Login
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-neutral-400">
                      {new Date(item.timestamp).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginHistoryTable;