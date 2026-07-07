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
    const durationMin = r.video?.duration_seconds ? Math.round(r.video.duration_seconds / 60) : 0;
    return {
      id: r.id,
      name: r.title,
      meta: `${itemCount} 종목 · ${durationMin}분 · ${r.video?.athlete?.name ?? "알 수 없음"}`,
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
  durationMin: number;
  items: RoutineDetailItem[];
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
    durationMin: routine.video?.duration_seconds ? Math.round(routine.video.duration_seconds / 60) : 0,
    items,
  };
}
