// src/lib/analyticsStore.ts
import { EngagementEvent, MetricSummary, HourlyHeatmapPoint } from './analyticsTypes';

const events: EngagementEvent[] = [
  // Seed sample data for immediate visual dashboard feedback
  { tweetId: 't1', eventType: 'impression', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { tweetId: 't1', eventType: 'like', timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
  { tweetId: 't1', eventType: 'audio_play', durationSeconds: 25, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { tweetId: 't1', eventType: 'audio_complete', durationSeconds: 60, timestamp: new Date(Date.now() - 1800000).toISOString() },
  { tweetId: 't1', eventType: 'impression', timestamp: new Date(Date.now() - 600000).toISOString() },
  { tweetId: 't1', eventType: 'bookmark', timestamp: new Date(Date.now() - 300000).toISOString() },
];

export const recordEvent = (event: Omit<EngagementEvent, 'timestamp'>) => {
  events.push({
    ...event,
    timestamp: new Date().toISOString(),
  });
};

export const getAggregatedMetrics = (authorId?: string): { summary: MetricSummary; hourly: HourlyHeatmapPoint[] } => {
  let impressions = 0;
  let likes = 0;
  let retweets = 0;
  let bookmarks = 0;
  let audioPlays = 0;
  let audioCompletions = 0;
  let totalAudioDuration = 0;

  const hourlyBuckets = new Array(24).fill(0);

  events.forEach((evt) => {
    const d = new Date(evt.timestamp);
    const hour = d.getHours();
    hourlyBuckets[hour] += 1;

    switch (evt.eventType) {
      case 'impression':
        impressions += 1;
        break;
      case 'like':
        likes += 1;
        break;
      case 'retweet':
        retweets += 1;
        break;
      case 'bookmark':
        bookmarks += 1;
        break;
      case 'audio_play':
        audioPlays += 1;
        if (evt.durationSeconds) totalAudioDuration += evt.durationSeconds;
        break;
      case 'audio_complete':
        audioCompletions += 1;
        if (evt.durationSeconds) totalAudioDuration += evt.durationSeconds;
        break;
    }
  });

  const totalInteractions = likes + retweets + bookmarks + audioPlays;
  const engagementRate = impressions > 0 ? (totalInteractions / impressions) * 100 : 0;
  const avgAudioListenDuration = audioPlays > 0 ? totalAudioDuration / audioPlays : 0;

  const hourly: HourlyHeatmapPoint[] = hourlyBuckets.map((count, hour) => ({ hour, count }));

  return {
    summary: {
      impressions: Math.max(impressions, 1),
      likes,
      retweets,
      bookmarks,
      audioPlays,
      audioCompletions,
      avgAudioListenDuration: Math.round(avgAudioListenDuration),
      engagementRate: parseFloat(engagementRate.toFixed(2)),
    },
    hourly,
  };
};