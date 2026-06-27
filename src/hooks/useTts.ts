'use client';

import { useCallback, useEffect, useRef } from 'react';
import { playNativeTts, stopNativeTts } from '@/bridge/commands';
import { webBridge } from '@/bridge/webBridge';
import { setTtsStatus, clearTtsStatus } from '@/lib/ttsDebug';

interface SpeakOptions {
  // durationMs: 실제 오디오 길이(ms). 자막/하이라이트를 음성에 맞추는 용도. 모르면 undefined.
  onStart?: (durationMs?: number) => void;
  onEnd?: () => void;
}

// 0.05초 무음 WAV. iOS Safari에서 오디오 엘리먼트를 unlock할 때만 재생.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA';

// 클라우드 TTS 오디오를 화면 전환과 무관하게 재사용하기 위한 모듈 싱글톤.
// iOS Safari는 한 번 user gesture 안에서 unlock한 엘리먼트만 이후 자동 재생을 허용하므로
// 페이지마다 new Audio()를 만들면 영원히 잠긴 상태가 된다. 하나만 만들어 공유한다.
let sharedAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;

function getSharedAudio(): HTMLAudioElement {
  if (!sharedAudio) sharedAudio = new Audio();
  return sharedAudio;
}

export function useTts() {
  const onEndRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    return webBridge.subscribe((message) => {
      if (message.type === 'TTS_END') {
        onEndRef.current?.();
        onEndRef.current = undefined;
      }
    });
  }, []);

  // iOS Safari 대응: 사용자 탭(gesture) 안에서 호출해 공유 오디오 재생 권한을 미리 확보.
  // 무음을 한 번 재생해 두면 이후 effect 등 gesture 밖에서도 speak()가 동작한다.
  const unlock = useCallback(() => {
    if (audioUnlocked || webBridge.isAvailable()) return;
    const audio = getSharedAudio();
    // iOS는 muted 재생을 "사용자가 시작한 재생"으로 안 쳐서 unlock이 안 풀린다.
    // SILENT_WAV는 데이터 자체가 무음이라 음소거 없이 틀어도 소리가 안 난다.
    audio.src = SILENT_WAV;
    console.log('[tts] unlock 시도');
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlocked = true;
        console.log('[tts] unlock 성공');
      })
      .catch((e) => {
        // AbortError는 직후 startStt()→stop()의 pause()가 무음 재생을 끊어서 나는 것 —
        // 제스처 안에서 play()를 호출한 시점에 엘리먼트는 이미 활성화됐으므로 무해. 무시한다.
        if (e?.name === 'AbortError') return;
        console.warn('[tts] unlock 실패', e?.name, e?.message);
        setTtsStatus(`unlock 실패: ${e?.name ?? e}`);
      });
  }, []);

  const speak = useCallback((text: string, ttsUrl: string | null, options?: SpeakOptions) => {
    const mode = webBridge.isAvailable() ? 'native' : 'web';
    console.log('[tts] speak 호출 unlocked=', audioUnlocked, 'mode=', mode);
    setTtsStatus(`speak 호출됨 (${mode}, unlocked=${audioUnlocked})`);
    if (playNativeTts(text, ttsUrl ?? null)) {
      onEndRef.current = options?.onEnd;
      options?.onStart?.();
      return;
    }

    // 웹: 클라우드 TTS 오디오 재생. 실패하면 브라우저 음성합성으로 폴백.
    window.speechSynthesis?.cancel();

    const audio = getSharedAudio();
    audio.pause();
    audio.muted = false;
    audio.onplay = () => {
      const dur = Number.isFinite(audio.duration) ? audio.duration.toFixed(1) : '?';
      setTtsStatus(`재생 시작 dur=${dur}s muted=${audio.muted} vol=${audio.volume}`);
      options?.onStart?.(Number.isFinite(audio.duration) ? audio.duration * 1000 : undefined);
    };
    audio.onended = () => {
      clearTtsStatus();
      options?.onEnd?.();
    };
    audio.onerror = () => {
      console.warn('[tts] audio onerror', audio.error?.code, audio.error?.message);
      setTtsStatus(`audio onerror code=${audio.error?.code} (${mode})`);
      speakWithBrowser(text, options);
    };
    audio.src = `/api/tts?text=${encodeURIComponent(text)}`;
    audio
      .play()
      .then(() => {
        console.log('[tts] play 성공');
        // play()는 resolve됐지만 실제 소리가 나는지는 별개 — 1.2초 뒤 재생 진행 상태를 찍는다.
        // t(=currentTime)가 0에서 안 움직이면 시작 못 한 것, 움직이는데 안 들리면 출력/볼륨 문제.
        setTimeout(() => {
          if (audio.ended) return;
          const dur = Number.isFinite(audio.duration) ? audio.duration.toFixed(1) : '?';
          setTtsStatus(
            `재생중 t=${audio.currentTime.toFixed(2)} paused=${audio.paused} muted=${audio.muted} vol=${audio.volume} dur=${dur}s`,
          );
        }, 1200);
      })
      .catch((e) => {
        console.warn('[tts] play 실패', e?.name, e?.message);
        setTtsStatus(`play 실패: ${e?.name ?? e} (${mode}, unlocked=${audioUnlocked})`);
        speakWithBrowser(text, options);
      });
  }, []);

  const stop = useCallback(() => {
    stopNativeTts();
    if (sharedAudio) {
      sharedAudio.pause();
      sharedAudio.onended = null;
    }
    window.speechSynthesis?.cancel();
    onEndRef.current?.();
    onEndRef.current = undefined;
  }, []);

  // 재생 전에 미리 호출해 오디오를 HTTP 캐시에 데워둠 — 실제 speak 때 지연 없이 바로 재생
  const prefetch = useCallback((text: string) => {
    if (!text || webBridge.isAvailable()) return; // 네이티브는 자체 TTS라 불필요
    fetch(`/api/tts?text=${encodeURIComponent(text)}`).catch(() => {});
  }, []);

  return { speak, stop, prefetch, unlock };
}

// 클라우드 TTS 실패 시 브라우저 내장 음성합성으로 폴백
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
