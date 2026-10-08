// src/app/bookmarks/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import TweetCard from '@/components/TweetCard';
import BookmarkFolderBar from '@/components/BookmarkFolderBar';
import { BookmarkFolder, DEFAULT_BOOKMARK_FOLDERS } from '@/lib/collectionTypes';
import { Bookmark, ArrowLeft, Loader2, BookmarkX } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axiosInstance';

export default function BookmarksPage() {
  const [folders, setFolders] = useState<BookmarkFolder[]>(DEFAULT_BOOKMARK_FOLDERS);
  const [activeFolderId, setActiveFolderId] = useState<string>('all');
  const [bookmarkedTweets, setBookmarkedTweets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/bookmarks');
      const ids: string[] = res.data?.bookmarkedIds || [];

      // Fetch or filter matching tweets
      const searchRes = await axiosInstance.get('/search?media=all');
      const allTweets = searchRes.data?.results || [];
      const saved = allTweets.filter((t: any) => ids.includes(t._id));
      setBookmarkedTweets(saved);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleCreateFolder = async () => {
    const name = prompt('Enter new collection name:');
    if (!name?.trim()) return;

    try {
      const res = await axiosInstance.post('/collections', { folderName: name.trim() });
      if (res.data?.folder) {
        setFolders((prev) => [...prev, res.data.folder]);
      }
    } catch (err) {
      alert('Failed to create folder.');
    }
  };

  const filteredTweets = bookmarkedTweets.filter((t) => {
    if (activeFolderId === 'audio_notes') return Boolean(t.audio?.url);
    if (activeFolderId === 'tech') return (t.content || '').toLowerCase().includes('code') || (t.content || '').toLowerCase().includes('science');
    return true;
  });

  return (
    <main className="min-h-screen bg-black text-white max-w-2xl mx-auto border-x border-neutral-800 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-md border-b border-neutral-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-full hover:bg-neutral-900 text-neutral-400 hover:text-white transition">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-sky-400" />
              Bookmarks
            </h1>
            <p className="text-xs text-neutral-500">Curate and organize your favorite posts</p>
          </div>
        </div>
      </header>

      {/* Folder bar */}
      <BookmarkFolderBar
        folders={folders}
        activeFolderId={activeFolderId}
        onSelectFolder={setActiveFolderId}
        onCreateFolder={handleCreateFolder}
      />

      {/* Bookmarked Tweets Feed */}
      <div className="p-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-sky-400" />
            <p className="text-xs">Loading bookmarks...</p>
          </div>
        ) : filteredTweets.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-3 text-neutral-500">
              <BookmarkX className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-base text-neutral-200">No saved tweets here</h3>
            <p className="text-xs text-neutral-500 max-w-xs mt-1">
              Tap the bookmark button on any post to store it in your personal reading list.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-500 px-1">
              {filteredTweets.length} saved post{filteredTweets.length === 1 ? '' : 's'}
            </p>
            {filteredTweets.map((tweet) => (
              <TweetCard key={tweet._id} tweet={{ ...tweet, bookmarked: true }} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}