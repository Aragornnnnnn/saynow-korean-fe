// 교정 카드의 개선 표현을 한국어 여성 보이스로 들려주는 스피커 버튼
'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { track, EVENTS } from '@/lib/analytics';

type Status = 'idle' | 'loading' | 'playing';

// voice=feedback: 대화 화면과 다른 한국어 여성 보이스로 발음 재생
function ttsUrl(text: string) {
  return `/api/tts?voice=feedback&text=${encodeURIComponent(text)}`;
}

export function PronunciationButton({
  text,
  className,
  trackContext,
}: {
  text: string;
  className?: string;
  trackContext?: Record<string, unknown>;
}) {
  const [status, setStatus] = useState<Status>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 카드가 보이면 오디오를 미리 받아 첫 탭 지연을 없앰
  useEffect(() => {
    if (!text) return;
    fetch(ttsUrl(text)).catch(() => {});
  }, [text]);

  // 언마운트 시 재생 중이던 오디오 정리
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stop = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    setStatus('idle');
  };

  const toggle = () => {
    if (status !== 'idle') {
      stop();
      return;
    }
    setStatus('loading');
    const audio = new Audio(ttsUrl(text));
    audioRef.current = audio;
    // 탭당 한 번만 결과를 기록 (onerror와 play() reject 중복 방지)
    let reported = false;
    const report = (outcome: 'played' | 'error') => {
      if (reported) return;
      reported = true;
      track(EVENTS.PRONUNCIATION_PLAYED, { ...trackContext, outcome });
    };
    audio.onplaying = () => { setStatus('playing'); report('played'); };
    audio.onended = stop;
    audio.onerror = () => { report('error'); stop(); };
    audio.play().catch(() => { report('error'); stop(); });
  };

  return (
    <button
      type='button'
      onClick={toggle}
      aria-label={status === 'playing' ? '재생 멈추기' : '개선 표현 듣기'}
      aria-pressed={status === 'playing'}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 active:bg-zinc-200 ${className ?? ''}`}
    >
      {status === 'loading' ? (
        <Loader2 className='h-4 w-4 animate-spin' />
      ) : (
        <Volume2 className={`h-4 w-4 ${status === 'playing' ? 'animate-pulse text-[#3B82F6]' : ''}`} />
      )}
    </button>
  );
}
