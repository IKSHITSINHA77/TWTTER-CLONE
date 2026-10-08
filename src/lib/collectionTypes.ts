// src/lib/collectionTypes.ts

export interface BookmarkFolder {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  count: number;
}

export const DEFAULT_BOOKMARK_FOLDERS: BookmarkFolder[] = [
  { id: 'all', name: 'All Saved', count: 0 },
  { id: 'audio_notes', name: 'Audio & Voice', icon: 'Volume2', color: 'text-violet-400', count: 0 },
  { id: 'tech', name: 'Tech & Code', icon: 'Code', color: 'text-sky-400', count: 0 },
  { id: 'read_later', name: 'Read Later', icon: 'Clock', color: 'text-amber-400', count: 0 },
];