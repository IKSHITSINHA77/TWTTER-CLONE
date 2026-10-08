// src/lib/bookmarkStore.ts

export interface BookmarkRecord {
  tweetId: string;
  userId: string;
  collectionId?: string; // Optional folder
  bookmarkedAt: string;
}

// In-memory persistent map: userId -> Set of tweetIds
const userBookmarksMap = new Map<string, Set<string>>();

export const toggleBookmarkInStore = (userId: string, tweetId: string, collectionId?: string): { isBookmarked: boolean } => {
  if (!userBookmarksMap.has(userId)) {
    userBookmarksMap.set(userId, new Set());
  }

  const set = userBookmarksMap.get(userId)!;
  if (set.has(tweetId)) {
    set.delete(tweetId);
    return { isBookmarked: false };
  } else {
    set.add(tweetId);
    return { isBookmarked: true };
  }
};

export const getUserBookmarkedIds = (userId: string): string[] => {
  return Array.from(userBookmarksMap.get(userId) || []);
};

export const isTweetBookmarkedByUser = (userId: string, tweetId: string): boolean => {
  return userBookmarksMap.get(userId)?.has(tweetId) || false;
};