-- ============================================================
-- routines.split_type — 탐색 화면 "유형별"(푸시/풀/레그/전신) 필터용
-- ============================================================
-- body_part 는 "어느 부위"를, split_type 은 "어떤 분할"을 나타냄(직교 축).
-- 기존 공개 읽기 정책(0002)이 routines 테이블 전체 SELECT를 이미 허용하므로
-- 별도 RLS 정책 추가는 불필요.
-- ============================================================

create type split_type as enum ('push', 'pull', 'legs', 'full_body');

alter table public.routines add column split_type split_type not null;
