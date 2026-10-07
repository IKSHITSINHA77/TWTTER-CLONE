// src/app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SearchFilters } from '@/lib/searchTypes';
import { executeTweetSearch } from '@/lib/searchEngine';

// In a full DB setup this queries MongoDB / PostgreSQL; here we use an initialized memory set or fallback
const MOCK_DATASET = [
  {
    _id: 't_sample_1',
    author: { displayName: 'Rohit Sharma', username: 'rohit45' },
    content: 'Incredible cricket match today! The team spirit and science behind bowling swing was on display.',
    image: null,
    audio: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    likes: 42,
  },
  {
    _id: 't_sample_2',
    author: { displayName: 'Dr. APJ', username: 'science_first' },
    content: 'Modern space science and exploration will shape our next decade.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
    audio: null,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    likes: 128,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const filters: SearchFilters = {
      query: searchParams.get('q') || '',
      mediaType: (searchParams.get('media') as any) || 'all',
      sentiment: (searchParams.get('sentiment') as any) || 'all',
      startDate: searchParams.get('start') || undefined,
      endDate: searchParams.get('end') || undefined,
      sortBy: (searchParams.get('sort') as any) || 'latest',
    };

    const results = executeTweetSearch(MOCK_DATASET, filters);

    return NextResponse.json({
      success: true,
      count: results.length,
      filters,
      results,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { message: 'Error executing search query.' },
      { status: 500 }
    );
  }
}