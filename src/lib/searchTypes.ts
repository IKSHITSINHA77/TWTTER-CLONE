// src/lib/searchTypes.ts

export type MediaTypeFilter = 'all' | 'text' | 'image' | 'audio';
export type SentimentFilter = 'all' | 'positive' | 'neutral' | 'critical';

export interface SearchFilters {
  query: string;
  mediaType: MediaTypeFilter;
  sentiment: SentimentFilter;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  sortBy: 'latest' | 'top' | 'relevance';
}

export interface SearchResultItem {
  _id: string;
  author: any;
  content: string;
  image?: string | null;
  audio?: any | null;
  audioLanguage?: string;
  createdAt: string;
  likes?: number;
  relevanceScore?: number;
  highlightedContent?: string;
}