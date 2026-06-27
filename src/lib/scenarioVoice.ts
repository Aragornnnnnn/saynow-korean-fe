// 시나리오별 대화 화자 보이스 결정 — 여성 화자 시나리오만 여성 보이스 사용
// (백엔드가 화자 성별 필드를 주면 이 파일만 그 값으로 교체)

// 상대(화자)가 여성인 시나리오 id
const FEMALE_SPEAKER_SCENARIOS = new Set([2]);

// /api/tts 의 voice 파라미터 값. 기본(남성)이면 undefined.
export function scenarioVoice(scenarioId: number): 'female' | undefined {
  return FEMALE_SPEAKER_SCENARIOS.has(scenarioId) ? 'female' : undefined;
}
