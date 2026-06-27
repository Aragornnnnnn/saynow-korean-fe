// TTS 실패 원인을 실기기 화면에 빨간 배너로 보여주기 위한 디버그 상태 스토어 (원인 확인 후 제거 예정)
let status = '';
const listeners = new Set<() => void>();

export function setTtsStatus(msg: string) {
  status = msg;
  listeners.forEach((l) => l());
}

export function clearTtsStatus() {
  setTtsStatus('');
}

export function getTtsStatus() {
  return status;
}

export function subscribeTtsStatus(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
