# 체크리스트 — saynow-korean-fe

외국인 대상 **한국어 회화 학습** 서비스. `saynow-fe/apps/web`(영어 회화 연습)을 가져와 전환 후 배포해 마케팅 지표 수집.

## Phase A — 웹 코드 복사 & 빌드 ✅
- [x] `apps/web` 소스를 새 레포 루트로 복사 (node_modules / .next / 시크릿 env 제외)
- [x] `.gitignore`를 web 버전으로 교체 (`.env*` 보호)
- [x] `npm install` (682 패키지)
- [x] `.env.local` 생성 (현재 localhost 플레이스홀더 — Phase B에서 실제 URL로)
- [x] `npm run build` 통과 확인
- [x] `npm run dev` 로컬 구동 확인 (MSW 목업 + 콘솔 인증 시드로 전체 흐름 동작 확인)
- [x] 초기 커밋 (646dfed)

## Phase B — 한국어 학습으로 전환 (코드 전환 ✅)
- [x] UI 카피 영어화 (외국인 학습자 대상) — 홈/온보딩/대화/피드백/마이/로그인/공용
- [x] 피드백 프레이밍 플립 (원어민=한국어 기준)
- [x] STT/TTS 언어 ko-KR / Deepgram ko 전환
- [x] mock 데이터 한국어 회화로 플립 (handlers.ts)
- [x] 메타데이터/OG/lang 한국어 학습용으로 (브랜드명 Landit 유지)

## Phase C — 실서비스 연결 (사용자 값/계정 필요)
- [ ] **Amplitude 신규 키** → `.env.local` + Vercel env  〔너한테 받을 것 · 지표 핵심〕
- [ ] **한국어 백엔드 URL** → `NEXT_PUBLIC_API_BASE_URL` 교체 (목업→실서버)  〔너한테 받을 것〕
- [ ] **OAuth 신규 앱**(Google/Kakao) → client id/secret + 새 도메인 redirect URI  〔너한테 받을 것〕
- [ ] 약관/개인정보 본문(legalDocuments.ts) 영어화 — 법무 검토 필요, 보류
- [ ] (잔여·사소) stt/token 라우트 에러 문구, analytics/events.ts 점검

## Phase D — 배포 & 마케팅 지표
- [ ] GitHub origin 푸시 (현재 보류 — 로컬만)
- [ ] Vercel 레포 import + 빌드 (next build)
- [ ] Vercel env 설정 (위 키들)
- [ ] 배포 후 Amplitude 이벤트 수집 확인
- [ ] Meta Ads / 광고 픽셀 연결 (선택, `docs/meta-ads-setup.md` 참고)
- [ ] 마케팅 퍼널 지표 대시보드 확인
