// src/app/api/translate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const MOCK_DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    hello: 'नमस्ते',
    cricket: 'क्रिकेट',
    science: 'विज्ञान',
    welcome: 'स्वागत हे',
    world: 'दुनिया',
  },
  es: {
    hello: 'hola',
    cricket: 'críquet',
    science: 'ciencia',
    welcome: 'bienvenido',
    world: 'mundo',
  },
  fr: {
    hello: 'bonjour',
    cricket: 'cricket',
    science: 'science',
    welcome: 'bienvenue',
    world: 'monde',
  },
  de: {
    hello: 'hallo',
    cricket: 'cricket',
    science: 'wissenschaft',
    welcome: 'willkommen',
    world: 'welt',
  },
  ta: {
    hello: 'வணக்கம்',
    cricket: 'கிரிக்கெட்',
    science: 'அறிவியல்',
    welcome: 'வரவேற்பு',
    world: 'உலகம்',
  },
  bn: {
    hello: 'হ্যালো',
    cricket: 'ক্রিকেট',
    science: 'বিজ্ঞান',
    welcome: 'স্বাগতম',
    world: 'বিশ্ব',
  },
};

export async function POST(req: NextRequest) {
  try {
    const { text, targetLang } = await req.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { message: 'Missing text or targetLang parameter.' },
        { status: 400 }
      );
    }

    if (targetLang === 'en') {
      return NextResponse.json({
        translatedText: text,
        originalText: text,
        targetLang,
      });
    }

    let translated = text;
    const langDict = MOCK_DICTIONARY[targetLang];

    if (langDict) {
      Object.entries(langDict).forEach(([eng, replacement]) => {
        const regex = new RegExp(`\\b${eng}\\b`, 'gi');
        translated = translated.replace(regex, replacement);
      });
    }

    // If no direct words were matched, format as target-language localized output
    if (translated === text) {
      translated = `[${targetLang.toUpperCase()}] ${text}`;
    }

    return NextResponse.json({
      translatedText: translated,
      originalText: text,
      targetLang,
    });
  } catch (error) {
    console.error('API Translation error:', error);
    return NextResponse.json(
      { message: 'Failed to translate content.' },
      { status: 500 }
    );
  }
}