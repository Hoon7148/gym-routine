import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { mmss } from "@/lib/format";
import { getRoutineDetail, type RoutineDetail as RoutineDetailData } from "@/lib/queries";

export function RoutineDetail() {
  const selectedRoutineId = useAppStore((s) => s.selectedRoutineId);
  const goHome = useAppStore((s) => s.goHome);
  const startRecord = useAppStore((s) => s.startRecord);

  const [routine, setRoutine] = useState<RoutineDetailData | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRoutineDetail(selectedRoutineId).then((data) => {
      if (!cancelled) setRoutine(data);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedRoutineId]);

  const ready = routine !== null && routine.id === selectedRoutineId;

  return (
    <>
      <div className="scr pb-[130px]">
        <div className="flex items-center gap-3.5 px-5 pt-2 pb-3.5">
          <button onClick={goHome} className="w-[38px] h-[38px] rounded-[11px] bg-card border border-white/[0.07] text-text text-lg">←</button>
          <span className="text-[13px] font-semibold text-text-dim">루틴 상세</span>
        </div>
        {ready && routine && (
          <div className="px-5">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-success bg-success/10 px-2.5 py-1.5 rounded-lg">✓ 큐레이터 검증</span>
            <div className="text-[27px] font-extrabold text-text tracking-tight leading-tight mt-3 mb-1">{routine.title}</div>
            <div className="text-[13px] text-text-dim">{routine.athleteName} 유튜브 루틴</div>
            <div className="flex items-center gap-[18px] mt-4 pb-[18px] border-b border-white/[0.07]">
              <div><span className="mono text-xl font-extrabold text-text">{routine.itemCount}</span><span className="text-xs text-text-dim"> 종목</span></div>
              <div><span className="mono text-xl font-extrabold text-text">{routine.durationMin ?? "—"}</span><span className="text-xs text-text-dim"> 분</span></div>
              <div><span className="mono text-xl font-extrabold text-text">—</span><span className="text-xs text-text-dim"> 명 진행</span></div>
            </div>
            <div className="text-[11.5px] text-text-faint leading-snug mt-3.5 mb-1">세트·무게는 직접 설정 — 순서와 구성만 제공합니다.</div>
            {routine.items.map((d, i) => (
              <div key={d.id} className="flex items-center gap-3.5 py-[15px] border-b border-white/[0.06]">
                <span className="mono text-[15px] font-bold text-text-ghost w-6 flex-none">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-bold text-text tracking-tight">{d.name}</div>
                  <div className="text-xs text-text-dim mt-0.5">{d.tag}</div>
                </div>
                <button onClick={startRecord} className="flex items-center gap-1.5 bg-accent/[0.12] border border-accent/25 rounded-[9px] px-2.5 py-[7px] flex-none">
                  <span className="w-0 h-0 border-l-[7px] border-l-accent border-y-[4.5px] border-y-transparent" />
                  <span className="mono text-[12.5px] font-bold text-accent">{d.timestampSeconds !== null ? mmss(d.timestampSeconds) : "—"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="absolute left-0 right-0 bottom-0 px-5 pt-4 pb-[30px]" style={{ background: "linear-gradient(to top, #0a0a0b 62%, transparent)" }}>
        <button onClick={startRecord} className="w-full bg-accent text-white rounded-2xl py-4 text-[15.5px] font-extrabold">이 루틴으로 기록 시작 →</button>
      </div>
    </>
  );
}
