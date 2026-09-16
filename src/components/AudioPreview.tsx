'use client';

import React from 'react';
import { Button } from './ui/button';
import { Trash2, Volume2 } from 'lucide-react';

export interface AudioPreviewProps {
  audioUrl: string;
  duration?: number;
  onRemove: () => void;
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  audioUrl,
  duration,
  onRemove,
}) => {
  const formatTime = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 bg-gray-900/80 border border-gray-800 rounded-xl p-3 my-2 w-full">
      <div className="p-2 bg-sky-500/20 text-sky-400 rounded-full">
        <Volume2 className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <audio controls src={audioUrl} className="w-full h-8 accent-sky-500" />
      </div>

      {duration ? (
        <span className="text-xs text-gray-400 font-mono">
          {formatTime(duration)}
        </span>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-400 p-2 hover:bg-transparent"
        title="Remove audio"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default AudioPreview;