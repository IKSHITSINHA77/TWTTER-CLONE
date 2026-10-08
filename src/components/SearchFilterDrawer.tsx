// src/components/SearchFilterDrawer.tsx
'use client';

import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Calendar, FileText, Image as ImageIcon, Volume2 } from 'lucide-react';
import { Button } from './ui/button';
import { SearchFilters, MediaTypeFilter } from '@/lib/searchTypes';

interface SearchFilterDrawerProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
}

export const SearchFilterDrawer: React.FC<SearchFilterDrawerProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [mediaType, setMediaType] = useState<MediaTypeFilter>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'top' | 'relevance'>('latest');

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSearch({
      query,
      mediaType,
      sentiment: 'all',
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sortBy,
    });
  };

  const handleClearFilters = () => {
    setMediaType('all');
    setStartDate('');
    setEndDate('');
    setSortBy('latest');
    onSearch({
      query,
      mediaType: 'all',
      sentiment: 'all',
      sortBy: 'latest',
    });
  };

  const activeFiltersCount =
    (mediaType !== 'all' ? 1 : 0) +
    (startDate ? 1 : 0) +
    (endDate ? 1 : 0) +
    (sortBy !== 'latest' ? 1 : 0);

  return (
    <div className="w-full bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 p-4 sticky top-0 z-30 space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, #topics, or @users..."
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-full text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-sky-500 transition"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                onSearch({
                  query: '',
                  mediaType,
                  sentiment: 'all',
                  startDate: startDate || undefined,
                  endDate: endDate || undefined,
                  sortBy,
                });
              }}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setIsDrawerOpen(!isDrawerOpen)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full border text-xs font-medium transition ${
            activeFiltersCount > 0
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 bg-neutral-900'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-sky-500 text-white rounded-full text-[10px]">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        <Button
          type="submit"
          disabled={isLoading}
          className="bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-4 py-2.5 rounded-full transition"
        >
          Search
        </Button>
      </form>

      {/* Expandable Filter Drawer */}
      {isDrawerOpen && (
        <div className="pt-3 border-t border-neutral-800/80 space-y-4 text-xs animate-in fade-in duration-200">
          {/* Media Type Filter */}
          <div>
            <span className="text-neutral-400 font-medium block mb-2">Media Format</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'All Tweets', icon: null },
                { id: 'text', label: 'Text Only', icon: FileText },
                { id: 'image', label: 'Images', icon: ImageIcon },
                { id: 'audio', label: 'Audio / Voice', icon: Volume2 },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = mediaType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMediaType(item.id as MediaTypeFilter)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'border-sky-500 bg-sky-500/10 text-sky-400 font-semibold'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range & Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-400 block mb-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-400 block mb-1">Sort Results By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-200 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="latest">Latest First</option>
                <option value="top">Top Engaged (Likes)</option>
                <option value="relevance">Highest Keyword Relevance</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-neutral-500 hover:text-neutral-300 underline text-xs"
            >
              Reset all filters
            </button>
            <Button
              type="button"
              onClick={() => handleSearchSubmit()}
              className="bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-4 py-1.5 rounded-xl"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterDrawer;