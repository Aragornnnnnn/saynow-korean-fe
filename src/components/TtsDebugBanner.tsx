// TTS 실패 상태를 화면 최상단에 빨간 줄로 표시하는 디버그 배너 (실기기 디버깅용, 추후 제거)
'use client';

import { useSyncExternalStore } from 'react';
import { getTtsStatus, subscribeTtsStatus, clearTtsStatus } from '@/lib/ttsDebug';

export function TtsDebugBanner() {
  const status = useSyncExternalStore(subscribeTtsStatus, getTtsStatus, () => '');
  if (!status) return null;
  return (
    <div
      onClick={clearTtsStatus}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#dc2626',
        color: '#fff',
        font: '12px/1.4 monospace',
        padding: '10px 12px',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      {status}
      {'\n'}(탭하면 닫힘)
    </div>
  );
}
