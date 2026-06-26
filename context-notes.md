# 컨텍스트 노트 — saynow-korean-fe

작업 중 내린 결정과 근거를 계속 덧붙인다.

## 2026-06-26 — 초기 결정

### 원본(saynow-fe) 파악
- monorepo: `apps/web`(Next.js 16) + `apps/mobile`(웹뷰 껍데기)
- 서비스 정체성: "외국인 상황 시뮬레이션으로 **영어 회화** 연습 + AI 피드백"
- 대화/AI 피드백 로직은 전부 **백엔드(saynow.p-e.kr)** 에 있음. FE는 `/api/*`를 백엔드로 프록시(`next.config.ts` rewrites)
- 기술: STT(Deepgram, `/api/stt/token` 서버 라우트), 소셜로그인(Google/Kakao), Amplitude, MSW 목업, zustand, react-query, tailwind4, shadcn

### 사용자 확정 사항
- **백엔드**: 한국어용 백엔드 별도 존재 → `NEXT_PUBLIC_API_BASE_URL`만 교체하면 대화 동작 (URL은 아직 미수신)
- **학습 대상**: 외국인의 한국어 회화 → **UI는 영어, 학습 콘텐츠는 한국어**
- **복사 범위**: `apps/web`만 가져와 **새 레포 루트로 평탄화** (mobile 제외)

### 복사 방식 결정
- `node_modules`, `.next`, `*.tsbuildinfo`, `bash.exe.stackdump` 제외
- `.env.local` / `.env.prod`(원본 시크릿)는 복사 안 함 → 새로 작성. 원본 .gitignore가 `.env*`(except `.env.example`) 차단하므로 시크릿 커밋 위험 없음. web 버전 `.gitignore`를 새 레포에 적용.
- 새 레포 기존 `.gitignore`는 `.env.prod`를 차단 안 해서 위험 → web 버전으로 덮어씀

### 주의 (Phase B 핵심)
- OAuth client ID/redirect는 saynow 도메인 전용 → 신규 OAuth 앱 + 새 도메인 redirect 필요.

## 2026-06-26 — Phase B 완료 후 결정

- **UI 영어화**: 5개 서브에이전트 병렬로 홈/온보딩/대화/피드백/마이/로그인/공용 컴포넌트 전환. 빌드(next build) 통과, /login 런타임 200 확인.
- **lint**: 기존 react-hooks 위반 15개 존재(원본 코드). 내 변경은 문자열뿐이라 surgical 원칙상 미수정. next build는 lint 무관하게 통과 → 배포 영향 없음.
- **STT/TTS**: ko-KR / Deepgram ko 로 전환 (conversation, useTts, stt-test).
- **mock 플립**: handlers.ts에서 aiQuestion=한국어, translatedQuestion=영어, 속마음·피드백 영어.
- **GitHub 푸시**: 사용자 선택으로 보류(로컬만). origin = Aragornnnnnn/saynow-korean-fe 이미 존재.
- **Amplitude**: 처음엔 원본 키 재사용으로 답했으나, 원본 지표와 섞이는 걸 사용자가 원치 않아 **철회**. 한국어용 **신규 프로젝트 키 대기 중**. .env.local의 키는 비워둠.
- **보류**: 백엔드 URL(미수신), OAuth 신규 앱, legalDocuments 본문 영어화, Vercel 배포(계정 인증 필요).
