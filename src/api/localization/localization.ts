export type Language = 'ko' | 'en';

export type LocalizedText = { localized: Record<Language, string> };

export type LText = string | LocalizedText;
