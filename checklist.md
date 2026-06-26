# 체크리스트 — saynow-korean-fe

외국인 대상 **한국어 회화 학습** 서비스. `saynow-fe/apps/web`(영어 회화 연습)을 가져와 전환 후 배포해 마케팅 지표 수집.

## Phase A — 웹 코드 복사 & 빌드 ✅
- [x] `apps/web` 소스를 새 레포 루트로 복사 (node_modules / .next / 시크릿 env 제외)
- [x] `.gitignore`를 web 버전으로 교체 (`.env*` 보호)
- [x] `npm install` (682 패키지)
- [x] `.env.local` 생성 (현재 localhost 플레이스홀더 — Phase B에서 실제 URL로)
- [x] `npm run build` 통과 확인
- [ ] `npm run dev` 로컬 구동 확인 (백엔드 URL 받은 뒤)
- [x] 초기 커밋 (646dfed)

## Phase B — 한국어 학습으로 전환
- [x] UI 카피 영어화 (외국인 학습자 대상) — 홈/온보딩/대화/피드백/마이/로그인/공용
- [x] 피드백 프레이밍 플립 (원어민=한국어 기준)
- [x] STT/TTS 언어 ko-KR / Deepgram ko 전환
- [x] mock 데이터 한국어 회화로 플립 (handlers.ts)
- [x] 메타데이터/OG/lang 한국어 학습용으로 (브랜드명 Landit 유지)
- [ ] `NEXT_PUBLIC_API_BASE_URL` → 한국어용 백엔드로 교체 (URL 대기 중)
- [ ] **Amplitude 신규 프로젝트 키** 적용 (원본 지표와 분리 — 마케팅 지표 핵심)
- [ ] OAuth(Google/Kakao) 신규 앱/redirect URI 재설정
- [ ] 약관/개인정보 본문(legalDocuments.ts) 영어화 — 법무 검토 필요, 보류
- [ ] (잔여) stt/token 라우트 에러 문구, analytics/events.ts 점검

## Phase C — 배포 & 지표
- [ ] Vercel 배포 (또는 사용자 지정 호스팅)
- [ ] Amplitude 이벤트 동작 확인
- [ ] Meta Ads / 광고 픽셀 연결 (선택)
- [ ] 마케팅 퍼널 지표 대시보드 확인
