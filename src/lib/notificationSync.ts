// src/lib/notificationSync.ts

const CHANNEL_NAME = 'twitter_clone_notifications';
let channel: BroadcastChannel | null = null;

export const getNotificationChannel = () => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return null;
  if (!channel) {
    channel = new BroadcastChannel(CHANNEL_NAME);
  }
  return channel;
};

export const broadcastNotifiedId = (tweetId: string) => {
  const ch = getNotificationChannel();
  if (ch) {
    ch.postMessage({ type: 'TWEET_NOTIFIED', tweetId });
  }
};