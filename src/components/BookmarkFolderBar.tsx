// src/components/BookmarkFolderBar.tsx
'use client';

import React from 'react';
import { BookmarkFolder } from '@/lib/collectionTypes';
import { Folder, Plus } from 'lucide-react';

interface BookmarkFolderBarProps {
  folders: BookmarkFolder[];
  activeFolderId: string;
  onSelectFolder: (id: string) => void;
  onCreateFolder: () => void;
}

export const BookmarkFolderBar: React.FC<BookmarkFolderBarProps> = ({
  folders,
  activeFolderId,
  onSelectFolder,
  onCreateFolder,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto p-4 border-b border-neutral-800 no-scrollbar bg-neutral-950/40">
      {folders.map((f) => {
        const isSelected = activeFolderId === f.id;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFolder(f.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition shrink-0 ${
              isSelected
                ? 'border-sky-500 bg-sky-500/10 text-sky-400'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700'
            }`}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>{f.name}</span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onCreateFolder}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-neutral-400 hover:text-white border border-dashed border-neutral-800 hover:border-neutral-700 shrink-0 transition"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New Folder</span>
      </button>
    </div>
  );
};

export default BookmarkFolderBar;