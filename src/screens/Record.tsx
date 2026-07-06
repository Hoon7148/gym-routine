import { useAppStore } from "@/store/appStore";
import { fmt } from "@/lib/format";
import type { ExerciseRecord } from "@/types/domain";

function computeView(r: ExerciseRecord, index: number) {
  const volume = r.sets.reduce((a, [w, rp]) => a + w * rp, 0);
  const max1rm = r.sets.reduce((a, [w, rp]) => Math.max(a, w * (1 + rp / 30)), 0);
  const setsView = r.sets.map(([w, rp], j) => ({
    n: String(j + 1),
    wr: `${fmt(w)}kg × ${rp}`,
    rm: `${fmt(Math.round(w * (1 + rp / 30)))}kg`,
  }));
  const lastLabel = `${r.last[0]}kg × ${r.last[1]}`;
  return {
    num: String(index + 1),
    subtitle: `${r.part} / ${r.equip} / Volume×Reps`,
    sets: setsView,
    volume: fmt(volume),
    max1rm: fmt(Math.round(max1rm)),
    setCount: r.sets.length,
    placeholder: lastLabel,
    lastLabel,
    summary: r.sets.length ? `${r.sets.length}세트 · ${lastLabel}` : lastLabel,
  };
}

export function Record() {
  const records = useAppStore((s) => s.records);
  const addSet = useAppStore((s) => s.addSet);
  const completeExercise = useAppStore((s) => s.completeExercise);
  const reopenExercise = useAppStore((s) => s.reopenExercise);
  const startExercise = useAppStore((s) => s.startExercise);

  const doneCount = records.filter((r) => r.status === "done").length;

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-text tracking-tight">7월 7일</span>
          <span className="text-xs text-text-dim">푸시 데이</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[11px] font-bold text-text-dim bg-card border border-white/[0.08] rounded-lg px-2.5 py-1.5">kg</span>
          <div className="mono text-[15px] font-extrabold text-success">{doneCount}<span className="text-text-ghost">/{records.length}</span></div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {records.map((r, i) => {
          const v = computeView(r, i);
          if (r.status === "done") {
            return (
              <div key={r.id} onClick={() => reopenExercise(r.id)} className="flex items-center gap-3 px-3.5 py-2.5 bg-success/[0.06] border border-success/[0.18] rounded-[13px] cursor-pointer">
                <span className="w-5 h-5 rounded-full bg-success text-[#08120b] flex items-center justify-center text-xs font-extrabold flex-none">✓</span>
                <span className="flex-1 text-[13.5px] font-semibold text-success line-through decoration-success/50">{r.name}</span>
                <span className="mono text-[12.5px] font-bold text-[#6fd39e]">{v.summary}</span>
              </div>
            );
          }
          if (r.status === "active") {
            return (
              <div key={r.id} className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-start gap-2.5 px-[15px] pt-3.5 pb-3">
                  <span className="w-1 self-stretch rounded-md bg-accent flex-none" />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-extrabold text-text tracking-tight leading-tight">{r.name}</div>
                    <div className="text-[11.5px] text-text-dim mt-0.5">{v.subtitle}</div>
                  </div>
                  <button className="flex-none w-[30px] h-[30px] bg-card-alt border border-white/[0.08] rounded-lg text-text-dim text-xs">⧉</button>
                  <button className="mono flex-none w-[38px] h-[30px] bg-card-alt border border-white/[0.08] rounded-lg text-text-dim text-[10px]">3:00</button>
                </div>
                <div className="flex gap-2 px-[15px] pb-3">
                  <div className="flex-[1.2] bg-card-alt border border-white/[0.06] rounded-[13px] px-3 py-2.5">
                    <div className="text-[10.5px] text-text-dim leading-tight mb-2">총 볼륨</div>
                    <div className="flex items-baseline gap-0.5"><span className="mono text-[22px] font-extrabold text-text tracking-tight">{v.volume}</span><span className="text-[11px] text-text-dim">kg</span></div>
                  </div>
                  <div className="flex-[1.2] bg-card-alt border border-white/[0.06] rounded-[13px] px-3 py-2.5">
                    <div className="text-[10.5px] text-text-dim leading-tight mb-2">최대 1RM</div>
                    <div className="flex items-baseline gap-0.5"><span className="mono text-[22px] font-extrabold text-text tracking-tight">{v.max1rm}</span><span className="text-[11px] text-text-dim">kg</span></div>
                  </div>
                  <div className="flex-1 bg-card-alt border border-white/[0.06] rounded-[13px] px-3 py-2.5">
                    <div className="text-[10.5px] text-text-dim leading-tight mb-2">세트</div>
                    <div className="flex items-baseline gap-0.5"><span className="mono text-[22px] font-extrabold text-text tracking-tight">{v.setCount}</span></div>
                  </div>
                </div>
                <div className="bg-card-deep border-t border-white/[0.06] px-[15px] pt-1.5 pb-2.5">
                  {v.sets.map((s) => (
                    <div key={s.n} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05]">
                      <span className="mono text-[13px] font-bold text-text-faint w-4 flex-none">{s.n}</span>
                      <span className="mono flex-1 text-[17px] font-extrabold text-text tracking-tight">{s.wr}</span>
                      <span className="mono text-[11px] font-semibold text-text-dim">1RM {s.rm}</span>
                      <span className="text-[13px] text-text-faint">✎</span>
                    </div>
                  ))}
                  <div onClick={() => addSet(r.id)} className="flex items-center gap-3 py-2.5 pt-2.5 pb-1 cursor-pointer">
                    <span className="mono text-[13px] font-bold text-text-ghost w-4 flex-none">+</span>
                    <span className="mono flex-1 text-base font-bold text-[#55555c]">{v.placeholder}</span>
                    <span className="text-[11px] font-bold text-accent">탭하여 추가</span>
                  </div>
                </div>
                <div className="px-[15px] py-3">
                  <button onClick={() => completeExercise(r.id)} className="w-full bg-accent text-white rounded-xl py-3 text-sm font-extrabold">종목 완료 ✓</button>
                </div>
              </div>
            );
          }
          return (
            <div key={r.id} onClick={() => startExercise(r.id)} className="flex items-center gap-3 px-3.5 py-3 border border-white/[0.07] rounded-[13px] cursor-pointer">
              <span className="mono text-[13px] font-bold text-text-ghost w-4 flex-none">{v.num}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#c8c8cc]">{r.name}</div>
                <div className="text-[11px] text-text-faint mt-px">지난 {v.lastLabel}</div>
              </div>
              <span className="text-[11px] font-bold text-text-faint">시작 ›</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
