// src/lib/notificationSync.ts

let broadcastChannel: BroadcastChannel | null = null;

export const getNotificationChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null;
  }

  if (!broadcastChannel) {
    broadcastChannel = new BroadcastChannel('twitter_keyword_notifications');
  }

  return broadcastChannel;
};

export const broadcastNotifiedTweet = (tweetId: string): void => {
  const channel = getNotificationChannel();
  if (channel) {
    channel.postMessage({ type: 'TWEET_NOTIFIED', tweetId });
  }
};