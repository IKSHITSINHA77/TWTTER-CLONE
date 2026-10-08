// src/lib/telemetry.ts

export const logAnalyticsEvent = async (
  tweetId: string,
  eventType: 'impression' | 'like' | 'retweet' | 'audio_play' | 'audio_complete' | 'bookmark',
  durationSeconds?: number
) => {
  try {
    if (!tweetId) return;
    await fetch('/api/analytics/overview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tweetId, eventType, durationSeconds }),
    });
  } catch {
    // Fail silently so user experience is never blocked
  }
};