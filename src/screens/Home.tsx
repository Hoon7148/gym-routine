import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { muscleCardDefs, curatorPicks as mockCuratorPicks } from "@/data/mockData";
import { mmss } from "@/lib/format";
import { ImageSlot } from "@/components/ImageSlot";
import { MuscleIcon } from "@/components/MuscleIcon";
import {
  DEFAULT_ROUTINE_ID,
  getRoutineDetail,
  getTrendingRoutines,
  getTrendingExercises,
  getCuratorPicks,
  type RoutineDetail,
  type TrendingRoutine,
  type TrendingExercise,
  type CuratorPick,
} from "@/lib/queries";

const ACCENT = "#e5484d";

export function Home() {
  const cold = useAppStore((s) => s.cold);
  const setCold = useAppStore((s) => s.setCold);
  const openDetail = useAppStore((s) => s.openDetail);
  const startRecord = useAppStore((s) => s.startRecord);

  const [routine, setRoutine] = useState<RoutineDetail | null>(null);
  const [trendRoutines, setTrendRoutines] = useState<TrendingRoutine[]>([]);
  const [trendExercises, setTrendExercises] = useState<TrendingExercise[]>([]);
  const [curatorPicks, setCuratorPicks] = useState<CuratorPick[]>(mockCuratorPicks.map((c) => ({ ...c, routineId: "" })));

  useEffect(() => {
    let cancelled = false;
    getRoutineDetail(DEFAULT_ROUTINE_ID).then((data) => {
      if (!cancelled && data) setRoutine(data);
    });
    getTrendingRoutines(3).then((data) => {
      if (cancelled) return;
      setTrendRoutines(data);
      if (data.length === 0) setCold(true);
    });
    getTrendingExercises(6).then((data) => {
      if (!cancelled) setTrendExercises(data);
    });
    getCuratorPicks(3).then((data) => {
      if (!cancelled && data.length > 0) setCuratorPicks(data);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 홈 진입 시 1회만 로드
  }, []);

  const heroItemCount = routine?.itemCount ?? 8;
  const heroDurationMin = routine?.durationMin ?? 62;
  const heroInProgress = trendRoutines.find((t) => t.routineId === DEFAULT_ROUTINE_ID)?.count;

  const segBase = "flex-1 text-center py-2.5 rounded-lg text-[12.5px] font-bold transition-colors";

  return (
    <div className="scr pt-2 pb-[120px]">
      {/* app bar */}
      <div className="flex items-start justify-between px-5 mb-4">
        <div>
          <div className="text-xs font-semibold text-text-dim tracking-wide uppercase">수요일 · 7월 7일</div>
          <div className="text-[27px] font-extrabold text-text tracking-tight leading-tight mt-0.5">오늘의 세션</div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[13px] font-bold text-text">푸시 데이</span>
            <span className="w-[3px] h-[3px] rounded-full bg-[#5a5a60]" />
            <span className="text-[13px] text-text-dim">약 60분</span>
          </div>
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-card-alt border border-white/[0.08] flex items-center justify-center font-bold text-text-dim text-[15px]">준</div>
      </div>

      {/* muscle target cards — mock: exercises.body_part로는 전면/측면 삼각근 같은 세부
          근육 구분을 못 만들어서, 실 데이터화는 스키마 확장 전까지 보류 */}
      <div className="hscroll flex gap-3 overflow-x-auto px-5 pb-1 mb-5">
        {muscleCardDefs.map((m) => (
          <div key={m.name} className="flex-none w-[150px] bg-card border border-white/[0.07] rounded-[18px] p-3.5">
            <div className="h-[74px] flex items-center justify-center mb-2">
              <MuscleIcon hit={m.hit} accent={ACCENT} />
            </div>
            <div className="text-[16px] font-extrabold text-text tracking-tight">{m.name}</div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-success text-xs">↑</span>
              <span className="text-xs font-semibold text-success">성장 중</span>
            </div>
            <div className="relative h-1 rounded-full bg-[#2a2a2e] mt-3">
              <span className="absolute left-0 top-0 bottom-0 rounded-full bg-accent" style={{ width: `${Math.round((m.cur / m.max) * 100)}%` }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="mono text-[10px] text-text-faint">0</span>
              <span className="mono text-[10px] font-bold text-accent">+{m.cur}</span>
              <span className="mono text-[10px] text-text-faint">{m.max}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5">
        {/* hero recommended routine */}
        <div className="rounded-[20px] overflow-hidden bg-card border border-white/[0.07] mb-3.5">
          <div className="relative">
            <ImageSlot className="w-full h-[150px]" rounded="rounded-none" />
            <span className="absolute top-3 left-3 text-[11px] font-bold tracking-wide uppercase text-white bg-accent px-2.5 py-1 rounded-lg">오늘의 추천</span>
          </div>
          <div className="p-4">
            <div className="text-[22px] font-extrabold text-text tracking-tight leading-tight">{routine?.title ?? "푸시 데이 — 상체 볼륨"}</div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-[5px] h-[5px] rounded-full bg-success" />
              <span className="text-[13px] text-text-dim">{routine?.athleteName ?? "CBUM"} 유튜브 루틴 · 큐레이터 검증</span>
            </div>
            <div className="flex items-center gap-4 mt-3.5">
              <div><span className="mono text-[19px] font-extrabold text-text">{heroItemCount}</span><span className="text-xs text-text-dim"> 종목</span></div>
              <div className="w-px h-4 bg-white/10" />
              <div><span className="mono text-[19px] font-extrabold text-text">{heroDurationMin}</span><span className="text-xs text-text-dim"> 분</span></div>
              <div className="w-px h-4 bg-white/10" />
              <div><span className="mono text-[19px] font-extrabold text-text">{heroInProgress ?? "—"}</span><span className="text-xs text-text-dim"> 진행중</span></div>
            </div>
          </div>
        </div>

        {/* exercise list w/ timestamp deeplinks (sets/weight intentionally hidden) */}
        {(routine?.items ?? []).map((d, i) => (
          <div key={d.id} onClick={() => openDetail()} className="flex items-center gap-3.5 py-3.5 border-b border-white/[0.06] cursor-pointer">
            <span className="mono text-sm font-bold text-text-ghost w-5 flex-none">{String(i + 1).padStart(2, "0")}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[14.5px] font-bold text-text tracking-tight">{d.name}</div>
              <div className="text-xs text-text-dim mt-px">{d.tag}</div>
            </div>
            <div className="flex items-center gap-1 bg-accent/[0.12] border border-accent/25 rounded-[9px] px-2.5 py-1.5 flex-none">
              <span className="w-0 h-0 border-l-[6px] border-l-accent border-y-4 border-y-transparent" />
              <span className="mono text-xs font-bold text-accent">{d.timestampSeconds !== null ? mmss(d.timestampSeconds) : "—"}</span>
            </div>
          </div>
        ))}

        <div className="flex gap-2.5 mt-[18px]">
          <button onClick={() => openDetail()} className="flex-none w-[52px] h-[52px] rounded-2xl bg-card border border-white/10 text-text text-xl">≣</button>
          <button onClick={startRecord} className="flex-1 flex items-center justify-center gap-2 bg-accent text-white rounded-2xl py-4 text-[15.5px] font-extrabold">
            <span className="w-0 h-0 border-l-[9px] border-l-white border-y-[6px] border-y-transparent" />
            운동 시작
          </button>
        </div>

        {/* personal nudge */}
        <div className="flex items-center gap-3 bg-card border border-warning/[0.22] rounded-2xl px-4 py-3.5 my-[22px]">
          <span className="w-2 h-2 rounded-full bg-warning flex-none shadow-[0_0_0_4px_rgba(242,193,78,0.12)]" />
          <div className="flex-1">
            <div className="text-[13.5px] font-semibold text-text">등 운동을 <span className="text-warning">3일째</span> 안 했어요</div>
            <div className="text-xs text-text-dim mt-px">풀 데이 루틴을 추가할까요?</div>
          </div>
          <span className="text-xs font-bold text-warning">추가</span>
        </div>

        {/* warm/cold toggle */}
        <div className="flex gap-1 bg-card border border-white/[0.07] rounded-[11px] p-1 mb-4">
          <button onClick={() => setCold(false)} className={`${segBase} ${!cold ? "bg-accent text-white" : "bg-transparent text-text-dim"}`}>🔥 오늘 인기</button>
          <button onClick={() => setCold(true)} className={`${segBase} ${cold ? "bg-accent text-white" : "bg-transparent text-text-dim"}`}>콜드스타트</button>
        </div>

        {!cold ? (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="text-base font-extrabold text-text tracking-tight">오늘 인기 루틴</div>
              <span className="text-xs text-text-dim">전체 →</span>
            </div>
            {trendRoutines.map((t) => (
              <div key={t.routineId} onClick={() => openDetail(t.routineId)} className="flex items-center gap-3 py-3 border-b border-white/[0.06] cursor-pointer">
                <span className="mono text-lg font-extrabold text-[#2a2a2e] w-[22px]">{t.rank}</span>
                <ImageSlot className="w-11 h-11" rounded="rounded-[11px]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold text-text">{t.name}</div>
                  <div className="text-xs text-text-dim mt-0.5">{t.meta}</div>
                </div>
                <div className="text-right">
                  <div className="mono text-sm font-extrabold text-accent">{t.count}</div>
                  <div className="text-[10px] text-text-faint">진행중</div>
                </div>
              </div>
            ))}
            <div className="text-base font-extrabold text-text tracking-tight mt-[22px] mb-3">트렌딩 종목</div>
            <div className="flex flex-wrap gap-2">
              {trendExercises.map((e) => (
                <div key={e.name} className="flex items-center gap-1.5 bg-card border border-white/[0.07] rounded-[10px] px-3 py-2.5">
                  <span className="text-[13px] font-semibold text-text">{e.name}</span>
                  <span className="mono text-xs font-bold text-accent">{e.count}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 bg-[#131315] border border-dashed border-white/[0.14] rounded-2xl px-4 py-3.5 mb-[18px]">
              <span className="w-2 h-2 rounded-full bg-[#5a5a60] flex-none" />
              <div className="text-[12.5px] text-text-dim leading-snug">
                오늘 트렌딩 데이터를 모으는 중이에요.<br />그동안 <span className="text-text font-semibold">큐레이터 픽</span>을 먼저 보여드릴게요.
              </div>
            </div>
            <div className="text-base font-extrabold text-text tracking-tight mb-3">큐레이터 픽</div>
            {curatorPicks.map((c) => (
              <div key={c.name} onClick={() => openDetail(c.routineId || undefined)} className="flex items-center gap-3 py-3 border-b border-white/[0.06] cursor-pointer">
                <ImageSlot className="w-11 h-11" rounded="rounded-[11px]" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-bold text-text">{c.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-[5px] h-[5px] rounded-full bg-success" />
                    <span className="text-xs text-text-dim">{c.curator} 검증 · {c.meta}</span>
                  </div>
                </div>
                <span className="text-text-faint">›</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
