import { supabase } from "@/lib/supabase";
import type { BodyPart, SplitType } from "@/types/database";

// Home 화면(mock)이 기본으로 참조하는 "오늘의 추천" 루틴 — seed.sql의 푸시 데이 루틴과 동일한 id.
export const DEFAULT_ROUTINE_ID = "c0000000-0000-0000-0000-000000000001";

export const BODY_PART_KO_TO_EN: Record<string, BodyPart> = {
  어깨: "shoulders",
  가슴: "chest",
  팔: "arms",
  등: "back",
  복근: "core",
  하체: "legs",
};

export const BODY_PART_EN_TO_KO: Record<BodyPart, string> = {
  shoulders: "어깨",
  chest: "가슴",
  arms: "팔",
  back: "등",
  core: "복근",
  legs: "하체",
  glutes: "둔근",
  full_body: "전신",
};

export const SPLIT_TYPE_KO_TO_EN: Record<string, SplitType> = {
  푸시: "push",
  풀: "pull",
  레그: "legs",
  전신: "full_body",
};

// 영상 길이를 모르면(예: 새로 추가한 실제 영상의 정확한 러닝타임을 아직 못 구한 경우)
// 0분으로 지어내지 않고 null로 둔다 — 화면에서 "—"로 정직하게 표시.
function minutesOrNull(seconds: number | null): number | null {
  return seconds ? Math.round(seconds / 60) : null;
}

// supabase-js는 임베디드 조인(video:videos(...))의 결과 타입을 Database.Relationships
// 메타데이터 없이는 정확히 추론하지 못하므로, 실제 PostgREST 응답 형태를 손으로 명시하고
// 쿼리 결과를 이 타입으로 캐스팅한다.
interface ExploreRoutineRow {
  id: string;
  title: string;
  video: { duration_seconds: number | null; athlete: { name: string } | null } | null;
  routine_items: { count: number }[];
}

export interface ExploreRoutine {
  id: string;
  name: string;
  meta: string;
}

export async function listExploreRoutines(bodyPartKo: string, categoryKo: string | null): Promise<ExploreRoutine[]> {
  if (!supabase) return [];
  const bodyPart = BODY_PART_KO_TO_EN[bodyPartKo];
  if (!bodyPart) return [];

  let query = supabase
    .from("routines")
    .select("id, title, video:videos!inner ( duration_seconds, athlete:athletes!inner ( name ) ), routine_items ( count )")
    .eq("status", "published")
    .eq("body_part", bodyPart);

  if (categoryKo) {
    const splitType = SPLIT_TYPE_KO_TO_EN[categoryKo];
    if (splitType) query = query.eq("split_type", splitType);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return (data as unknown as ExploreRoutineRow[]).map((r) => {
    const itemCount = r.routine_items[0]?.count ?? 0;
    const durationMin = minutesOrNull(r.video?.duration_seconds ?? null);
    const durationLabel = durationMin !== null ? `${durationMin}분 · ` : "";
    return {
      id: r.id,
      name: r.title,
      meta: `${itemCount} 종목 · ${durationLabel}${r.video?.athlete?.name ?? "알 수 없음"}`,
    };
  });
}

interface RoutineDetailRow {
  id: string;
  title: string;
  body_part: BodyPart;
  video: { duration_seconds: number | null; athlete: { name: string } | null } | null;
  routine_items: {
    id: string;
    timestamp_seconds: number | null;
    exercise: { name_ko: string; body_part: BodyPart; equipment: string | null } | null;
  }[];
}

export interface RoutineDetailItem {
  id: string;
  name: string;
  tag: string;
  timestampSeconds: number | null;
}

export interface RoutineDetail {
  id: string;
  title: string;
  athleteName: string;
  bodyPartLabel: string;
  itemCount: number;
  durationMin: number | null;
  items: RoutineDetailItem[];
}

// ── Record 화면: 실제 workouts/workout_sets 쓰기 ──

export interface WorkoutExercise {
  exerciseId: string;
  name: string;
  part: string;
  equip: string;
  sets: [number, number][];
  last: [number, number];
}

// 진행 중(완료 안 된) workout이 있으면 이어서 쓰고, 없으면 새로 생성.
export async function getOrCreateWorkout(userId: string, routineId: string): Promise<string | null> {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("workouts")
    .select("id")
    .eq("user_id", userId)
    .eq("routine_id", routineId)
    .is("completed_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("workouts")
    .insert({ user_id: userId, routine_id: routineId })
    .select("id")
    .single();
  if (!error) return created.id;

  // 23505 = unique_violation. idx_workouts_one_open_per_routine에 걸렸다는 건
  // 동시에 호출된 다른 요청이 이미 진행 중 workout을 만들었다는 뜻 — 그걸 그대로 씀
  // (예: React StrictMode의 effect 이중 실행으로 이 함수가 겹쳐 호출되는 경우).
  if (error.code === "23505") {
    const { data: raced } = await supabase
      .from("workouts")
      .select("id")
      .eq("user_id", userId)
      .eq("routine_id", routineId)
      .is("completed_at", null)
      .limit(1)
      .maybeSingle();
    return raced?.id ?? null;
  }
  return null;
}

interface RoutineItemWithExercise {
  exercise: { id: string; name_ko: string; body_part: BodyPart; equipment: string | null } | null;
}

export async function getWorkoutExercises(
  workoutId: string,
  routineId: string,
  userId: string,
): Promise<WorkoutExercise[]> {
  if (!supabase) return [];

  const { data: items } = await supabase
    .from("routine_items")
    .select("exercise:exercises ( id, name_ko, body_part, equipment )")
    .eq("routine_id", routineId)
    .order("position");
  if (!items) return [];

  const rows = items as unknown as RoutineItemWithExercise[];
  const exerciseIds = rows.map((it) => it.exercise?.id).filter((id): id is string => !!id);
  if (exerciseIds.length === 0) return [];

  const { data: currentSets } = await supabase
    .from("workout_sets")
    .select("exercise_id, weight_kg, reps, set_number")
    .eq("workout_id", workoutId)
    .order("set_number");

  const { data: lastSets } = await supabase
    .from("workout_sets")
    .select("exercise_id, weight_kg, reps, created_at")
    .eq("user_id", userId)
    .in("exercise_id", exerciseIds)
    .order("created_at", { ascending: false });

  const lastByExercise = new Map<string, [number, number]>();
  for (const row of lastSets ?? []) {
    if (!lastByExercise.has(row.exercise_id)) {
      lastByExercise.set(row.exercise_id, [Number(row.weight_kg ?? 0), row.reps ?? 0]);
    }
  }

  const setsByExercise = new Map<string, [number, number][]>();
  for (const row of currentSets ?? []) {
    const arr = setsByExercise.get(row.exercise_id) ?? [];
    arr.push([Number(row.weight_kg ?? 0), row.reps ?? 0]);
    setsByExercise.set(row.exercise_id, arr);
  }

  return rows
    .filter((it): it is RoutineItemWithExercise & { exercise: NonNullable<RoutineItemWithExercise["exercise"]> } => !!it.exercise)
    .map((it) => ({
      exerciseId: it.exercise.id,
      name: it.exercise.name_ko,
      part: BODY_PART_EN_TO_KO[it.exercise.body_part],
      equip: it.exercise.equipment ?? "",
      sets: setsByExercise.get(it.exercise.id) ?? [],
      last: lastByExercise.get(it.exercise.id) ?? [0, 0],
    }));
}

export async function insertWorkoutSet(
  workoutId: string,
  userId: string,
  exerciseId: string,
  setNumber: number,
  weightKg: number,
  reps: number,
): Promise<void> {
  if (!supabase) return;
  await supabase.from("workout_sets").insert({
    workout_id: workoutId,
    user_id: userId,
    exercise_id: exerciseId,
    set_number: setNumber,
    weight_kg: weightKg,
    reps,
    is_completed: true,
  });
}

export async function getRoutineDetail(routineId: string): Promise<RoutineDetail | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("routines")
    .select(
      `id, title, body_part,
       video:videos!inner ( duration_seconds, athlete:athletes!inner ( name ) ),
       routine_items ( id, position, timestamp_seconds, exercise:exercises ( name_ko, body_part, equipment ) )`,
    )
    .eq("id", routineId)
    .order("position", { referencedTable: "routine_items" })
    .single();

  if (error || !data) return null;

  const routine = data as unknown as RoutineDetailRow;
  const items = routine.routine_items.map((it) => ({
    id: it.id,
    name: it.exercise?.name_ko ?? "",
    tag: `${it.exercise ? BODY_PART_EN_TO_KO[it.exercise.body_part] : ""} · ${it.exercise?.equipment ?? ""}`,
    timestampSeconds: it.timestamp_seconds,
  }));

  return {
    id: routine.id,
    title: routine.title,
    athleteName: routine.video?.athlete?.name ?? "알 수 없음",
    bodyPartLabel: BODY_PART_EN_TO_KO[routine.body_part],
    itemCount: items.length,
    durationMin: minutesOrNull(routine.video?.duration_seconds ?? null),
    items,
  };
}

// ── 큐레이터 도구: routine_items.timestamp_seconds 실제 수정 ──
// 0006 마이그레이션으로 routines.curator_id = auth.uid()인 사용자만 UPDATE 가능.

export async function updateRoutineItemTimestamp(routineItemId: string, timestampSeconds: number): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("routine_items")
    .update({ timestamp_seconds: timestampSeconds })
    .eq("id", routineItemId);
  return !error;
}

// ── Home 화면: 오늘 트렌딩 + 콜드스타트 폴백 ──
// workouts/workout_sets는 RLS로 본인 행만 조회되므로, 전체 유저 집계는
// 0005 마이그레이션의 SECURITY DEFINER 함수(get_trending_routines/exercises)로 받는다.

export interface TrendingRoutine {
  routineId: string;
  rank: number;
  name: string;
  meta: string;
  count: number;
}

interface TrendingRoutineRow {
  id: string;
  title: string;
  video: { duration_seconds: number | null } | null;
  routine_items: { count: number }[];
}

export async function getTrendingRoutines(limit = 3): Promise<TrendingRoutine[]> {
  if (!supabase) return [];

  const { data: counts } = await supabase.rpc("get_trending_routines", { limit_count: limit });
  if (!counts || counts.length === 0) return [];

  const ids = counts.map((c) => c.routine_id);
  const { data: routines } = await supabase
    .from("routines")
    .select("id, title, video:videos!inner ( duration_seconds ), routine_items ( count )")
    .in("id", ids);
  if (!routines) return [];

  const rows = routines as unknown as TrendingRoutineRow[];
  const byId = new Map(rows.map((r) => [r.id, r]));

  return counts
    .map((c, i) => {
      const r = byId.get(c.routine_id);
      if (!r) return null;
      const itemCount = r.routine_items[0]?.count ?? 0;
      const durationMin = minutesOrNull(r.video?.duration_seconds ?? null);
      const meta = durationMin !== null ? `${itemCount} 종목 · ${durationMin}분` : `${itemCount} 종목`;
      return {
        routineId: r.id,
        rank: i + 1,
        name: r.title,
        meta,
        count: Number(c.workout_count),
      };
    })
    .filter((r): r is TrendingRoutine => r !== null);
}

export interface TrendingExercise {
  name: string;
  count: number;
}

export async function getTrendingExercises(limit = 6): Promise<TrendingExercise[]> {
  if (!supabase) return [];

  const { data: counts } = await supabase.rpc("get_trending_exercises", { limit_count: limit });
  if (!counts || counts.length === 0) return [];

  const ids = counts.map((c) => c.exercise_id);
  const { data: exercises } = await supabase.from("exercises").select("id, name_ko").in("id", ids);
  if (!exercises) return [];

  const nameById = new Map(exercises.map((e) => [e.id, e.name_ko]));
  return counts
    .map((c) => ({ name: nameById.get(c.exercise_id) ?? "", count: Number(c.set_count) }))
    .filter((e) => e.name !== "");
}

export interface CuratorPick {
  routineId: string;
  name: string;
  curator: string;
  meta: string;
}

interface CuratorPickRow {
  id: string;
  title: string;
  video: { athlete: { name: string } | null } | null;
  routine_items: { count: number }[];
}

export async function getCuratorPicks(limit = 3): Promise<CuratorPick[]> {
  if (!supabase) return [];

  const { data } = await supabase
    .from("routines")
    .select("id, title, video:videos!inner ( athlete:athletes!inner ( name ) ), routine_items ( count )")
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(limit);
  if (!data) return [];

  const rows = data as unknown as CuratorPickRow[];
  return rows.map((r) => ({
    routineId: r.id,
    name: r.title,
    curator: r.video?.athlete?.name ?? "알 수 없음",
    meta: `${r.routine_items[0]?.count ?? 0} 종목`,
  }));
}
