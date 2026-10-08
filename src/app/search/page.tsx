// src/app/search/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import SearchFilterDrawer from '@/components/SearchFilterDrawer';
import TweetCard from '@/components/TweetCard';
import { SearchFilters, SearchResultItem } from '@/lib/searchTypes';
import { Loader2, SearchX } from 'lucide-react';
import axiosInstance from '@/lib/axiosInstance';

export default function SearchPage() {
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastFilters, setLastFilters] = useState<SearchFilters | null>(null);

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
    // Initial fetch with default empty query
    fetchSearchResults({
      query: '',
      mediaType: 'all',
      sentiment: 'all',
      sortBy: 'latest',
    });
  }, []);

  return (
    <main className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-neutral-800 pb-16">
      {/* Sticky Search & Filter Header */}
      <SearchFilterDrawer onSearch={fetchSearchResults} isLoading={loading} />

      {/* Results Feed */}
      <div className="p-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <p className="text-xs">Searching tweets...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-500">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-200">No matching tweets found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              {lastFilters?.query
                ? `No posts matched "${lastFilters.query}" under the selected filters. Try broadening your keywords or removing date limits.`
                : 'No tweets currently available in the feed matching your filters.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-500 px-1 pb-1">
              <span>Found {results.length} result{results.length === 1 ? '' : 's'}</span>
              {lastFilters?.sortBy && (
                <span className="capitalize">Sorted by: {lastFilters.sortBy}</span>
              )}
            </div>

            {results.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}