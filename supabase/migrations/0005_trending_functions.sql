-- ============================================================
-- 트렌딩 집계 함수 (SECURITY DEFINER)
-- ============================================================
-- workouts/workout_sets는 RLS로 본인 행만 조회 가능(개인 기록 보호).
-- 하지만 "오늘 인기 루틴/종목"은 전체 유저의 집계가 필요한 공개 정보라서,
-- 개별 행을 노출하지 않고 routine_id/exercise_id별 카운트만 반환하는
-- SECURITY DEFINER 함수로 우회한다.
-- ============================================================

create or replace function public.get_trending_routines(limit_count int default 3)
returns table (routine_id uuid, workout_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select w.routine_id, count(*) as workout_count
  from public.workouts w
  where w.routine_id is not null
    and w.started_at >= date_trunc('day', now())
  group by w.routine_id
  order by workout_count desc
  limit limit_count;
$$;

create or replace function public.get_trending_exercises(limit_count int default 6)
returns table (exercise_id uuid, set_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select ws.exercise_id, count(*) as set_count
  from public.workout_sets ws
  where ws.created_at >= date_trunc('day', now())
  group by ws.exercise_id
  order by set_count desc
  limit limit_count;
$$;

revoke all on function public.get_trending_routines(int) from public;
revoke all on function public.get_trending_exercises(int) from public;
grant execute on function public.get_trending_routines(int) to anon, authenticated;
grant execute on function public.get_trending_exercises(int) to anon, authenticated;
