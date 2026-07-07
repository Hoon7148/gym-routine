-- ============================================================
-- workouts: (user, routine)당 진행 중(completed_at null) 행 1개로 제한
-- ============================================================
-- React StrictMode의 이펙트 이중 실행 등으로 getOrCreateWorkout이 동시에
-- 두 번 호출되면, 둘 다 "기존 진행 중 workout 없음"으로 보고 각자 새로
-- 만드는 경합 상태(race condition)가 생길 수 있음. 부분 유니크 인덱스로
-- DB 레벨에서 차단하고, 애플리케이션 코드(queries.ts)는 23505 유니크 위반
-- 시 기존 행을 다시 조회하도록 처리.
-- ============================================================

create unique index idx_workouts_one_open_per_routine
  on public.workouts (user_id, routine_id)
  where completed_at is null;
