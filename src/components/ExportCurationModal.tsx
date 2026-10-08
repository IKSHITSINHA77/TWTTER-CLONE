// src/components/ExportCurationModal.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { X, Download, FileText, Check, Copy } from 'lucide-react';

interface ExportCurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tweets: any[];
}

export const ExportCurationModal: React.FC<ExportCurationModalProps> = ({
  isOpen,
  onClose,
  tweets,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateMarkdown = () => {
    return tweets
      .map((t, index) => {
        const author = t.author?.displayName || 'Anonymous';
        const date = t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '';
        return `### ${index + 1}. ${author} (${date})\n> ${t.content || ''}\n${
          t.audio?.url ? `\n*Audio Note Attached*\n` : ''
        }`;
      })
      .join('\n\n---\n\n');
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tweets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `curated_tweets_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg bg-neutral-950 border-neutral-800 text-white shadow-2xl relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-sky-400" />
            Export Curated Posts
          </CardTitle>
          <CardDescription className="text-neutral-400 text-xs">
            Export {tweets.length} saved post{tweets.length === 1 ? '' : 's'} as Markdown or JSON.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 max-h-48 overflow-y-auto font-mono text-[11px] text-neutral-300">
            {generateMarkdown() || 'No posts to display.'}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCopyMarkdown}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs gap-1.5 py-2.5 rounded-xl"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
            </Button>

            <Button
              type="button"
              onClick={handleDownloadJSON}
              className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs gap-1.5 py-2.5 rounded-xl font-semibold"
            >
              <Download className="h-4 w-4" />
              <span>Download JSON</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportCurationModal;