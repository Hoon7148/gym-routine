# 이어서 작업하기 (로컬에서 이어받는 시작점)

마지막 업데이트: 2026-07-07. 이 문서만 읽으면 지금까지 무엇을 했고, 다음에
뭘 해야 하는지 알 수 있도록 정리함.

## 프로젝트 개요

`docs/design-handoff/project/gym-routine.dc.html`(클로드 디자인 프로토타입)을
React 컴포넌트로 이식한 웨이트 트레이닝 루틴 앱. 화면 6개 — **전부 실제
Supabase 데이터/쓰기로 연결 완료**:

- `src/screens/Home.tsx` — 추천 루틴/종목 목록(`getRoutineDetail`), 오늘
  인기 루틴·종목(트렌딩 RPC), 콜드스타트 폴백(큐레이터 픽). 근육 타겟
  카드만 **의도적으로 mock 유지** — `exercises.body_part`로는 전면/측면
  삼각근 같은 세부 근육 구분이 안 돼서 스키마 확장 없이는 실 데이터화 불가.
- `src/screens/Explore.tsx` — 실 데이터.
- `src/screens/RoutineDetail.tsx` — 실 데이터.
- `src/screens/Record.tsx` — `workouts`/`workout_sets`에 실제 INSERT.
- `src/screens/Profile.tsx` — 카카오 + 이메일 매직링크 로그인/로그아웃.
- `src/screens/Curator.tsx` — `routine_items.timestamp_seconds`에 실제 UPDATE.

두 화면 모두 "완료/확정" 체크는 **세션 전용 UI 상태**(새로고침하면 리셋)로
설계함 — 스키마에 그 개념을 담을 컬럼이 없어서, 실제로 중요한 데이터
(세트 기록/타임스탬프 값)만 영구 저장하고 완료 여부는 그때그때의 UI
편의로 처리.

## 인프라

- `src/store/appStore.ts` (Zustand) — 화면 전환 + 필터 상태만 남음
- `src/store/authStore.ts` (Zustand) — Supabase Auth 세션(카카오 OAuth,
  이메일 매직링크). `signInWithKakao`는 `scopes: "profile_nickname
  profile_image account_email"` 명시 — 콘솔 동의항목 승인 범위와 항상
  맞춰야 함(안 맞으면 KOE205로 로그인 자체가 막힘).
- `src/lib/supabase.ts` — Supabase 클라이언트(env 없으면 `null` 폴백)
- `src/lib/queries.ts` — 모든 화면의 읽기/쓰기 쿼리 레이어
- `src/data/mockData.ts` — `muscleCardDefs`(의도적 mock), Explore용
  `categories`/`bodyTagDefs`, Home 초기 폴백용 `curatorPicks`만 남음
- `supabase/migrations/0001~0006`, `supabase/seed.sql` — 전부 적용 완료
- `src/types/database.ts` — 손으로 작성한 Database 타입. **각 테이블에
  `Relationships: []`이 꼭 있어야 함** — 없으면 supabase-js가 select/insert
  타입을 `never`로 추론해서 멀쩡한 쿼리에서 타입 에러가 남. RPC 함수는
  `Functions`에 Args/Returns 시그니처를 직접 추가해야 `.rpc()` 타입이 잡힘.

## 지금 상태 — 기능적으로 완성, 실사용자 검증 진행 중

- Supabase 마이그레이션 6개 + 시드 전부 적용, 보안 어드바이저 클린.
- 카카오 로그인 + 이메일 매직링크 전부 동작 확인(실제 카카오 계정으로
  로그인 성공 확인함: `auth.users`에 provider=kakao 행 존재).
- **버그 수정 이력**: 실사용자 테스트 중 `workouts`가 같은 (user, routine)
  조합으로 중복 생성되는 경합 상태(React StrictMode의 effect 이중 실행)를
  발견 → `idx_workouts_one_open_per_routine` 부분 유니크 인덱스(0004)로
  DB 레벨 차단 + 코드에서 23505 위반 시 기존 행 재조회하도록 처리. 둘 다
  직접 검증함.
- Curator 쓰기 활성화를 위해 `routines.curator_id`를 실제 계정으로
  세팅하고 RLS 정책(0006)을 사용자가 Supabase SQL Editor에서 직접 실행함
  (이 세션 도중 Supabase MCP 연결이 끊겨서 마이그레이션 자동 적용이 안 됨 —
  같은 SQL이 `supabase/migrations/0006_curator_routine_items_write.sql`에
  파일로도 있음, 다음에 MCP 정상일 때 다른 환경에 적용하려면 이 파일 사용).
- 모든 신규 쿼리를 Node 스크립트 + 실제 프로젝트로 직접 실행해 응답 확인,
  RLS가 인증 없는 쓰기를 정확히 막는 것도 매번 검증함.

**여전히 안 된 것 — 브라우저 종단 간(end-to-end) 클릭 테스트.** 이
세션의 미리보기 도구가 다른 프로젝트(futsal-app)에 스코프돼 있어서
gym-routine 화면을 직접 못 열어봄. DB 레벨(쿼리 응답, RLS 거부)은 전부
검증했지만, 실제 브라우저에서 Curator 화면 열고 ±버튼 눌러서 타임스탬프가
Table Editor에 반영되는지는 아직 확인 안 됨.

## 확인 체크리스트 (다음에 브라우저에서 해볼 것)

`npm run dev` 실행 후:

- [ ] **Curator 실제 쓰기** — 내정보 → 큐레이터 도구 → 아무 종목 ±5/±1
      눌러보고 → Supabase Table Editor에서 `routine_items.timestamp_seconds`가
      바뀌는지 확인. 확인 체크(✓ 버튼)는 새로고침하면 풀리는 게 정상.
- [ ] **Home 트렌딩** — Record에서 세트를 더 추가한 뒤 홈으로 돌아와서
      "오늘 인기 루틴"/"트렌딩 종목" 숫자가 올라가는지
- [ ] **콜드스타트 전환** — 트렌딩 데이터가 거의 없을 때 자동으로
      "콜드스타트" 뷰(큐레이터 픽)로 전환되는지, 수동 토글도 되는지
- [ ] 기존 항목(Explore/RoutineDetail/Record/로그인)도 재확인

## 다음에 고려할 것 (선택, 급하지 않음)

1. **근육 타겟 카드 실 데이터화** — 하려면 `exercises`에 세부 근육 그룹
   컬럼을 추가하는 스키마 확장이 먼저 필요.
2. **"완료/확정" 상태 영구 저장** — 지금은 세션 전용. 필요하면 스키마에
   컬럼 추가 검토.
3. **Supabase MCP 재연결 확인** — 이 세션 도중 끊겼음. 다음 세션에서
   MCP로 직접 마이그레이션 적용이 되는지 먼저 확인하고, 안 되면
   Table/SQL Editor로 수동 진행.

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 `.env.local` 확인(없으면 아래 값으로 생성)
  → `npm install` → `npm run dev`
  ```
  VITE_SUPABASE_URL=https://fwivqflsuskfqpjyoyqt.supabase.co
  VITE_SUPABASE_ANON_KEY=<Supabase 대시보드 Project Settings → API 에서 확인>
  ```
- **폰/다른 기기에서 Claude Code on the web 세션으로**: `claude.ai/code` →
  `Hoon7148/gym-routine` 레포 선택 → 이 문서(`docs/CONTINUE_HERE.md`)를 먼저
  읽어달라고 요청.
