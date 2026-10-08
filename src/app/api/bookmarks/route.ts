// src/app/api/bookmarks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { toggleBookmarkInStore, getUserBookmarkedIds } from '@/lib/bookmarkStore';
import { recordEvent } from '@/lib/analyticsStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || 'anonymous';
    const bookmarkedIds = getUserBookmarkedIds(userId);

    return NextResponse.json({
      success: true,
      count: bookmarkedIds.length,
      bookmarkedIds,
    });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json({ message: 'Failed to retrieve bookmarks.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tweetId, collectionId } = body;

    if (!tweetId) {
      return NextResponse.json({ message: 'tweetId is required.' }, { status: 400 });
    }

    const activeUserId = userId || 'anonymous';
    const { isBookmarked } = toggleBookmarkInStore(activeUserId, tweetId, collectionId);

    // Sync telemetry to analytics engine when user bookmarks
    if (isBookmarked) {
      recordEvent({
        tweetId,
        eventType: 'bookmark',
        userId: activeUserId,
      });
    }

    return NextResponse.json({
      success: true,
      isBookmarked,
      tweetId,
      message: isBookmarked ? 'Tweet added to bookmarks.' : 'Tweet removed from bookmarks.',
    });
  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json({ message: 'Failed to toggle bookmark.' }, { status: 500 });
  }
}