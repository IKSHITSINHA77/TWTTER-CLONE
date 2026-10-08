// src/app/api/analytics/overview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAggregatedMetrics, recordEvent } from '@/lib/analyticsStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authorId = searchParams.get('userId') || undefined;

    const data = getAggregatedMetrics(authorId);
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ message: 'Internal analytics error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tweetId, eventType, durationSeconds } = body;

    if (!tweetId || !eventType) {
      return NextResponse.json({ message: 'tweetId and eventType required' }, { status: 400 });
    }

    recordEvent({
      tweetId,
      eventType,
      durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
    });

    return NextResponse.json({ success: true, message: 'Event logged' }, { status: 201 });
  } catch (error) {
    console.error('Analytics event log error:', error);
    return NextResponse.json({ message: 'Failed to record event' }, { status: 500 });
  }
}