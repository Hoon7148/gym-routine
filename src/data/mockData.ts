import type { CuratorRow, ExerciseRecord, RoutineListing } from "@/types/domain";

export const detailTimes = [192, 465, 740, 1018, 1290, 1510, 1784, 1982];

export const initialRecords: ExerciseRecord[] = [
  { id: 1, name: "인클라인 바벨 벤치프레스", part: "가슴", equip: "바벨", status: "done", sets: [[100, 8], [102.5, 8], [102.5, 7]], last: [100, 8] },
  { id: 2, name: "플랫 덤벨 프레스", part: "가슴", equip: "덤벨", status: "done", sets: [[40, 10], [40, 10], [40, 9]], last: [40, 10] },
  { id: 3, name: "시티드 숄더 프레스", part: "어깨", equip: "머신", status: "active", sets: [[60, 8], [60, 8]], last: [60, 8] },
  { id: 4, name: "인클라인 덤벨 플라이", part: "가슴", equip: "덤벨", status: "todo", sets: [], last: [22, 12] },
  { id: 5, name: "레터럴 레이즈", part: "어깨", equip: "덤벨", status: "todo", sets: [], last: [14, 15] },
  { id: 6, name: "케이블 크로스오버", part: "가슴", equip: "케이블", status: "todo", sets: [], last: [25, 12] },
  { id: 7, name: "오버헤드 트라이셉 익스텐션", part: "삼두", equip: "케이블", status: "todo", sets: [], last: [35, 10] },
  { id: 8, name: "트라이셉 푸시다운", part: "삼두", equip: "케이블", status: "todo", sets: [], last: [45, 12] },
];

export const initialCurator: CuratorRow[] = [
  { id: 1, name: "인클라인 바벨 벤치프레스", t: 192, confirmed: true },
  { id: 2, name: "플랫 덤벨 프레스", t: 465, confirmed: true },
  { id: 3, name: "시티드 숄더 프레스", t: 740, confirmed: true },
  { id: 4, name: "인클라인 덤벨 플라이", t: 1018, confirmed: false },
  { id: 5, name: "레터럴 레이즈", t: 1290, confirmed: false },
  { id: 6, name: "케이블 크로스오버", t: 1510, confirmed: false },
  { id: 7, name: "오버헤드 트라이셉 익스텐션", t: 1784, confirmed: false },
  { id: 8, name: "트라이셉 푸시다운", t: 1982, confirmed: false },
];

export const muscleCardDefs = [
  { name: "전면 삼각근", hit: "delt", cur: 8, max: 18 },
  { name: "가슴", hit: "pec", cur: 12, max: 20 },
  { name: "측면 삼각근", hit: "delt", cur: 6, max: 16 },
  { name: "삼두", hit: "arm", cur: 9, max: 18 },
] as const;

export const routineDB: RoutineListing[] = [
  { name: "푸시 데이 — 상체 볼륨", part: "가슴", meta: "8 종목 · 62분 · CBUM", slotId: "ex-push" },
  { name: "벤치 특화 — 대흉근 하부", part: "가슴", meta: "6 종목 · 48분 · Larry", slotId: "ex-bench" },
  { name: "풀 데이 — 등 두께", part: "등", meta: "9 종목 · 68분 · CBUM", slotId: "ex-pull" },
  { name: "숄더 3D", part: "어깨", meta: "7 종목 · 52분 · Jeff", slotId: "ex-shoulder" },
  { name: "레그 데이 — 대퇴사두", part: "하체", meta: "7 종목 · 55분 · Larry", slotId: "ex-leg" },
  { name: "팔 집중 — 이두·삼두", part: "팔", meta: "8 종목 · 45분 · Jeff", slotId: "ex-arm" },
  { name: "코어 & 복근 서킷", part: "복근", meta: "6 종목 · 30분 · CBUM", slotId: "ex-core" },
];

export const trendRoutines = [
  { rank: "1", name: "풀 데이 — 등 두께", meta: "9 종목 · 68분", count: "2.4k" },
  { rank: "2", name: "레그 데이 — 대퇴사두", meta: "7 종목 · 55분", count: "1.9k" },
  { rank: "3", name: "푸시 데이 — 상체 볼륨", meta: "8 종목 · 62분", count: "1.2k" },
];

export const trendExercises = [
  { name: "바벨 벤치프레스", count: "3.4k" },
  { name: "데드리프트", count: "2.9k" },
  { name: "스쿼트", count: "2.7k" },
  { name: "풀업", count: "2.1k" },
  { name: "오버헤드 프레스", count: "1.6k" },
  { name: "바벨 로우", count: "1.4k" },
];

export const curatorPicks = [
  { name: "풀 데이 — 등 두께", curator: "CBUM", meta: "9 종목" },
  { name: "레그 데이 — 대퇴사두", curator: "Larry Wheels", meta: "7 종목" },
  { name: "푸시 데이 — 상체 볼륨", curator: "CBUM", meta: "8 종목" },
];

export const categories = [
  { name: "푸시" },
  { name: "풀" },
  { name: "레그" },
  { name: "전신" },
] as const;

export const bodyTagDefs = [
  { name: "어깨", top: "13%", left: "6%" },
  { name: "가슴", top: "22%", left: "64%" },
  { name: "팔", top: "34%", left: "3%" },
  { name: "등", top: "40%", left: "68%" },
  { name: "복근", top: "52%", left: "60%" },
  { name: "하체", top: "66%", left: "8%" },
] as const;
