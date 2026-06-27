// 온보딩 공유 타입 및 상수
export type OnboardingStep = 'intro' | 'sound' | 'mic' | 'thought' | 'scenario';
export type MicPermissionState = 'idle' | 'requesting' | 'denied';
export type PermissionPreviewPlatform = 'ios' | 'android';

export const STEP_ORDER: OnboardingStep[] = ['intro', 'sound', 'mic', 'thought', 'scenario'];
export const FALLBACK_QUESTION = '안녕하세요! 제 목소리 잘 들리세요?';
export const FALLBACK_TRANSLATED_QUESTION = 'Can you hear me clearly?';
export const SOUND_QUESTIONS = [
  '안녕하세요! 제 목소리 잘 들리세요?',
  '반가워요! 오늘 기분 어때요?',
  '안녕하세요! 한국어 같이 연습해요.',
  '제 말 또렷하게 들리나요?',
  '안녕하세요! 만나서 반가워요.',
];
export const CHAT_PREVIEW_MESSAGES = [
  { role: 'ai', text: 'What food do you like?' },
  { role: 'user', text: 'I like pizza.' },
  { role: 'ai', text: 'Nice. Why do you like it?' },
] as const;
