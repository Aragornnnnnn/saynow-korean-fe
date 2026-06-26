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
- **원본 Amplitude 키(`d1babd...`) 재사용 금지** — 원본 saynow 마케팅 지표와 섞임. 한국어 프로젝트는 신규 Amplitude 프로젝트 필요.
- OAuth client ID/redirect는 saynow 도메인 전용 → 신규 OAuth 앱 + 새 도메인 redirect 필요.
