// src/app/search/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SearchFilterDrawer from '@/components/SearchFilterDrawer';
import TweetCard from '@/components/TweetCard';
import { SearchFilters, SearchResultItem } from '@/lib/searchTypes';
import { TRENDING_SEARCH_CHIPS, analyzeSentiment } from '@/lib/sentimentEngine';
import { Loader2, SearchX, TrendingUp } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

export default function SearchPage() {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSentiment, setActiveSentiment] = useState<'all' | 'positive' | 'neutral' | 'critical'>('all');
  const [lastFilters, setLastFilters] = useState<SearchFilters>({
    query: '',
    mediaType: 'all',
    sentiment: 'all',
    sortBy: 'latest',
  });

  const fetchSearchResults = async (filters: SearchFilters) => {
    try {
      setLoading(true);
      setLastFilters(filters);

      const params = new URLSearchParams();
      if (filters.query) params.append('q', filters.query);
      if (filters.mediaType !== 'all') params.append('media', filters.mediaType);
      if (filters.startDate) params.append('start', filters.startDate);
      if (filters.endDate) params.append('end', filters.endDate);
      if (filters.sortBy) params.append('sort', filters.sortBy);

      const response = await axiosInstance.get(`/search?${params.toString()}`);
      setResults(response.data?.results || []);
    } catch (error) {
      console.error('Search request failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults(lastFilters);
  }, []);

  const handleChipClick = (topic: string) => {
    const updated = { ...lastFilters, query: topic };
    fetchSearchResults(updated);
  };

  const filteredBySentiment = results.filter((tweet) => {
    if (activeSentiment === 'all') return true;
    const { sentiment } = analyzeSentiment(tweet.content || '');
    return sentiment === activeSentiment;
  });

  return (
    <main className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-neutral-800 pb-16">
      <SearchFilterDrawer onSearch={fetchSearchResults} isLoading={loading} />

      {/* Trending Topics Bar */}
      <div className="px-4 py-2.5 border-b border-neutral-800/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <TrendingUp className="h-3.5 w-3.5 text-sky-400 shrink-0" />
        <span className="text-[11px] text-neutral-400 shrink-0 font-medium">Trending:</span>
        {TRENDING_SEARCH_CHIPS.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 hover:border-sky-500 hover:text-sky-400 text-neutral-300 text-xs transition shrink-0"
          >
            #{chip}
          </button>
        ))}
      </div>

      {/* Sentiment Filter Tabs */}
      <div className="px-4 py-2 border-b border-neutral-800/40 flex items-center gap-2 text-xs">
        <span className="text-neutral-500 font-medium">Tone:</span>
        {(['all', 'positive', 'neutral', 'critical'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setActiveSentiment(s)}
            className={`capitalize px-2.5 py-0.5 rounded-lg border text-xs transition ${
              activeSentiment === s
                ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Feed Content */}
      <div className="p-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <p className="text-xs">Searching tweets...</p>
          </div>
        ) : filteredBySentiment.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-500">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-200">No tweets match criteria</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Try adjusting your query, tone filter, or date ranges.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pb-1">
              <span>Showing {filteredBySentiment.length} posts</span>
              {activeSentiment !== 'all' && (
                <span className="capitalize text-sky-400">Tone: {activeSentiment}</span>
              )}
            </div>

            {filteredBySentiment.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}