// src/components/NavigationSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Search, 
  Bookmark, 
  BarChart3, 
  KeyRound, 
  Sparkles 
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore & Search', href: '/search', icon: Search },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { label: 'Creator Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Password Recovery', href: '/forgot-password', icon: KeyRound },
];

export const NavigationSidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar (Left rail) */}
      <aside className="hidden md:flex flex-col justify-between w-64 h-screen sticky top-0 border-r border-neutral-800 p-4 bg-black text-white z-40">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sky-400 font-black text-xl tracking-tight">
            <Sparkles className="h-6 w-6" />
            <span>VoiceTwitter</span>
          </Link>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-neutral-900 text-sky-400 border border-neutral-800'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/60'
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-2xl text-xs space-y-1 text-neutral-400">
          <p className="font-semibold text-white">Twitter Clone (Day 45 Complete)</p>
          <p className="text-[11px] text-neutral-500">Multilingual • Audio OTP • Gated Payments</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-neutral-950/90 backdrop-blur-md border-t border-neutral-800 flex items-center justify-around z-50 px-2">
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-medium transition ${
                isActive ? 'text-sky-400' : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default NavigationSidebar;