'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent } from './ui/card';
import LoadingSpinner from './loading-spinner';
import TweetCard from './TweetCard';
import TweetComposer from './TweetComposer';
import axiosInstance from '@/lib/axiosInstance';
import {
  containsNotificationKeyword,
  showKeywordNotification,
} from '@/lib/keywordNotifications';

export interface Author {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified?: boolean;
}

export interface Tweet {
  _id?: string;
  id?: string;
  author: Author;
  content: string;
  timestamp?: string;
  createdAt?: string;
  likes?: number;
  retweets?: number;
  comments?: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
}

export const Feed: React.FC = () => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const notifiedTweetIds = useRef<Set<string>>(new Set<string>());

  // Notification processor with deduplication check and tweetId anchoring
  const checkAndNotify = useCallback(
    (tweet: Tweet) => {
      if (!user?.notificationsEnabled) return;

      const tweetId = tweet._id ?? tweet.id;
      const text = tweet.content || '';

      if (!tweetId || notifiedTweetIds.current.has(tweetId)) {
        return;
      }

      if (containsNotificationKeyword(text)) {
        notifiedTweetIds.current.add(tweetId);
        showKeywordNotification(text, tweetId);
      }
    },
    [user?.notificationsEnabled]
  );

  // Initial fetch with user-visible loading state
  const fetchTweets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/post');
      const fetchedTweets: Tweet[] = Array.isArray(res.data) ? res.data : [];
      setTweets(fetchedTweets);

      fetchedTweets.forEach((tweet) => checkAndNotify(tweet));
    } catch (error) {
      console.error('Error fetching initial tweets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Background fetcher (runs silently without resetting loading spinners)
  const fetchLatestTweetsSilently = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/post');
      const fetchedTweets: Tweet[] = Array.isArray(res.data) ? res.data : [];

      setTweets(fetchedTweets);
      fetchedTweets.forEach((tweet) => checkAndNotify(tweet));
    } catch (error) {
      console.error('Background tweet fetch failed:', error);
    }
  }, [checkAndNotify]);

  // Initial load
  useEffect(() => {
    fetchTweets();
  }, []);

  // Background polling (every 30s) and re-sync on tab focus
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchLatestTweetsSilently();
    }, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestTweetsSilently();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchLatestTweetsSilently]);

  // Sync notifications if user enables them while feed is already loaded
  useEffect(() => {
    if (user?.notificationsEnabled && tweets.length > 0) {
      tweets.forEach((tweet) => checkAndNotify(tweet));
    }
  }, [user?.notificationsEnabled, tweets, checkAndNotify]);

  // Handle locally composed tweets immediately
  const handleNewTweet = (newTweet: Tweet) => {
    setTweets((prev) => [newTweet, ...prev]);
    checkAndNotify(newTweet);
  };

  return (
    <div className="min-h-screen">
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-white">Home</h1>
        </div>

        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800 rounded-none h-auto">
            <TabsTrigger
              value="foryou"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              For you
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <TweetComposer onTweetPosted={handleNewTweet} />

      <div className="divide-y divide-gray-800">
        {loading ? (
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p>Loading tweets...</p>
              </div>
            </CardContent>
          </Card>
        ) : tweets.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No tweets to display.
          </div>
        ) : (
          tweets.map((tweet) => {
            const key = tweet._id || tweet.id || Math.random().toString();
            return (
              <div id={`tweet-${key}`} key={key}>
                <TweetCard tweet={tweet} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Feed;