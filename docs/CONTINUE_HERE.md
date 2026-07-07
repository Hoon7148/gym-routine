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
   - **2026-07-07 업데이트**: 사용자가 `gym-routine` Supabase 프로젝트를 만들고
     Project URL/anon key를 줘서 이 세션에서 `.env.local`(git에 안 올라감,
     로컬 전용)에 설정하고 Explore 화면으로 실제 요청이 나가는 것까지 확인함.
     **다만 마이그레이션/seed.sql은 아직 실행 안 함** — 사용자가 아직 SQL
     Editor에서 안 돌렸다고 확인(아래 "Supabase 프로젝트 연결하기" 3번 필요).
   - ⚠️ **이 샌드박스 환경은 `supabase.co`로 나가는 아웃바운드 네트워크 자체가
     조직 정책으로 차단됨**(curl/브라우저 둘 다 `ERR_TUNNEL_CONNECTION_FAILED`,
     프록시 상태(`$HTTPS_PROXY/__agentproxy/status`)의 `recentRelayFailures`에
     `<project-ref>.supabase.co:443` 403 거부 기록 확인). 즉 이 환경에서는
     실제 데이터 연동을 절대 검증할 수 없음 — **사용자 컴퓨터에서 로컬로
     테스트하는 게 유일한 방법**(아래 "로컬 컴퓨터에서 테스트하기" 참고).
     다음 세션에서도 이 환경 그대로면 똑같이 막힐 것이므로 재시도하지 말 것.
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
3. ~~**PWA 아이콘**~~ — 완료 (2026-07-06). Explore 화면 '푸시' 카테고리 아이콘의
   바벨 글리프를 재사용해 다크 배경(`#1a1a1a`) + 액센트 레드(`#e5484d`) 아이콘
   제작. `public/`에 `pwa-192x192.png`, `pwa-512x512.png`,
   `pwa-maskable-512x512.png`(safe-zone 계산해서 글리프 배치), `apple-touch-icon.png`,
   `favicon.png` 추가. `vite.config.ts`의 `manifest.icons` + `includeAssets`,
   `index.html`의 favicon/apple-touch-icon `<link>` 연결. 빌드 후
   `dist/manifest.webmanifest`에 아이콘 3종 정상 포함 확인, Playwright로 favicon
   200 응답(404 없음) 확인.
4. ~~**인증**~~ — 카카오 로그인 + 이메일 매직링크 병행으로 완료 (2026-07-07).
   - 완료: `src/store/authStore.ts`(Supabase Auth 세션 구독 Zustand 스토어,
     `sendMagicLink`/`signInWithKakao`/`signOut`). `Profile.tsx`에 로그인
     폼(카카오 브랜드 버튼 + "또는" 구분선 + 이메일 입력) 연결 — 로그인 상태면
     실제 유저 이메일 표시 + 로그아웃 버튼 동작, 로그아웃 상태면 로그인 폼
     표시(로그아웃 행은 숨김).
   - 의도적으로 보류: Record/Curator/Home은 이번에도 `mockData` 유지. 로그인은
     연결됐지만 `workouts`/`workout_sets`에 실제로 쓰는 코드는 아직 없음 —
     그건 다음 라운드.
   - `npx tsc -b --noEmit` / `npx eslint .` / `npm run build` 모두 클린.
     Playwright로 Supabase 미설정 상태에서 로그인 폼(카카오 버튼 포함)이
     크래시 없이 렌더되고, 두 로그인 방식 모두 "Supabase가 아직 설정되지
     않았어요" 에러 메시지가 깨지지 않고 표시되는 것 확인.
   - **2026-07-07 기준 Supabase 프로젝트가 아직 연결 안 됨** — 저장소에
     `.env.local` 없음, 이 세션 환경변수에도 `VITE_SUPABASE_*` 없음(직접 확인).
     카카오 로그인은 Supabase 프로젝트 + 카카오 개발자 콘솔 앱 둘 다 있어야
     실제로 동작 — 아래 "Supabase 프로젝트 연결하기"와 "카카오 로그인 설정하기"
     둘 다 필요. **실제 로그인은 아직 전혀 테스트 못 함.**
5. **Record를 실제 Supabase 쓰기로 연결** — 이제 인증이 있으니 `workouts`/
   `workout_sets`에 실제 INSERT하도록 Record 화면을 옮길 차례. Home의 근육
   성장 카드·트렌딩 카운트도 이 데이터가 쌓이면 실제 집계로 바꿀 수 있음.

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
6. 내정보 화면에서 이메일 입력 후 "이메일로 로그인 링크 받기" → 실제 받은
   편지함에서 로그인 링크 클릭 → 앱으로 돌아왔을 때 세션이 잡혀서 이메일과
   로그아웃 버튼이 보이는지 확인.

## 로컬 컴퓨터에서 테스트하기 (사용자가 할 일)

이 샌드박스는 `supabase.co`를 차단하기 때문에, Supabase 연동/로그인 실동작
확인은 본인 컴퓨터에서 해야 함.

1. `git checkout claude/continue-here-docs-vllt9h && git pull`
2. `npm install`
3. 저장소 루트에 `.env.local` 생성(git에 커밋 안 됨, 컴퓨터마다 직접 만들어야
   함) — 값은 `.env.example` 형식대로, Supabase 대시보드 Project Settings →
   API 에서 확인한 실제 Project URL/anon key로 채움
4. `npm run dev` → Explore/RoutineDetail/내정보(로그인) 순서로 확인

## 카카오 로그인 설정하기 (사용자가 할 일)

카카오 로그인은 Supabase 프로젝트 연결이 먼저 되어 있어야 함(위 단계 완료 후 진행).

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 생성
2. 앱 설정 → 앱 키에서 **REST API 키** 확인
3. 제품 설정 → 카카오 로그인 → 활성화 ON, **Redirect URI**에
   `https://<project-ref>.supabase.co/auth/v1/callback` 등록
   (`<project-ref>`는 Supabase 프로젝트 URL의 서브도메인 부분)
4. 카카오 로그인 → 보안 → **Client Secret** 코드 생성 후 "사용함"으로 활성화
5. Supabase 대시보드 → Authentication → Providers → Kakao 찾아서 활성화,
   REST API 키를 Client ID에, 4번에서 만든 Client Secret을 입력 후 저장
6. (선택) 카카오 로그인 → 동의항목에서 "카카오계정(이메일)" 동의 항목 설정 —
   이메일을 못 받아오면 `session.user.email`이 비어서 Profile 화면에 이메일
   대신 빈 값이 보일 수 있음. 카카오 정책상 이메일 제공엔 비즈니스 앱 전환이
   필요할 수 있으니, 안 되면 일단 이메일 매직링크로 테스트해도 됨.
7. `npm run dev` → 내정보 → "카카오로 계속하기" 클릭 → 카카오 로그인 페이지로
   리디렉션되는지, 로그인 후 앱으로 돌아와 세션이 잡히는지 확인.

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 `npm run dev`
- **폰/다른 기기에서**: `claude.ai/code` → `Hoon7148/gym-routine` 레포 선택 →
  이 문서(`docs/CONTINUE_HERE.md`)를 먼저 읽어달라고 요청
