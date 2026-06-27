'use client';

import { useCallback, useEffect, useRef } from 'react';
import { playNativeTts, stopNativeTts } from '@/bridge/commands';
import { webBridge } from '@/bridge/webBridge';

interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
}

export function useTts() {
  const onEndRef = useRef<(() => void) | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return webBridge.subscribe((message) => {
      if (message.type === 'TTS_END') {
        onEndRef.current?.();
        onEndRef.current = undefined;
      }
    });
  }, []);

  const speak = useCallback((text: string, ttsUrl: string | null, options?: SpeakOptions) => {
    if (playNativeTts(text, ttsUrl ?? null)) {
      onEndRef.current = options?.onEnd;
      options?.onStart?.();
      return;
    }

    // 웹: 네이버 클라우드 TTS 오디오 재생. 실패하면 브라우저 음성합성으로 폴백.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();

    const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
    audioRef.current = audio;
    audio.onplay = () => options?.onStart?.();
    audio.onended = () => options?.onEnd?.();
    audio.onerror = () => speakWithBrowser(text, options);
    audio.play().catch(() => speakWithBrowser(text, options));
  }, []);

  const stop = useCallback(() => {
    stopNativeTts();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis?.cancel();
    onEndRef.current?.();
    onEndRef.current = undefined;
  }, []);

  return { speak, stop };
}

// 네이버 TTS 실패 시 브라우저 내장 음성합성으로 폴백
function speakWithBrowser(text: string, options?: SpeakOptions) {
  if (!window.speechSynthesis) {
    options?.onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9;
  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = () => options?.onEnd?.();
  window.speechSynthesis.speak(utterance);
}
