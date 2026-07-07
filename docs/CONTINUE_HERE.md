# 이어서 작업하기 (로컬에서 이어받는 시작점)

마지막 업데이트: 2026-07-07. 이 문서만 읽으면 지금까지 무엇을 했고, 왜 여기서
멈췄고, 다음에 뭘 해야 하는지 알 수 있도록 정리함.

## 프로젝트 개요

`docs/design-handoff/project/gym-routine.dc.html`(클로드 디자인 프로토타입)을
React 컴포넌트로 이식한 웨이트 트레이닝 루틴 앱. 화면 6개:

- `src/screens/Home.tsx` — 근육 타겟 카드(해부학 SVG) + 히어로 추천 루틴 +
  종목 목록(타임스탬프 딥링크 배지) + 개인 넛지 + 인기/콜드스타트 토글
- `src/screens/Explore.tsx` — 인체 실루엣 부위 태그 + 유형별(푸시/풀/레그/전신)
  카테고리 칩 + 필터된 루틴 목록
- `src/screens/RoutineDetail.tsx` — 번호 매긴 종목 목차 + 타임스탬프 딥링크
- `src/screens/Record.tsx` — done(초록 취소선)/active(세트 로그: 총볼륨·1RM·
  세트수)/todo(대기) 3가지 상태
- `src/screens/Profile.tsx` — 로그인/로그아웃 + 큐레이터 도구 진입 링크
- `src/screens/Curator.tsx` — 타임스탬프 태깅(±초 조정, 확정 토글)

인프라:
- `src/store/appStore.ts` (Zustand) — 화면 전환 + 인터랙션 상태/액션
- `src/store/authStore.ts` (Zustand) — Supabase Auth 세션
- `src/lib/supabase.ts` — Supabase 클라이언트(env 없으면 `null`로 안전하게 폴백)
- `src/lib/queries.ts` — Explore/RoutineDetail용 읽기 전용 쿼리 레이어
- `src/data/mockData.ts` — 아직 실 데이터로 안 옮긴 화면들의 목 데이터
- `supabase/migrations/`, `supabase/seed.sql` — DB 스키마 + 시드 데이터
- `src/index.css`에 `@theme`으로 디자인 토큰(accent `#e5484d`, card `#161618` 등),
  Archivo/JetBrains Mono 폰트

## 완료한 것

1. **화면 6개 포팅** — 프로토타입을 React로 이식. Playwright로 6개 화면 전부
   실제 클릭 내비게이션 + 스크린샷 검증 완료(콘솔 에러 없음, 레이아웃/색상/
   데이터 의도대로 렌더링).
2. **Explore 유형별 카테고리 필터** — 푸시/풀/레그/전신 칩에 독립 필터 연결.
   신체 부위 필터와 AND 조건으로 결합, 같은 칩 재클릭 시 해제.
3. **Supabase 연동 (Explore/RoutineDetail만)** — `routines.split_type` 컬럼
   추가 마이그레이션, `src/types/database.ts` 스키마 수동 작성, `queries.ts`
   쿼리 레이어, Explore/RoutineDetail을 mockData 대신 실제 Supabase 쿼리로
   교체, `appStore.selectedRoutineId`로 클릭한 루틴 추적.
   Home/Record/Curator/Profile은 의도적으로 mockData 유지 — Record가 쓰는
   `workouts`/`workout_sets`는 RLS가 로그인을 요구해서 인증 없이는 의미 있게
   연결 불가.
4. **PWA 아이콘** — Explore '푸시' 카테고리 아이콘의 바벨 글리프를 재사용해
   다크 배경(`#1a1a1a`) + 액센트 레드(`#e5484d`) 아이콘 세트 제작 (192/512/
   maskable-512/apple-touch/favicon), `vite.config.ts`·`index.html`에 연결.
5. **인증 (카카오 + 이메일 매직링크)** — `authStore.ts`(세션 구독, `sendMagicLink`/
   `signInWithKakao`/`signOut`), `Profile.tsx`에 로그인 폼(카카오 브랜드 버튼 +
   이메일 매직링크) 연결. 로그인 시 실제 유저 이메일 표시 + 로그아웃 동작.
   Record/Curator는 이번에도 mockData 유지 — 로그인은 연결됐지만 운동 기록을
   실제로 쓰는 코드는 아직 없음.

각 단계마다 `npx tsc -b --noEmit` / `npx eslint .` / `npm run build` 클린 확인,
Supabase 미설정 상태에서도 앱이 크래시 없이 동작하는 것 확인(env 없으면
`supabase` 클라이언트가 `null`로 폴백하도록 처리해둠).

## 지금 상태 — 로컬에서 마이그레이션까지 완료함

**2026-07-07 로컬 세션에서 아래를 전부 끝냄 (MCP로 직접 실행, SQL Editor 수동
작업 불필요했음):**

- 마이그레이션 3개(`0001`~`0003`) + `supabase/seed.sql` 전부 적용 완료.
  `routines` 7행, `exercises` 45행, `routine_items` 51행 확인.
- 보안 어드바이저(`get_advisors`) 클린 — RLS 관련 경고 없음.
- `.env.local` 생성 완료(로컬 파일, git에 없음 — 컴퓨터를 옮기면 다시 만들어야 함).
- `listExploreRoutines`/`getRoutineDetail` 쿼리를 실제 프로젝트에 직접 실행해
  응답 확인 — Explore/RoutineDetail이 진짜 데이터를 받아옴.
- `tsc -b --noEmit` / `eslint` / `npm run build` 전부 클린.

**아직 안 된 것 — 카카오 로그인 설정.** 카카오 개발자 콘솔 앱 등록 +
Supabase Provider 연결은 사용자 계정으로 직접 해야 하는 작업이라 미완료.
아래 "카카오 로그인 설정하기" 섹션 참고. 이메일 매직링크는 Supabase 프로젝트만
있으면 바로 동작하니 그걸로 먼저 테스트 가능.

**미리보기 도구가 이 프로젝트 폴더(futsal-app 세션에 스코프됨)로 dev 서버를
못 띄워서, 브라우저 시각 확인은 여전히 안 됨.** Node 스크립트로 쿼리 자체는
검증했지만 실제 화면 렌더링은 `npm run dev`로 직접 봐야 함.

## 로컬에서 이어서 진행하기

### 1) 저장소 받기

```bash
git checkout claude/continue-here-docs-vllt9h
git pull
npm install
```

### 2) 로컬 환경변수 설정

저장소 루트에 `.env.local`이 이미 없다면(새 컴퓨터라면) 새로 생성.
값은 Supabase 대시보드(`fwivqflsuskfqpjyoyqt` 프로젝트) Project Settings → API 에서 확인:

```
VITE_SUPABASE_URL=https://fwivqflsuskfqpjyoyqt.supabase.co
VITE_SUPABASE_ANON_KEY=<anon/publishable key>
```

(DB 비밀번호나 service_role 키는 필요 없음 — anon key만으로 충분한 공개
읽기 전용 연동 + 로그인.)

### 3) 확인 체크리스트

`npm run dev` 실행 후:

- [ ] **Explore** — 부위 태그(어깨/가슴/팔/등/복근/하체) 눌러서 실제 루틴이
      뜨는지, 유형별 칩(푸시/풀/레그/전신)과 조합 필터링이 되는지
- [ ] **RoutineDetail** — Explore에서 루틴 클릭 시 해당 루틴의 실제 종목
      목록·타임스탬프가 보이는지
- [ ] **내정보 로그인(이메일)** — 이메일 입력 → "이메일로 로그인 링크 받기" →
      실제 받은 편지함에서 링크 클릭 → 앱으로 돌아왔을 때 이메일/로그아웃
      버튼이 보이는지
- [ ] **내정보 로그인(카카오)** — 아래 "카카오 로그인 설정" 완료 후 "카카오로
      계속하기" 클릭 → 카카오 로그인 → 앱으로 복귀 시 세션이 잡히는지

## 카카오 로그인 설정하기

Supabase 프로젝트는 이미 연결돼 있음(위 "지금 상태" 참고). 카카오 쪽만 하면 됨.

1. [Kakao Developers](https://developers.kakao.com)에서 애플리케이션 생성
2. 앱 설정 → 앱 키에서 **REST API 키** 확인
3. 제품 설정 → 카카오 로그인 → 활성화 ON, **Redirect URI**에
   `https://fwivqflsuskfqpjyoyqt.supabase.co/auth/v1/callback` 등록
4. 카카오 로그인 → 보안 → **Client Secret** 코드 생성 후 "사용함"으로 활성화
5. Supabase 대시보드 → Authentication → Providers → Kakao 활성화, REST API
   키를 Client ID에, 4번 Client Secret을 입력 후 저장
6. (선택) 카카오 로그인 → 동의항목 → "카카오계정(이메일)" 동의 설정 — 이메일을
   못 받아오면 `session.user.email`이 비어서 Profile에 이메일이 안 보일 수
   있음. 카카오 정책상 이메일 제공엔 비즈니스 앱 전환이 필요할 수 있으니,
   안 되면 일단 이메일 매직링크로 테스트해도 됨.

## 다음 우선순위

로컬 검증이 끝나면 이어서:

1. **Record를 실제 Supabase 쓰기로 연결** — 이제 인증이 있으니 `workouts`/
   `workout_sets`에 실제 INSERT하도록 Record 화면을 옮길 차례.
2. **Home 실제 데이터화** — 근육 성장 카드·트렌딩 카운트를 Record 데이터가
   쌓이면 실제 집계로 바꿀 수 있음.
3. **Curator를 실제 데이터로** — 지금은 mockData의 타임스탬프만 조정. 실제
   `routine_items.timestamp_seconds`를 업데이트하도록 연결.

## 재개 방법

- **컴퓨터에서**: 이 레포 열고 위 "로컬에서 이어서 진행하기" 순서대로
- **폰/다른 기기에서 Claude Code on the web 세션으로**: `claude.ai/code` →
  `Hoon7148/gym-routine` 레포 선택 → 이 문서(`docs/CONTINUE_HERE.md`)를 먼저
  읽어달라고 요청. 단, Supabase 실동작 확인은 그 세션 환경도 `supabase.co`를
  막고 있을 수 있으니 위 "지금 상태" 섹션을 참고할 것.
