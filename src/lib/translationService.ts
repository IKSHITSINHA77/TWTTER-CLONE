// src/lib/translationService.ts

export interface SupportedLanguage {
  code: string;
  name: string;
  nativeName: string;
  verificationMethod: 'none' | 'email' | 'phone';
}

export const EXACT_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', verificationMethod: 'none' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', verificationMethod: 'phone' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', verificationMethod: 'phone' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', verificationMethod: 'phone' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', verificationMethod: 'phone' },
  { code: 'fr', name: 'French', nativeName: 'Français', verificationMethod: 'email' },
];

export const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    home: 'Home',
    explore: 'Explore & Search',
    bookmarks: 'Bookmarks',
    analytics: 'Creator Analytics',
    tweet: 'Post',
    whatsHappening: "What's happening?",
    loginHistory: 'Login History',
    security: 'Security & Sessions',
  },
  es: {
    home: 'Inicio',
    explore: 'Explorar y Buscar',
    bookmarks: 'Guardados',
    analytics: 'Analítica de Creador',
    tweet: 'Publicar',
    whatsHappening: '¿Qué está pasando?',
    loginHistory: 'Historial de Inicio de Sesión',
    security: 'Seguridad y Sesiones',
  },
  hi: {
    home: 'होम',
    explore: 'खोजें और देखें',
    bookmarks: 'बुकमार्क',
    analytics: 'क्रिएटर एनालिटिक्स',
    tweet: 'पोस्ट करें',
    whatsHappening: 'क्या हो रहा है?',
    loginHistory: 'लॉगिन इतिहास',
    security: 'सुरक्षा और सत्र',
  },
  pt: {
    home: 'Página Inicial',
    explore: 'Explorar e Pesquisar',
    bookmarks: 'Salvos',
    analytics: 'Análise de Criador',
    tweet: 'Publicar',
    whatsHappening: 'O que está acontecendo?',
    loginHistory: 'Histórico de Login',
    security: 'Segurança e Sessões',
  },
  zh: {
    home: '主页',
    explore: '探索与搜索',
    bookmarks: '书签',
    analytics: '创作者分析',
    tweet: '发帖',
    whatsHappening: '正在发生什么？',
    loginHistory: '登录历史记录',
    security: '安全与会话',
  },
  fr: {
    home: 'Accueil',
    explore: 'Explorer et Rechercher',
    bookmarks: 'Signets',
    analytics: 'Statistiques Créateur',
    tweet: 'Publier',
    whatsHappening: 'Quoi de neuf ?',
    loginHistory: 'Historique de Connexion',
    security: 'Sécurité et Sessions',
  },
};
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text || targetLang === 'en') return text;

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!response.ok) {
      throw new Error('Translation endpoint returned an error.');
    }

    const data = await response.json();
    return data.translatedText || text;
  } catch (err) {
    console.error('Translation error:', err);
    return text;
  }
};