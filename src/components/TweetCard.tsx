// src/components/TweetCard.tsx
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { AudioPlayer } from "./AudioPlayer";
import {
  Globe,
  Loader2,
  Volume2,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, translateText } from "@/lib/translationService";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";

export interface Tweet {
  _id: string;
  author: {
    displayName: string;
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  content: string;
  image?: string | null;
  audio?: {
    url: string;
    duration: number;
    name?: string;
    size?: number;
  } | null;
  audioLanguage?: string;
  timestamp?: string;
  createdAt?: string;
  likes?: number;
  comments?: number;
  retweets?: number;
  liked?: boolean;
  retweeted?: boolean;
  likedBy?: string[];
  retweetedBy?: string[];
}

interface TweetCardProps {
  tweet: any;
}

export const TweetCard: React.FC<TweetCardProps> = ({ tweet }) => {
  const { user } = useAuth();
  const [tweetstate, setTweetState] = useState<any>(tweet);
  const [displayedContent, setDisplayedContent] = useState<string>(tweet.content || "");
  const [currentLang, setCurrentLang] = useState<string>("en");
  const [translating, setTranslating] = useState<boolean>(false);

  const handleLanguageChange = async (targetLang: string) => {
    if (targetLang === currentLang) return;

    if (targetLang === "en") {
      setDisplayedContent(tweetstate.content || "");
      setCurrentLang("en");
      return;
    }

    try {
      setTranslating(true);
      const translated = await translateText(tweetstate.content, targetLang);
      setDisplayedContent(translated);
      setCurrentLang(targetLang);
    } catch (error) {
      console.error("Failed to translate tweet content:", error);
    } finally {
      setTranslating(false);
    }
  };

  const likeTweet = async (tweetId: string) => {
    try {
      const res = await axiosInstance.post(`/like/${tweetId}`, {
        userId: user?._id,
      });
      setTweetState(res.data);
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  };

  const retweetTweet = async (tweetId: string) => {
    try {
      const res = await axiosInstance.post(`/retweet/${tweetId}`, {
        userId: user?._id,
      });
      setTweetState(res.data);
    } catch (error) {
      console.error("Error retweeting:", error);
    }
  };

  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const isLiked = tweetstate.likedBy?.includes(user?._id) || tweetstate.liked;
  const isRetweet = tweetstate.retweetedBy?.includes(user?._id) || tweetstate.retweeted;

  const displayName =
    tweetstate.author?.displayName ||
    (typeof tweetstate.author === "string" ? tweetstate.author : "Anonymous");
  const username = tweetstate.author?.username || displayName.toLowerCase().replace(/\s+/g, "");
  const avatar = tweetstate.author?.avatar;

  const dateValue = tweetstate.timestamp || tweetstate.createdAt;
  const formattedDate = dateValue
    ? new Date(dateValue).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <Card className="bg-black border-neutral-800 border-x-0 border-t-0 rounded-none hover:bg-neutral-950/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* User Avatar */}
          <Avatar className="h-10 w-10 shrink-0">
            {avatar && <AvatarImage src={avatar} alt={displayName} />}
            <AvatarFallback className="bg-neutral-800 text-white font-bold text-xs uppercase">
              {displayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header / Meta */}
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="font-bold text-white text-sm truncate">{displayName}</span>
              {tweetstate.author?.verified && (
                <div className="bg-sky-500 rounded-full p-0.5">
                  <svg className="h-3 w-3 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                  </svg>
                </div>
              )}
              <span className="text-neutral-500 text-xs">@{username}</span>
              {formattedDate && (
                <>
                  <span className="text-neutral-500 text-xs">·</span>
                  <span className="text-neutral-500 text-xs">{formattedDate}</span>
                </>
              )}

              {tweetstate.audioLanguage && tweetstate.audioLanguage !== "en" && (
                <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-medium text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                  <Volume2 className="h-3 w-3" />
                  {tweetstate.audioLanguage.toUpperCase()}
                </span>
              )}

              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-900"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tweet Text Content */}
            {displayedContent && (
              <div className="text-neutral-200 text-sm mb-3 leading-relaxed whitespace-pre-wrap">
                {displayedContent}
              </div>
            )}

            {/* Image Attachment */}
            {tweetstate.image && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-neutral-800">
                <img
                  src={tweetstate.image}
                  alt="Tweet media"
                  className="w-full h-auto max-h-96 object-cover"
                />
              </div>
            )}

            {/* Audio Attachment */}
            {tweetstate.audio?.url && (
            <div className="mb-3">
                <AudioPlayer
                    src={tweetstate.audio.url}
                    duration={tweetstate.audio.duration}
                />
            </div>
            )}
            )

            {/* Multilingual Translation Controls */}
            {tweetstate.content && (
              <div className="mb-3 flex items-center justify-between text-xs text-neutral-400 bg-neutral-950/60 border border-neutral-800/80 rounded-xl px-2.5 py-1.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[11px] text-neutral-400">Translate:</span>
                  <select
                    id={`lang-select-${tweetstate._id}`}
                    value={currentLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={translating}
                    className="bg-neutral-900 border border-neutral-800 rounded px-2 py-0.5 text-neutral-300 text-xs focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code} className="bg-neutral-950 text-white">
                        {lang.nativeName} ({lang.name})
                      </option>
                    ))}
                  </select>
                </div>

                {translating && (
                  <span className="flex items-center gap-1 text-[11px] text-sky-400 font-medium">
                    <Loader2 className="h-3 w-3 animate-spin" /> Translating...
                  </span>
                )}
              </div>
            )}

            {/* Tweet Action Bar */}
            <div className="flex items-center justify-between max-w-md text-neutral-500">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1.5 p-2 rounded-full hover:bg-sky-500/10 hover:text-sky-400 transition"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs">{formatNumber(tweetstate.comments)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  retweetTweet(tweetstate._id);
                }}
                className={`flex items-center space-x-1.5 p-2 rounded-full hover:bg-emerald-500/10 transition ${
                  isRetweet ? "text-emerald-400" : "hover:text-emerald-400"
                }`}
              >
                <Repeat2 className="h-4 w-4" />
                <span className="text-xs">{formatNumber(tweetstate.retweets)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  likeTweet(tweetstate._id);
                }}
                className={`flex items-center space-x-1.5 p-2 rounded-full hover:bg-rose-500/10 transition ${
                  isLiked ? "text-rose-500" : "hover:text-rose-400"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-xs">{formatNumber(tweetstate.likes)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-1.5 p-2 rounded-full hover:bg-sky-500/10 hover:text-sky-400 transition"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetCard;