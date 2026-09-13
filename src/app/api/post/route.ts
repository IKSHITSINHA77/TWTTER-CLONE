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

    let audioData: { url: string; duration: number; name: string; size: number } | null = null;

    if (audio && audio.size > 0) {
      // 1. IST Time-Gate Validation: strictly 2:00 PM to 7:00 PM IST (14:00 - 19:00 IST)
      const now = new Date();
      const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
      const istDate = new Date(utcTime + 330 * 60000);

      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      if (totalMinutes < 14 * 60 || totalMinutes >= 19 * 60) {
        return NextResponse.json(
          { message: "Audio tweets can only be uploaded between 2:00 PM and 7:00 PM IST." },
          { status: 403 }
        );
      }

      // 2. Strict 100MB File Size Constraint
      const MAX_SIZE_BYTES = 100 * 1024 * 1024;
      if (audio.size > MAX_SIZE_BYTES) {
        return NextResponse.json(
          { message: "Audio file exceeds maximum size limit of 100 MB." },
          { status: 400 }
        );
      }

      // 3. Audio File / Codec Verification
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

      // 4. Generate persistent base64 data URL for standalone playback
      const bytes = await audio.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64Audio = `data:${audio.type || "audio/webm"};base64,${buffer.toString("base64")}`;

      audioData = {
        url: base64Audio,
        duration: 0,
        name: audio.name,
        size: audio.size,
      };
    }

    const newTweet = {
      _id: "tweet_" + Date.now(),
      author: author ? String(author) : "anonymous",
      content: content ? String(content) : "",
      image: image ? String(image) : null,
      audio: audioData,
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