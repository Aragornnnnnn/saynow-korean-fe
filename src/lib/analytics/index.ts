// Amplitude track / identify 헬퍼 — 전체 앱에서 이 모듈만 import해서 사용
import * as amplitude from '@amplitude/unified';

export function track(eventName: string, properties?: Record<string, unknown>) {
  amplitude.track(eventName, properties);
}

export function identify(properties: Record<string, string | number | boolean>) {
  const obj = new amplitude.Identify();
  for (const [key, value] of Object.entries(properties)) {
    obj.set(key, value);
  }
  amplitude.identify(obj);
}

// 로그인된 유저를 Amplitude userId에 연결 — 기기/세션 넘어 동일 유저로 집계
export function setUserId(userId: string) {
  amplitude.setUserId(userId);
}

// 로그아웃/탈퇴 시 호출 — userId와 deviceId를 리셋해 다음 유저와 섞이지 않게 함
export function resetUser() {
  amplitude.reset();
}

export * from './events';
