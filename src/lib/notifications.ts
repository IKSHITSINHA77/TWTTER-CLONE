// src/lib/notifications.ts

// Deduplication cache: stores tweet IDs that have already triggered a popup during this session
const seenTweetNotificationIds = new Set<string>();

interface TweetNotificationData {
  id: string;
  text: string;
  authorName?: string;
}

/**
 * Validates keyword match:
 * Checks strictly for the words "cricket" or "science" (case-insensitive) using boundary delimiters.
 */
export const hasTargetKeyword = (text: string): boolean => {
  if (!text) return false;
  const keywordRegex = /\b(cricket|science)\b/i;
  return keywordRegex.test(text);
};

/**
 * Triggers a browser desktop notification if conditions are satisfied.
 */
export const triggerKeywordNotification = (
  tweet: TweetNotificationData,
  userAllowsNotifications: boolean
) => {
  // Ensure we run on the client side
  if (typeof window === 'undefined' || !('Notification' in window)) return;

  // Respect user profile preference
  if (!userAllowsNotifications) return;

  // Respect browser-level permissions
  if (Notification.permission !== 'granted') return;

  // Deduplication check: prevent multi-firing on feed re-renders or refetches
  if (seenTweetNotificationIds.has(tweet.id)) return;

  // Strict keyword check
  if (!hasTargetKeyword(tweet.text)) return;

  // Mark as seen
  seenTweetNotificationIds.add(tweet.id);

  // Trigger browser popup showing the full tweet content
  const notification = new Notification(
    tweet.authorName ? `New update from ${tweet.authorName}` : 'New Keyword Tweet',
    {
      body: tweet.text,
      icon: '/favicon.ico',
      tag: tweet.id // Native OS deduplication tag
    }
  );

  notification.onclick = () => {
    window.focus();
    // Navigate or focus to the tweet if needed
  };
};