// src/lib/sentimentEngine.ts

export type SentimentType = 'positive' | 'neutral' | 'critical';

const POSITIVE_LEXICON = [
  'great', 'love', 'awesome', 'amazing', 'happy', 'win', 'good', 'best', 
  'excited', 'congrats', 'brilliant', 'wonderful', 'victory', 'proud'
];

const CRITICAL_LEXICON = [
  'bad', 'worst', 'fail', 'hate', 'terrible', 'awful', 'broken', 'issue', 
  'bug', 'poor', 'sad', 'angry', 'lost', 'disappointed', 'fraud'
];

/**
 * Heuristic rule-based sentiment classification
 */
export const analyzeSentiment = (text: string): { sentiment: SentimentType; score: number } => {
  if (!text) return { sentiment: 'neutral', score: 0 };

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let score = 0;

  for (const word of words) {
    if (POSITIVE_LEXICON.includes(word)) score += 1;
    if (CRITICAL_LEXICON.includes(word)) score -= 1;
  }

  if (score > 0) return { sentiment: 'positive', score };
  if (score < 0) return { sentiment: 'critical', score };
  return { sentiment: 'neutral', score: 0 };
};

export const TRENDING_SEARCH_CHIPS = [
  'cricket',
  'science',
  'Next.js',
  'audio notes',
  'technology',
];