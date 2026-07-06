# 이어서 작업하기 (다음 세션 시작점)

## 지금까지 한 것

`docs/design-handoff/project/gym-routine.dc.html`(클로드 디자인 프로토타입)을
React 컴포넌트로 이식 완료. 6개 화면 전부 포팅됨:

- `src/screens/Home.tsx` — 근육 타겟 카드(해부학 SVG) + 히어로 추천 루틴 +
  종목 목록(타임스탬프 딥링크 배지) + 개인 넛지 + 인기/콜드스타트 토글
- `src/screens/Explore.tsx` — 인체 실루엣 부위 태그 + 유형별 카테고리 + 필터된 루틴 목록
- `src/screens/RoutineDetail.tsx` — 번호 매긴 종목 목차 + 타임스탬프 딥링크
- `src/screens/Record.tsx` — done(초록 취소선)/active(세트 로그: 총볼륨·1RM·세트수)/
  todo(대기) 3가지 상태
- `src/screens/Profile.tsx` — 내정보 + 큐레이터 도구 진입 링크
- `src/screens/Curator.tsx` — 타임스탬프 태깅(±초 조정, 확정 토글)

인프라:
- `src/store/appStore.ts` (Zustand) — 화면 전환 + 모든 인터랙션 상태/액션
- `src/data/mockData.ts` — 프로토타입의 시드 데이터 그대로 이식
- `src/index.css`에 `@theme`으로 디자인 토큰 등록 (accent `#e5484d`, card `#161618` 등),
  Archivo/JetBrains Mono 폰트 로드

## 검증한 것 / 못한 것

- ✅ `npx tsc -b --noEmit` 클린
- ✅ `npx eslint .` 클린
- ✅ `npm run build` 프로덕션 빌드 성공
- ✅ 로컬 vite 서버로 모든 스크린 모듈이 200으로 트랜스폼되는 것 확인 (curl)
- ✅ **브라우저 시각 검증 완료** (2026-07-06). Playwright + 로컬 Chromium으로
  `npm run dev` 띄우고 6개 화면(Home/Explore/RoutineDetail/Record/Profile/Curator)
  전부 실제 클릭 내비게이션으로 스크린샷 촬영, 콘솔 에러 없음(폰트 CDN 차단 제외)
  확인. 레이아웃/색상/한글 텍스트/데이터 모두 의도대로 렌더링됨.
  - ⚠️ 원본 `.dc.html` 프로토타입은 이 샌드박스에서 직접 열어 나란히 비교하지
    못함 — 그 프로토타입 런타임이 `unpkg.com`(React CDN)과 Google Fonts CDN을
    필요로 하는데, 이 환경의 네트워크 정책이 두 도메인 다 차단함
    (`$HTTPS_PROXY/__agentproxy/status`로 확인). 실물 비교가 필요하면 네트워크
    제약 없는 환경(로컬 PC 등)에서 두 파일을 나란히 열어야 함.

## 다음에 할 일 (우선순위 순)

1. **Explore 카테고리 칩** — 프로토타입처럼 지금도 장식용(클릭 안 됨). 실제로
   유형별 필터링 기능을 붙일지 결정.
2. **Supabase 연동** — 지금은 전부 `mockData.ts` 하드코딩. `C:\Users\dbwls\.claude\plans\harmonic-yawning-stream.md`에
   설계된 스키마(routines/exercises/workouts 등)를 아직 마이그레이션 안 함.
   로컬 `supabase start` → 마이그레이션 작성 → `mockData` 대신 실제 쿼리로 교체.
3. **PWA 아이콘** — `vite.config.ts`의 manifest에 아이콘 파일 경로가 없음
   (futsal-app 것 그대로 안 가져옴). 아이콘 세트 준비 필요.
4. **인증** — 로그인 없음. `준경`/아바타 이니셜이 하드코딩.

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 `npm run dev`
- **폰/다른 기기에서**: `claude.ai/code` → `Hoon7148/gym-routine` 레포 선택 →
  이 문서(`docs/CONTINUE_HERE.md`)를 먼저 읽어달라고 요청
