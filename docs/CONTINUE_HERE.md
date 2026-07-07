# 이어서 작업하기 (로컬에서 이어받는 시작점)

마지막 업데이트: 2026-07-07. 이 문서만 읽으면 지금까지 무엇을 했고, 다음에
뭘 해야 하는지 알 수 있도록 정리함.

## 프로젝트 개요

`docs/design-handoff/project/gym-routine.dc.html`(클로드 디자인 프로토타입)을
React 컴포넌트로 이식한 웨이트 트레이닝 루틴 앱. 화면 6개:

- `src/screens/Home.tsx` — 근육 타겟 카드(해부학 SVG) + 히어로 추천 루틴 +
  종목 목록(타임스탬프 딥링크 배지) + 개인 넛지 + 인기/콜드스타트 토글.
  **아직 mockData** (`homeExerciseDefs`, `muscleCardDefs`, `trendRoutines` 등).
- `src/screens/Explore.tsx` — 인체 실루엣 부위 태그 + 유형별(푸시/풀/레그/전신)
  카테고리 칩 + 필터된 루틴 목록. **실 Supabase 데이터.**
- `src/screens/RoutineDetail.tsx` — 번호 매긴 종목 목차 + 타임스탬프 딥링크.
  **실 Supabase 데이터.**
- `src/screens/Record.tsx` — done(초록 취소선)/active(세트 로그: 총볼륨·1RM·
  세트수)/todo(대기) 3가지 상태. **실 Supabase 쓰기** (`workouts`/`workout_sets`
  실제 INSERT). 로그인 안 했으면 "로그인이 필요해요" 표시.
- `src/screens/Profile.tsx` — 로그인/로그아웃(카카오 + 이메일 매직링크) +
  큐레이터 도구 진입 링크. **실 Supabase Auth.**
- `src/screens/Curator.tsx` — 타임스탬프 태깅(±초 조정, 확정 토글).
  **아직 mockData** (`initialCurator`).

인프라:
- `src/store/appStore.ts` (Zustand) — 화면 전환 + 인터랙션 상태/액션
- `src/store/authStore.ts` (Zustand) — Supabase Auth 세션(카카오 OAuth,
  이메일 매직링크). `signInWithKakao`는 `scopes: "profile_nickname
  profile_image account_email"`로 명시적 스코프 지정 — 카카오 콘솔 동의항목에서
  승인 안 된 스코프를 요청하면 KOE205로 로그인 자체가 막히니, 동의항목을
  바꾸면 이 스코프 문자열도 맞춰 바꿔야 함.
- `src/lib/supabase.ts` — Supabase 클라이언트(env 없으면 `null`로 안전하게 폴백)
- `src/lib/queries.ts` — Explore/RoutineDetail 읽기 쿼리 + Record용
  `getOrCreateWorkout`/`getWorkoutExercises`/`insertWorkoutSet` 쓰기 함수
- `src/data/mockData.ts` — Home/Curator용 목 데이터만 남음
- `supabase/migrations/`, `supabase/seed.sql` — DB 스키마 + 시드 데이터
  (실행 완료, 아래 "지금 상태" 참고)
- `src/types/database.ts` — 손으로 작성한 Database 타입. 각 테이블에
  `Relationships: []`이 꼭 있어야 함 — 없으면 supabase-js가 select/insert
  타입을 `never`로 추론해서 멀쩡한 쿼리에서 타입 에러가 남.
- `src/index.css`에 `@theme`으로 디자인 토큰(accent `#e5484d`, card `#161618` 등),
  Archivo/JetBrains Mono 폰트

## 지금 상태 — Supabase 완전 연결됨

- **마이그레이션 3개 + 시드 완료** (`routines` 7행, `exercises` 45행,
  `routine_items` 51행). 보안 어드바이저 클린.
- **카카오 로그인 완료.** REST API 키는 카카오 콘솔 "앱 → 플랫폼 키 →
  REST API 키" 카드 안의 "클라이언트 시크릿" 탭에서 발급(왼쪽 사이드바에
  "카카오 로그인 → 보안" 탭은 이제 없음 — UI가 바뀌어서 이 경로로 옮겨짐).
  Supabase Authentication → Providers → Kakao에 REST API 키(Client ID)와
  Client Secret 저장 완료. 동의항목은 닉네임/프로필사진/카카오계정(이메일)
  모두 승인됨.
- **이메일 매직링크도 동작.**
- **Record 화면이 실제로 `workouts`/`workout_sets`에 씀.** RLS가
  `user_id = auth.uid()`를 요구해서 로그인 세션 없이는 쓰기 자체가 막힘
  (Node 스크립트로 익명 키 INSERT 시도 → 정상적으로 거부되는 것 확인함).
  "종목 완료"/"진행 중" 상태는 DB에 저장하지 않고 화면 세션 동안만 유지되는
  **세션 전용 UI 상태**임 (새로고침하면 리셋됨) — 실제로 중요한 무게·횟수
  데이터만 영구 저장됨. 스키마에 "종목 완료" 개념이 없어서 이렇게 설계함
  (자세한 이유는 git log의 "Record 실제 Supabase 쓰기 연결" 커밋 참고).

**여전히 안 된 것 — 브라우저 시각 확인.** 미리보기 도구가 이 세션에서 다른
프로젝트(futsal-app)에 스코프돼 있어서 gym-routine의 실제 렌더링을 못 봄.
DB 읽기/쓰기 자체는 Node 스크립트 + RLS 거부 테스트로 검증했지만, 로그인
→ Record 흐름을 실제 브라우저로 클릭까지 해본 적은 없음.

## 확인 체크리스트 (다음에 브라우저에서 해볼 것)

`npm run dev` 실행 후:

- [ ] **내정보 로그인(카카오)** — "카카오로 계속하기" → 카카오 로그인 →
      복귀 시 이메일 보이는지
- [ ] **Record 실제 쓰기** — 로그인 후 홈에서 "운동 시작" → Record 화면에서
      "탭하여 추가"로 세트 추가 → Supabase Table Editor에서 `workout_sets`에
      실제 행이 생기는지 확인 → 새로고침해도 추가한 세트가 남아있는지
      (단, "종목 완료" 상태는 새로고침하면 초기화되는 게 정상 — 위 참고)
- [ ] **Explore / RoutineDetail** — 기존대로 정상 동작하는지 재확인

## 다음 우선순위

1. **Home 실제 데이터화** — 근육 성장 카드·트렌딩 카운트를 `workout_sets`
   집계로 교체. 지금은 `mockData.homeExerciseDefs`/`muscleCardDefs` 등 사용.
2. **Curator를 실제 데이터로** — 지금은 mockData의 타임스탬프만 조정. 실제
   `routine_items.timestamp_seconds`를 업데이트하도록 연결.
3. (선택) **"종목 완료" 상태 영구 저장** — 지금은 세션 전용이라 새로고침하면
   풀림. 필요하면 `workout_sets`에 상태 컬럼을 추가하거나, "이 운동의 모든
   세트가 완료됨"을 별도로 표시하는 방법을 설계해야 함.

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 `.env.local`이 있는지 확인(없으면 아래 값으로
  생성) → `npm install` → `npm run dev`
  ```
  VITE_SUPABASE_URL=https://fwivqflsuskfqpjyoyqt.supabase.co
  VITE_SUPABASE_ANON_KEY=<Supabase 대시보드 Project Settings → API 에서 확인>
  ```
- **폰/다른 기기에서 Claude Code on the web 세션으로**: `claude.ai/code` →
  `Hoon7148/gym-routine` 레포 선택 → 이 문서(`docs/CONTINUE_HERE.md`)를 먼저
  읽어달라고 요청.
