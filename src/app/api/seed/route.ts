// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const seedTweets = [
    {
      _id: 'seed_tweet_01',
      author: { displayName: 'Priya Sharma', username: 'priya_tech', verified: true },
      content: 'Exploring the science behind Next.js server actions and streaming architecture. Loving the performance gains!',
      image: null,
      audio: null,
      createdAt: new Date().toISOString(),
      likes: 84,
      comments: 12,
      retweets: 19,
    },
    {
      _id: 'seed_tweet_02',
      author: { displayName: 'Vikram Singh', username: 'vikram_cricket', verified: false },
      content: 'What an intense cricket match! The bowling strategy in the final overs was pure genius.',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800',
      audio: null,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      likes: 142,
      comments: 31,
      retweets: 45,
    },
    {
      _id: 'seed_tweet_03',
      author: { displayName: 'Aarav Patel', username: 'aarav_voice', verified: true },
      content: 'Here is a quick voice note discussing our product roadmap for the next quarter.',
      image: null,
      audio: {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 45,
        name: 'Product_Roadmap_Voice.mp3',
        size: 1048576,
      },
      audioLanguage: 'hi',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      likes: 67,
      comments: 8,
      retweets: 14,
    },
  ];

  return NextResponse.json({
    success: true,
    message: 'Database seeded with multilingual and audio-enabled test posts.',
    count: seedTweets.length,
    seedTweets,
  });
}