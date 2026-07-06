-- ============================================================
-- gym-routine 초기 스키마
-- ============================================================
-- 두 세계로 구성:
--   · 큐레이션 세계 : athletes / videos / exercises / routines / routine_items
--                    (공개 읽기, service_role 만 쓰기 — RLS 는 0002 에서)
--   · 유저 세계     : workouts / workout_sets / saved_routines (본인만 R/W)
--
-- 설계 원칙:
--   · exercises 는 canonical 마스터 사전 → "인기 종목" 집계와 "지난 기록" 매칭의 근간.
--   · routine_items 는 종목+순서+타임스탬프만 담는 '뼈대'(무게·세트 없음).
--   · workout_sets 가 유저의 실제 기록(템플릿/인스턴스 분리).
--   · workout_sets.user_id 는 비정규화 → RLS 를 서브쿼리 없이 단순화 + 지난 기록 조회 최적화.
-- ============================================================

create extension if not exists pgcrypto;

-- ── 열거 타입 ──
create type body_part as enum
  ('chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'glutes', 'full_body');

create type routine_status as enum ('draft', 'published');


-- ============================================================
-- 큐레이션 세계
-- ============================================================

-- 선수 / 크리에이터
create table public.athletes (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  youtube_channel_url text,
  avatar_url          text,
  created_at          timestamptz not null default now()
);

-- 원본 유튜브 영상
create table public.videos (
  id               uuid primary key default gen_random_uuid(),
  youtube_id       text not null unique,
  athlete_id       uuid not null references public.athletes(id) on delete cascade,
  title            text not null,
  thumbnail_url    text,
  duration_seconds int,
  caption_lang     text,                        -- 자막 언어(ko/en/…) — 추출 소스 추적용
  created_at       timestamptz not null default now()
);

-- 마스터 종목 사전 (canonical). aliases 로 AI 추출 결과 매핑을 도움.
create table public.exercises (
  id         uuid primary key default gen_random_uuid(),
  name_ko    text not null,
  name_en    text,
  body_part  body_part not null,
  equipment  text,
  aliases    text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- 큐레이션된 루틴 (MVP: video 1:1)
create table public.routines (
  id           uuid primary key default gen_random_uuid(),
  video_id     uuid not null references public.videos(id) on delete cascade,
  title        text not null,
  body_part    body_part not null,
  status       routine_status not null default 'draft',
  is_featured  boolean not null default false,   -- 콜드스타트 폴백: 큐레이터 픽
  curator_id   uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at   timestamptz not null default now()
);

-- 루틴 안의 순서 있는 종목 + 타임스탬프 (⚠︎ 무게·세트 없음 — 뼈대만)
create table public.routine_items (
  id                uuid primary key default gen_random_uuid(),
  routine_id        uuid not null references public.routines(id) on delete cascade,
  exercise_id       uuid not null references public.exercises(id) on delete restrict,
  position          int not null,
  timestamp_seconds int,                          -- 영상 딥링크 지점(초)
  is_warmup         boolean not null default false,
  note              text,
  unique (routine_id, position)
);


-- ============================================================
-- 유저 세계
-- ============================================================

-- 루틴 수행 세션. row 생성 = "가져오기" = 트렌딩의 한 표. 완료는 completed_at 으로 구분.
create table public.workouts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  routine_id   uuid references public.routines(id) on delete set null,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- 실제 기록된 세트 (유저 인스턴스). user_id 는 비정규화(RLS/조회 최적화).
create table public.workout_sets (
  id           uuid primary key default gen_random_uuid(),
  workout_id   uuid not null references public.workouts(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  exercise_id  uuid not null references public.exercises(id) on delete restrict,
  set_number   int not null,
  weight_kg    numeric(6, 2),
  reps         int,
  is_completed boolean not null default false,
  created_at   timestamptz not null default now()
);

-- 북마크
create table public.saved_routines (
  user_id    uuid not null references auth.users(id) on delete cascade,
  routine_id uuid not null references public.routines(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, routine_id)
);


-- ============================================================
-- 인덱스 (집계·조회 최적화)
-- ============================================================
create index idx_videos_athlete            on public.videos (athlete_id);
create index idx_routines_body_part         on public.routines (body_part) where status = 'published';
create index idx_routines_featured          on public.routines (is_featured) where status = 'published';
create index idx_routine_items_routine      on public.routine_items (routine_id);
create index idx_routine_items_exercise     on public.routine_items (exercise_id);
create index idx_workouts_user              on public.workouts (user_id);
create index idx_workouts_routine_created   on public.workouts (routine_id, created_at);            -- 트렌딩
create index idx_workout_sets_workout       on public.workout_sets (workout_id);
create index idx_workout_sets_user_exercise on public.workout_sets (user_id, exercise_id, created_at desc); -- 지난 기록
