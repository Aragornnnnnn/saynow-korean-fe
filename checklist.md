# 체크리스트 — saynow-korean-fe

외국인 대상 **한국어 회화 학습** 서비스. `saynow-fe/apps/web`(영어 회화 연습)을 가져와 전환 후 배포해 마케팅 지표 수집.

## Phase A — 웹 코드 복사 & 빌드
- [ ] `apps/web` 소스를 새 레포 루트로 복사 (node_modules / .next / 시크릿 env 제외)
- [ ] `.gitignore`를 web 버전으로 교체 (`.env*` 보호)
- [ ] `npm install`
- [ ] `.env.local` 생성 (한국어 백엔드 URL로)
- [ ] `npm run build` 통과 확인
- [ ] `npm run dev` 로컬 구동 확인
- [ ] 초기 커밋

## Phase B — 한국어 학습으로 전환
- [ ] `NEXT_PUBLIC_API_BASE_URL` → 한국어용 백엔드로 교체 (URL 확인 필요)
- [ ] **Amplitude 신규 프로젝트 키** 적용 (원본 지표와 분리 — 마케팅 지표 핵심)
- [ ] OAuth(Google/Kakao) 신규 앱/redirect URI 재설정
- [ ] UI 카피 영어화 (외국인 학습자 대상)
- [ ] 시나리오/콘텐츠 한국어 회화로 전환 (`docs/scenarios.json` 참고)
- [ ] 브랜딩(서비스명/로고/메타태그) 교체
- [ ] 약관/개인정보 페이지 갱신

## Phase C — 배포 & 지표
- [ ] Vercel 배포 (또는 사용자 지정 호스팅)
- [ ] Amplitude 이벤트 동작 확인
- [ ] Meta Ads / 광고 픽셀 연결 (선택)
- [ ] 마케팅 퍼널 지표 대시보드 확인
