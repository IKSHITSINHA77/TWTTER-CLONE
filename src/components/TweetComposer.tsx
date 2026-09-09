// src/components/TweetComposer.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  Image as ImageIcon,
  Smile,
  Calendar,
  MapPin,
  BarChart3,
  Globe,
  Mic,
  MicOff,
  Music,
  Clock,
} from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/lib/axiosInstance';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { AudioPreview } from './AudioPreview';
import { checkAudioUploadTimeGate } from '@/lib/audioTimeGate';
import { validateAudioFile } from '@/lib/audioValidator';

interface TweetComposerProps {
  onTweetPosted?: (tweet: any) => void;
}

export const TweetComposer: React.FC<TweetComposerProps> = ({ onTweetPosted }) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageurl, setimageurl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [timeGate, setTimeGate] = useState(checkAudioUploadTimeGate());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 200;

  const {
    isRecording,
    recordingDuration,
    audioBlob,
    audioUrl,
    startRecording,
    stopRecording,
    resetAudio,
  } = useAudioRecorder();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeGate(checkAudioUploadTimeGate());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsLoading(true);
    const image = e.target.files[0];
    const formdataimg = new FormData();
    formdataimg.set('image', image);
    try {
      const res = await axios.post(
        'https://api.imgbb.com/1/upload?key=97f3fb960c3520d6a88d7e29679cf96f',
        formdataimg
      );
      const url = res.data.data.display_url;
      if (url) {
        setimageurl(url);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAudioError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!timeGate.isAllowed) {
      setAudioError(timeGate.message);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const validation = await validateAudioFile(file);
    if (!validation.valid) {
      setAudioError(validation.error || 'Invalid audio file');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    resetAudio();
    setAudioFile(file);
  };

  const handleStartRecording = async () => {
    setAudioError(null);
    if (!timeGate.isAllowed) {
      setAudioError(timeGate.message);
      return;
    }
    if (audioFile) {
      setAudioFile(null);
    }
    await startRecording();
  };

  const handleRemoveAudio = () => {
    resetAudio();
    setAudioFile(null);
    setAudioError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeAudioUrl = audioFile ? URL.createObjectURL(audioFile) : audioUrl;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || (!content.trim() && !audioBlob && !audioFile)) return;

    if ((audioBlob || audioFile) && !timeGate.isAllowed) {
      setAudioError(timeGate.message);
      return;
    }

    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append('author', user._id);
      formData.append('content', content);
      if (imageurl) {
        formData.append('image', imageurl);
      }

      if (audioFile) {
        formData.append('audio', audioFile);
      } else if (audioBlob) {
        formData.append('audio', audioBlob, 'voice-recording.webm');
      }

      const res = await axiosInstance.post('/post', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (onTweetPosted) {
        onTweetPosted(res.data);
      }

      setContent('');
      setimageurl('');
      handleRemoveAudio();
    } catch (error: any) {
      console.error(error);
      setAudioError(error.response?.data?.message || 'Failed to post tweet.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!user) return null;

  return (
    <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar} alt={user.displayName} />
            <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <Textarea
                placeholder="What's happening?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="bg-transparent border-none text-xl text-white placeholder-gray-500 resize-none min-h-[100px] focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              {!timeGate.isAllowed && (
                <div className="flex items-center gap-2 text-xs text-amber-400/90 bg-amber-400/10 px-3 py-1.5 rounded-lg my-2 border border-amber-400/20">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>{timeGate.message}</span>
                </div>
              )}

              {isRecording && (
                <div className="flex items-center justify-between bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl my-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-sm font-medium">Recording audio...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{formatSeconds(recordingDuration)} / 5:00</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={stopRecording}
                      className="h-7 px-3 text-xs"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}

              {activeAudioUrl && !isRecording && (
                <AudioPreview
                  audioUrl={activeAudioUrl}
                  onRemove={handleRemoveAudio}
                />
              )}

              {audioError && (
                <div className="text-xs text-red-400 my-2">
                  {audioError}
                </div>
              )}

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-blue-400">
                  <label
                    htmlFor="tweetImage"
                    className="p-2 rounded-full hover:bg-blue-900/20 cursor-pointer"
                    title="Attach Image"
                  >
                    <ImageIcon className="h-5 w-5" />
                    <input
                      type="file"
                      accept="image/*"
                      id="tweetImage"
                      className="hidden"
                      onChange={handlePhotoUpload}
                      disabled={isLoading}
                    />
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="hidden"
                    disabled={!timeGate.isAllowed || isRecording}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!timeGate.isAllowed || isRecording}
                    className="p-2 rounded-full hover:bg-blue-900/20 transition disabled:opacity-40 disabled:hover:bg-transparent"
                    title={timeGate.isAllowed ? 'Upload audio (Max 100MB, 5 min)' : 'Audio uploads locked'}
                  >
                    <Music className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : handleStartRecording}
                    disabled={!timeGate.isAllowed}
                    className={`p-2 rounded-full transition ${
                      isRecording
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-blue-400 hover:bg-blue-900/20'
                    } disabled:opacity-40 disabled:hover:bg-transparent`}
                    title={timeGate.isAllowed ? (isRecording ? 'Stop Recording' : 'Record voice note') : 'Audio uploads locked'}
                  >
                    {isRecording ? <MicOff className="h-5 w-5 animate-pulse" /> : <Mic className="h-5 w-5" />}
                  </button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20 text-blue-400"
                  >
                    <BarChart3 className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20 text-blue-400"
                  >
                    <Smile className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20 text-blue-400"
                  >
                    <Calendar className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-blue-900/20 text-blue-400"
                  >
                    <MapPin className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Globe className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-blue-400 font-semibold">
                      Everyone can reply
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    {characterCount > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className="relative w-8 h-8">
                          <svg className="w-8 h-8 transform -rotate-90">
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              className="text-gray-700"
                            />
                            <circle
                              cx="16"
                              cy="16"
                              r="14"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 14}`}
                              strokeDashoffset={`${
                                2 *
                                Math.PI *
                                14 *
                                (1 - characterCount / maxLength)
                              }`}
                              className={
                                isOverLimit
                                  ? 'text-red-500'
                                  : isNearLimit
                                  ? 'text-yellow-500'
                                  : 'text-blue-500'
                              }
                            />
                          </svg>
                        </div>
                        {isNearLimit && (
                          <span
                            className={`text-sm ${
                              isOverLimit ? 'text-red-500' : 'text-yellow-500'
                            }`}
                          >
                            {maxLength - characterCount}
                          </span>
                        )}
                      </div>
                    )}

                    <Separator
                      orientation="vertical"
                      className="h-6 bg-gray-700"
                    />

                    <Button
                      type="submit"
                      disabled={
                        (!content.trim() && !audioBlob && !audioFile) ||
                        isOverLimit ||
                        isLoading ||
                        isRecording
                      }
                      className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-full px-6"
                    >
                      {isLoading ? 'Posting...' : 'Post'}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TweetComposer;