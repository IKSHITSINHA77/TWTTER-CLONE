// src/lib/analyticsTypes.ts

export interface EngagementEvent {
  tweetId: string;
  userId?: string;
  eventType: 'impression' | 'like' | 'retweet' | 'audio_play' | 'audio_complete' | 'bookmark';
  durationSeconds?: number;
  timestamp: string; // ISO
}

export interface MetricSummary {
  impressions: number;
  likes: number;
  retweets: number;
  bookmarks: number;
  audioPlays: number;
  audioCompletions: number;
  avgAudioListenDuration: number;
  engagementRate: number; // percentage
}

export interface HourlyHeatmapPoint {
  hour: number; // 0 - 23
  count: number;
}