# gym-routine

선수 유튜브 루틴의 **뼈대(종목 + 순서)**만 큐레이션해 보여주고, 디테일(세트·무게·폼)은
영상 딥링크로 유도하는 운동 앱. 큐레이션 + 개인 기록을 결합하고, "가져오기" 이벤트를
집계해 트렌딩(오늘 많이 담긴 루틴 / 인기 종목)을 도출한다.

## 스택

React 19 · Vite · TypeScript · Tailwind v4 · Supabase(RLS) · Zustand · PWA

## 개발 셋업

```bash
npm install

# 로컬 Supabase 스택 (Docker 필요)
supabase init          # 최초 1회 (기존 supabase/migrations 는 유지됨)
supabase start         # 출력의 API URL / anon key 확인
supabase db reset      # 마이그레이션(0001, 0002) 적용

# 환경변수
cp .env.example .env   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 를 supabase start 출력값으로 채움

npm run db:types       # DB 스키마 → src/types/database.ts 생성
npm run dev
```

## 데이터 모델

- **큐레이션 세계** (공개 읽기 / service_role 쓰기): `athletes` · `videos` · `exercises`(마스터 종목 사전) ·
  `routines` · `routine_items`(무게 없는 뼈대 + 타임스탬프)
- **유저 세계** (본인만 R/W): `workouts`(가져오기 = 트렌딩 한 표) · `workout_sets`(실제 기록) ·
  `saved_routines`

마이그레이션: [`supabase/migrations/`](supabase/migrations/)

## 원격 배포

배포 시 Supabase `oeroum-fm` 계정(활성 프로젝트 자리 여유)에 원격 프로젝트를 생성해
`supabase link` 후 `supabase db push`.
