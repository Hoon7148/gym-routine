-- ============================================================
-- 큐레이터 도구: routine_items.timestamp_seconds 수정 허용 (curator_id 소유자만)
-- ============================================================
-- 0002 마이그레이션 원안은 큐레이션 세계 쓰기를 service_role 전용으로 설계했으나,
-- 앱 안에 "큐레이터 도구" 화면이 이미 존재해서(내정보 → 큐레이터 도구, 일반
-- 사용자 플로우엔 노출 안 됨) 해당 루틴의 curator_id와 일치하는 로그인 사용자에
-- 한해 타임스탬프 수정을 허용한다.
--
-- 실행 전 준비: 시드된 routines.curator_id가 비어있으면, 먼저 본인 계정의
-- auth.users.id로 채워야 이 정책이 실제로 통과함:
--   update public.routines set curator_id = '<내 auth.users.id>' where curator_id is null;
-- ============================================================

create policy "루틴 큐레이터만 routine_items 타임스탬프 수정 가능"
  on public.routine_items for update
  using (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.curator_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.routines r
      where r.id = routine_id and r.curator_id = auth.uid()
    )
  );

grant update on public.routine_items to authenticated;
