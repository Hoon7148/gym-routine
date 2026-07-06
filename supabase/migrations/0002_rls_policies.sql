-- ============================================================
-- gym-routine RLS 정책
-- ============================================================
-- 큐레이션 세계는 공개 읽기 / 쓰기는 service_role 전용(정책 없음 → RLS 가 anon·authenticated 쓰기 차단).
--   MVP 는 단일 큐레이터이므로 관리 스크립트/툴에서 service_role 키로 씀.
-- 유저 세계는 본인 행만 R/W (user_id = auth.uid()).
-- ============================================================


-- ============================================================
-- 큐레이션 세계 — 공개 읽기
-- ============================================================

-- athletes / videos / exercises : 참조 데이터 → 전체 공개 SELECT
alter table public.athletes  enable row level security;
alter table public.videos    enable row level security;
alter table public.exercises enable row level security;

create policy "athletes 공개 읽기"  on public.athletes  for select using (true);
create policy "videos 공개 읽기"    on public.videos    for select using (true);
create policy "exercises 공개 읽기" on public.exercises for select using (true);

grant select on public.athletes, public.videos, public.exercises to anon, authenticated;

-- routines : 발행된 것만 공개
alter table public.routines enable row level security;

create policy "발행된 루틴만 공개 읽기"
  on public.routines for select
  using (status = 'published');

grant select on public.routines to anon, authenticated;

-- routine_items : 부모 루틴이 발행된 경우에만 읽힘
alter table public.routine_items enable row level security;

create policy "발행된 루틴의 항목만 공개 읽기"
  on public.routine_items for select
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.status = 'published'
    )
  );

grant select on public.routine_items to anon, authenticated;


-- ============================================================
-- 유저 세계 — 본인 행만 R/W
-- ============================================================

-- workouts
alter table public.workouts enable row level security;

create policy "본인 workouts 조회" on public.workouts for select using (user_id = auth.uid());
create policy "본인 workouts 생성" on public.workouts for insert with check (user_id = auth.uid());
create policy "본인 workouts 수정" on public.workouts for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "본인 workouts 삭제" on public.workouts for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.workouts to authenticated;

-- workout_sets
alter table public.workout_sets enable row level security;

create policy "본인 workout_sets 조회" on public.workout_sets for select using (user_id = auth.uid());
create policy "본인 workout_sets 생성" on public.workout_sets for insert with check (user_id = auth.uid());
create policy "본인 workout_sets 수정" on public.workout_sets for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "본인 workout_sets 삭제" on public.workout_sets for delete using (user_id = auth.uid());

grant select, insert, update, delete on public.workout_sets to authenticated;

-- saved_routines
alter table public.saved_routines enable row level security;

create policy "본인 saved_routines 조회" on public.saved_routines for select using (user_id = auth.uid());
create policy "본인 saved_routines 생성" on public.saved_routines for insert with check (user_id = auth.uid());
create policy "본인 saved_routines 삭제" on public.saved_routines for delete using (user_id = auth.uid());

grant select, insert, delete on public.saved_routines to authenticated;
