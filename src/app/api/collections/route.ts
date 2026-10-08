// src/app/api/collections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_BOOKMARK_FOLDERS, BookmarkFolder } from '@/lib/collectionTypes';

const userCustomFolders = new Map<string, BookmarkFolder[]>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId') || 'anonymous';

  const folders = userCustomFolders.get(userId) || DEFAULT_BOOKMARK_FOLDERS;
  return NextResponse.json({ success: true, folders });
}

export async function POST(req: NextRequest) {
  try {
    const { userId, folderName } = await req.json();

    if (!folderName || !folderName.trim()) {
      return NextResponse.json({ message: 'Collection name is required.' }, { status: 400 });
    }

    const activeUserId = userId || 'anonymous';
    const existing = userCustomFolders.get(activeUserId) || [...DEFAULT_BOOKMARK_FOLDERS];

    const newFolder: BookmarkFolder = {
      id: `folder_${Date.now()}`,
      name: folderName.trim(),
      count: 0,
    };

    existing.push(newFolder);
    userCustomFolders.set(activeUserId, existing);

    return NextResponse.json({ success: true, folder: newFolder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to create collection.' }, { status: 500 });
  }
}