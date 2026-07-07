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

1. ~~**Explore 카테고리 칩**~~ — 완료 (2026-07-06). `유형별` 칩(푸시/풀/레그/전신)에
   독립 필터 연결. `RoutineListing.category` 필드 추가, `appStore`에
   `selectedCategory`/`selectCategory` 추가. 신체 부위 필터와 AND 조건으로
   결합되고, 같은 칩을 다시 누르면 해제됨(null = 전체). 각 루틴의 category는
   PPL(push/pull/leg) 관례로 매핑(가슴·어깨→푸시, 등→풀, 하체→레그,
   팔/복근처럼 애매한 건 전신). Playwright로 조합 필터링 동작 확인 완료.
2. ~~**Supabase 연동**~~ — Explore/RoutineDetail만 부분 완료 (2026-07-06).
   이 샌드박스는 Docker 데몬 권한이 없어 `supabase start`(로컬 스택)를 못 띄우고,
   사용자 계정으로 원격 프로젝트를 새로 만들어야 해서 아직 URL/anon key 연결
   전임. 그때까지는 아래 "Supabase 프로젝트 연결하기" 대로 세팅하면 됨.
   - 완료: `routines.split_type` 컬럼 추가(`0003_routine_split_type.sql`),
     `src/types/database.ts` 스키마에 맞게 수동 작성, `src/lib/queries.ts`
     쿼리 레이어, Explore/RoutineDetail을 실제 Supabase 쿼리로 교체,
     `supabase/seed.sql`(mockData 콘텐츠를 실제 행으로), `appStore`에
     `selectedRoutineId` 추가(어떤 루틴을 클릭했는지 추적).
   - 의도적으로 보류: Home/Record/Curator/Profile은 `mockData` 유지. Record가
     쓰는 `workouts`/`workout_sets`는 RLS가 `auth.uid()`를 요구해서 인증(4번)
     없이는 의미 있게 연결 불가. Home의 근육 성장 카드·트렌딩 카운트도 실제
     유저 기록 집계라 동일한 이유로 보류.
   - env 변수가 없을 때 `createClient`가 즉시 throw해서 앱 전체가 하얗게
     깨지는 버그를 발견해 수정함(`src/lib/supabase.ts`, null로 폴백) — 지금
     상태(Supabase 미설정)에서도 앱은 정상 로드되고 Explore는 "0개"로 표시됨.
   - `npx tsc -b --noEmit` / `npx eslint .` / `npm run build` 모두 클린.
     Playwright로 env 미설정 상태에서 크래시 없음, Home 정상 렌더 확인.
     **실제 Supabase 프로젝트에 대고는 아직 테스트 못 함** — 세팅 후 확인 필요.
3. **PWA 아이콘** — `vite.config.ts`의 manifest에 아이콘 파일 경로가 없음
   (futsal-app 것 그대로 안 가져옴). 아이콘 세트 준비 필요.
4. **인증** — 로그인 없음. `준경`/아바타 이니셜이 하드코딩. 이게 있어야 Record/
   Curator/Profile도 Supabase로 옮길 수 있음.

## Supabase 프로젝트 연결하기 (사용자가 할 일)

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. Project Settings → API 에서 Project URL과 anon key 확인
3. Supabase 대시보드의 SQL Editor에 아래 순서로 붙여넣어 실행:
   `supabase/migrations/0001_initial_schema.sql` →
   `supabase/migrations/0002_rls_policies.sql` →
   `supabase/migrations/0003_routine_split_type.sql` → `supabase/seed.sql`
4. 저장소 루트에 `.env.local` 생성(`.env.example` 참고):
   ```
   VITE_SUPABASE_URL=<Project URL>
   VITE_SUPABASE_ANON_KEY=<anon key>
   ```
5. `npm run dev` → Explore에서 부위/유형 필터 눌러보고 실제 루틴이 뜨는지,
   루틴 클릭 시 RoutineDetail이 해당 루틴의 실제 종목 목록을 보여주는지 확인.
   (DB 비밀번호나 service_role 키는 필요 없음 — anon key만으로 충분한 공개
   읽기 전용 연동.)

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 `npm run dev`
- **폰/다른 기기에서**: `claude.ai/code` → `Hoon7148/gym-routine` 레포 선택 →
  이 문서(`docs/CONTINUE_HERE.md`)를 먼저 읽어달라고 요청
