// src/lib/audioValidator.ts

export const MAX_AUDIO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB
export const MAX_AUDIO_DURATION_SECONDS = 300; // 5 minutes

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/aac',
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/webm',
];

export interface AudioValidationResult {
  valid: boolean;
  error?: string;
  duration?: number;
}

/**
 * Extracts audio duration in seconds using the browser Audio object.
 */
export const getAudioDuration = (file: File | Blob): Promise<number> => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();

    audio.preload = 'metadata';

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata.'));
    };

    audio.src = url;
  });
};

/**
 * Validates audio file constraints (100MB limit, valid MIME type, and <= 5 minutes).
 */
export const validateAudioFile = async (file: File): Promise<AudioValidationResult> => {
  // 1. Check size limit
  if (file.size > MAX_AUDIO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Audio file exceeds maximum size limit of 100 MB (File size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  // 2. Check format
  if (file.type && !ALLOWED_AUDIO_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Unsupported audio format. Please upload MP3, WAV, AAC, M4A, or OGG.',
    };
  }

  // 3. Check duration limit (5 mins)
  try {
    const duration = await getAudioDuration(file);
    if (duration > MAX_AUDIO_DURATION_SECONDS) {
      const minutes = Math.floor(duration / 60);
      const seconds = Math.floor(duration % 60);
      return {
        valid: false,
        error: `Audio duration exceeds maximum limit of 5 minutes (${minutes}m ${seconds}s).`,
        duration,
      };
    }

    return {
      valid: true,
      duration,
    };
  } catch {
    return {
      valid: false,
      error: 'Could not verify audio file duration. Please ensure the file is not corrupted.',
    };
  }
};