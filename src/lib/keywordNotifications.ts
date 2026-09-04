// src/lib/keywordNotifications.ts

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
  if (!supportsBrowserNotifications()) {
    return "unsupported";
  }

  if (Notification.permission === "granted") {
    return "granted";
  }

  return Notification.requestPermission();
};

/**
 * Dispatches a native desktop notification if permission is granted,
 * sets the notification tag to deduplicate popups, and focuses the browser tab on click.
 */
export const showKeywordNotification = (content: string, tweetId?: string): void => {
  if (!supportsBrowserNotifications() || Notification.permission !== "granted") {
    return;
  }

  if (!containsNotificationKeyword(content)) {
    return;
  }

  const notification = new Notification("New Tweet Alert", {
    body: content,
    icon: "/favicon.ico",
    tag: tweetId ? `tweet-${tweetId}` : `keyword-${content.slice(0, 20)}`,
  });

  notification.onclick = () => {
    // Bring the app's browser tab into focus
    window.focus();

    // Scroll directly to the tweet element if it is present in the DOM
    if (tweetId) {
      const element = document.getElementById(`tweet-${tweetId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };
};