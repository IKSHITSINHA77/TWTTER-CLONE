// src/app/api/post/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const author = formData.get("author");
    const content = formData.get("content");
    const image = formData.get("image");
    const audio = formData.get("audio") as File | null;

    if (!author && !content && !audio) {
      return NextResponse.json(
        { message: "Tweet content or media is required." },
        { status: 400 }
      );
    }

    // Server-side enforcement for audio uploads
    if (audio && audio.size > 0) {
      // 1. Time-Gate Validation: 2:00 PM to 7:00 PM IST (14:00 - 19:00 IST)
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istOffsetMinutes = 330; // UTC + 5:30
      const istDate = new Date(utcTime + istOffsetMinutes * 60000);

      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const startWindow = 14 * 60; // 14:00 (2:00 PM IST)
      const endWindow = 19 * 60;   // 19:00 (7:00 PM IST)

      if (totalMinutes < startWindow || totalMinutes >= endWindow) {
        return NextResponse.json(
          { message: "Audio uploads are strictly permitted only between 2:00 PM and 7:00 PM IST." },
          { status: 403 }
        );
      }

      // 2. File Size Limit: 100 MB max
      const MAX_SIZE_BYTES = 100 * 1024 * 1024;
      if (audio.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { message: "Audio file exceeds maximum size limit of 100 MB." },
          { status: 400 }
        );
      }

      // 3. Audio Format Validation
      const allowedMimeTypes = [
        "audio/mpeg",
        "audio/mp3",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/aac",
        "audio/mp4",
        "audio/m4a",
        "audio/ogg",
        "audio/webm",
      ];

      if (audio.type && !allowedMimeTypes.includes(audio.type.toLowerCase())) {
        return NextResponse.json(
          { message: "Unsupported audio format. Allowed: MP3, WAV, AAC, M4A, OGG, WEBM." },
          { status: 400 }
        );
      }
    }

    // Build the post object
    const newTweet = {
      _id: "tweet_" + Date.now(),
      author: author ? String(author) : "anonymous",
      content: content ? String(content) : "",
      image: image ? String(image) : null,
      audio: audio && audio.size > 0 ? {
        name: audio.name,
        size: audio.size,
        type: audio.type,
      } : null,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(newTweet, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { message: "Internal server error while creating post." },
      { status: 500 }
    );
  }
}