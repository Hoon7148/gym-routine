export const muscleCardDefs = [
  { name: "전면 삼각근", hit: "delt", cur: 8, max: 18 },
  { name: "가슴", hit: "pec", cur: 12, max: 20 },
  { name: "측면 삼각근", hit: "delt", cur: 6, max: 16 },
  { name: "삼두", hit: "arm", cur: 9, max: 18 },
] as const;

// Home의 curatorPicks 실 쿼리(getCuratorPicks)가 로딩되기 전 초기 표시용 폴백.
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
