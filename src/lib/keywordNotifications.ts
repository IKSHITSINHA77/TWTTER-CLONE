export const KEYWORD_NOTIFICATION_TERMS = ["cricket", "science"] as const;

export const containsNotificationKeyword = (content: string) => {
  const keywordPattern = new RegExp(
    `\\b(${KEYWORD_NOTIFICATION_TERMS.join("|")})\\b`,
    "i"
  );

  return keywordPattern.test(content);
};

export const supportsBrowserNotifications = () =>
  typeof window !== "undefined" && "Notification" in window;

export const requestBrowserNotificationPermission = async () => {
  if (!supportsBrowserNotifications()) {
    return "unsupported" as const;
  }

  if (Notification.permission === "granted") {
    return "granted" as const;
  }

  return Notification.requestPermission();
};

export const showKeywordNotification = (content: string) => {
  if (
    !supportsBrowserNotifications() ||
    Notification.permission !== "granted" ||
    !containsNotificationKeyword(content)
  ) {
    return;
  }

  new Notification("Keyword tweet", {
    body: content,
    tag: `keyword-tweet-${content}`,
  });
};
