// 아이폰 등 실기기에서 콘솔/에러를 화면에 띄워 디버깅하기 위한 인앱 콘솔(eruda)
// ?debug=1 로 켜고 ?debug=0 으로 끔. 한 번 켜면 localStorage에 저장돼 SPA/새로고침 내내 유지.
// 일반 사용자에겐 로드되지 않음(동적 import라 debug일 때만 번들을 받아옴).
'use client';

import { useEffect } from 'react';

export function DebugConsole() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === '0') {
      localStorage.removeItem('debug');
      return;
    }
    if (params.has('debug')) localStorage.setItem('debug', '1');
    if (localStorage.getItem('debug') !== '1') return;

    import('eruda').then(({ default: eruda }) => {
      if (!eruda.get()) eruda.init();
    });
  }, []);

  return null;
}
