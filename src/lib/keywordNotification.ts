// src/lib/keywordNotification.ts
import { broadcastNotifiedTweet } from './notificationSync';

export const KEYWORD_NOTIFICATION_TERMS = ["cricket", "science"] as const;

/**
 * Checks if the content contains the target keywords ("cricket" or "science")
 * using strict regex word boundaries to prevent false positives.
 */
export const containsNotificationKeyword = (content: string): boolean => {
  if (!content) return false;
  const keywordPattern = new RegExp(
    `\\b(${KEYWORD_NOTIFICATION_TERMS.join("|")})\\b`,
    "i"
  );
  return keywordPattern.test(content);
};

/**
 * Validates if the browser runtime supports the HTML5 Notification API.
 */
export const supportsBrowserNotifications = (): boolean =>
  typeof window !== "undefined" && "Notification" in window;

/**
 * Requests notification permissions from the user.
 */
export const requestBrowserNotificationPermission = async (): Promise<NotificationPermission | "unsupported"> => {
  if (!supportsBrowserNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  return Notification.requestPermission();
};

/**
 * Dispatches a native desktop notification if permission is granted,
 * broadcasts the ID across open tabs to prevent duplicate alerts,
 * and focuses/scrolls the window on click.
 */
export const showKeywordNotification = (content: string, tweetId?: string): void => {
  if (!supportsBrowserNotifications() || Notification.permission !== "granted") return;
  if (!containsNotificationKeyword(content)) return;

  const matched = KEYWORD_NOTIFICATION_TERMS.find((kw) =>
    new RegExp(`\\b${kw}\\b`, "i").test(content)
  );

  const title = `New Tweet mentioning #${matched ? matched.toUpperCase() : "ALERT"}`;

  const notification = new Notification(title, {
    body: content,
    icon: "/favicon.ico",
    tag: tweetId ? `tweet-${tweetId}` : `keyword-${content.slice(0, 20)}`,
  });

  if (tweetId) {
    broadcastNotifiedTweet(tweetId);
  }

  notification.onclick = () => {
    window.focus();
    if (tweetId) {
      const element = document.getElementById(`tweet-${tweetId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
};

/**
 * Bridge helper for TweetComposer to trigger keyword checks directly on new tweets
 */
export const checkAndTriggerKeywordNotification = (payload: { authorName?: string; content: string }): boolean => {
  if (!containsNotificationKeyword(payload.content)) return false;
  showKeywordNotification(payload.content);
  return true;
};