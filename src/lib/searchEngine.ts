// src/lib/searchEngine.ts
import { SearchFilters, SearchResultItem } from './searchTypes';

/**
 * Highlights matched keywords with a mark tag.
 */
export const highlightMatches = (text: string, query: string): string => {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  const pattern = new RegExp(`(${terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
  return text.replace(pattern, '<mark class="bg-amber-400/30 text-amber-200 rounded px-0.5">$1</mark>');
};

/**
 * Filter and rank tweets according to SearchFilters criteria.
 */
export const executeTweetSearch = (
  tweets: SearchResultItem[],
  filters: SearchFilters
): SearchResultItem[] => {
  const queryLower = filters.query.trim().toLowerCase();
  const searchTerms = queryLower.split(/\s+/).filter(Boolean);

  return tweets
    .filter((tweet) => {
      // 1. Text Query Filter
      if (searchTerms.length > 0) {
        const contentLower = (tweet.content || '').toLowerCase();
        const authorLower = (typeof tweet.author === 'string' ? tweet.author : tweet.author?.displayName || '').toLowerCase();
        const matchesQuery = searchTerms.some(
          (term) => contentLower.includes(term) || authorLower.includes(term)
        );
        if (!matchesQuery) return false;
      }

      // 2. Media Type Filter
      if (filters.mediaType === 'image' && !tweet.image) return false;
      if (filters.mediaType === 'audio' && !tweet.audio?.url) return false;
      if (filters.mediaType === 'text' && (tweet.image || tweet.audio?.url)) return false;

      // 3. Date Range Filter
      const tweetDate = new Date(tweet.createdAt).getTime();
      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        if (tweetDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).setHours(23, 59, 59, 999);
        if (tweetDate > end) return false;
      }

      return true;
    })
    .map((tweet) => {
      // Calculate relevance score
      let score = 0;
      const contentLower = (tweet.content || '').toLowerCase();
      searchTerms.forEach((term) => {
        if (contentLower.includes(term)) score += 5;
      });
      score += (tweet.likes || 0) * 0.5;

      return {
        ...tweet,
        relevanceScore: score,
        highlightedContent: highlightMatches(tweet.content || '', filters.query),
      };
    })
    .sort((a, b) => {
      if (filters.sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (filters.sortBy === 'top') {
        return (b.likes || 0) - (a.likes || 0);
      }
      // relevance
      return (b.relevanceScore || 0) - (a.relevanceScore || 0);
    });
};