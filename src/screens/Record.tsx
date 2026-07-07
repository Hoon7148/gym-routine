import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { fmt } from "@/lib/format";
import { getOrCreateWorkout, getWorkoutExercises, insertWorkoutSet, type WorkoutExercise } from "@/lib/queries";

function computeView(ex: WorkoutExercise, index: number) {
  const volume = ex.sets.reduce((a, [w, rp]) => a + w * rp, 0);
  const max1rm = ex.sets.reduce((a, [w, rp]) => Math.max(a, w * (1 + rp / 30)), 0);
  const setsView = ex.sets.map(([w, rp], j) => ({
    n: String(j + 1),
    wr: `${fmt(w)}kg × ${rp}`,
    rm: `${fmt(Math.round(w * (1 + rp / 30)))}kg`,
  }));
  const lastLabel = `${ex.last[0]}kg × ${ex.last[1]}`;
  return {
    num: String(index + 1),
    subtitle: `${ex.part} / ${ex.equip} / Volume×Reps`,
    sets: setsView,
    volume: fmt(volume),
    max1rm: fmt(Math.round(max1rm)),
    setCount: ex.sets.length,
    placeholder: lastLabel,
    lastLabel,
    summary: ex.sets.length ? `${ex.sets.length}세트 · ${lastLabel}` : lastLabel,
  };
}

export function Record() {
  const selectedRoutineId = useAppStore((s) => s.selectedRoutineId);
  const session = useAuthStore((s) => s.session);

  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [doneIds, setDoneIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  // 세션+루틴 조합이 바뀌면 아래 로 다시 fetch할 때까지 loading 처리 (동기 setState 없이 파생값으로 계산).
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const currentKey = session ? `${session.user.id}:${selectedRoutineId}` : null;
  const loading = session !== null && loadedKey !== currentKey;

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      const wId = await getOrCreateWorkout(session.user.id, selectedRoutineId);
      if (cancelled || !wId) return;
      const items = await getWorkoutExercises(wId, selectedRoutineId, session.user.id);
      if (cancelled) return;
      setWorkoutId(wId);
      setExercises(items);
      setDoneIds(new Set());
      setActiveId(items.find((e) => e.sets.length === 0)?.exerciseId ?? items[0]?.exerciseId ?? null);
      setLoadedKey(currentKey);
    })();
    return () => {
      cancelled = true;
    };
  }, [session, selectedRoutineId, currentKey]);

  async function addSet(exerciseId: string) {
    if (!workoutId || !session) return;
    const ex = exercises.find((e) => e.exerciseId === exerciseId);
    if (!ex) return;
    const [weight, reps] = ex.last;
    const nextSetNumber = ex.sets.length + 1;
    await insertWorkoutSet(workoutId, session.user.id, exerciseId, nextSetNumber, weight, reps);
    setExercises((prev) =>
      prev.map((e) => (e.exerciseId === exerciseId ? { ...e, sets: [...e.sets, [weight, reps] as [number, number]] } : e)),
    );
  }

  function completeExercise(exerciseId: string) {
    setDoneIds((prev) => new Set(prev).add(exerciseId));
    const next = exercises.find((e) => e.exerciseId !== exerciseId && !doneIds.has(e.exerciseId));
    setActiveId(next?.exerciseId ?? null);
  }

  function reopenExercise(exerciseId: string) {
    setDoneIds((prev) => {
      const copy = new Set(prev);
      copy.delete(exerciseId);
      return copy;
    });
    setActiveId(exerciseId);
  }

  function startExercise(exerciseId: string) {
    setActiveId(exerciseId);
  }

  if (!session) {
    return (
      <div className="scr pt-2 px-5 pb-[120px]">
        <div className="text-base font-bold text-text mb-2">로그인이 필요해요</div>
        <div className="text-sm text-text-dim">내정보 화면에서 로그인하면 오늘 운동을 기록할 수 있어요.</div>
      </div>
    );
  }

  if (loading) {
    return <div className="scr pt-2 px-5 pb-[120px] text-sm text-text-dim">불러오는 중…</div>;
  }

  const doneCount = doneIds.size;
  const today = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric" }).format(new Date());

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-text tracking-tight">{today}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[11px] font-bold text-text-dim bg-card border border-white/[0.08] rounded-lg px-2.5 py-1.5">kg</span>
          <div className="mono text-[15px] font-extrabold text-success">{doneCount}<span className="text-text-ghost">/{exercises.length}</span></div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {exercises.map((ex, i) => {
          const v = computeView(ex, i);
          const isDone = doneIds.has(ex.exerciseId);
          const isActive = !isDone && ex.exerciseId === activeId;

          if (isDone) {
            return (
              <div key={ex.exerciseId} onClick={() => reopenExercise(ex.exerciseId)} className="flex items-center gap-3 px-3.5 py-2.5 bg-success/[0.06] border border-success/[0.18] rounded-[13px] cursor-pointer">
                <span className="w-5 h-5 rounded-full bg-success text-[#08120b] flex items-center justify-center text-xs font-extrabold flex-none">✓</span>
                <span className="flex-1 text-[13.5px] font-semibold text-success line-through decoration-success/50">{ex.name}</span>
                <span className="mono text-[12.5px] font-bold text-[#6fd39e]">{v.summary}</span>
              </div>
            );
          }
          if (isActive) {
            return (
              <div key={ex.exerciseId} className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                <div className="flex items-start gap-2.5 px-[15px] pt-3.5 pb-3">
                  <span className="w-1 self-stretch rounded-md bg-accent flex-none" />
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-extrabold text-text tracking-tight leading-tight">{ex.name}</div>
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
                  <div onClick={() => addSet(ex.exerciseId)} className="flex items-center gap-3 py-2.5 pt-2.5 pb-1 cursor-pointer">
                    <span className="mono text-[13px] font-bold text-text-ghost w-4 flex-none">+</span>
                    <span className="mono flex-1 text-base font-bold text-[#55555c]">{v.placeholder}</span>
                    <span className="text-[11px] font-bold text-accent">탭하여 추가</span>
                  </div>
                </div>
                <div className="px-[15px] py-3">
                  <button onClick={() => completeExercise(ex.exerciseId)} className="w-full bg-accent text-white rounded-xl py-3 text-sm font-extrabold">종목 완료 ✓</button>
                </div>
              </div>
            );
          }
          return (
            <div key={ex.exerciseId} onClick={() => startExercise(ex.exerciseId)} className="flex items-center gap-3 px-3.5 py-3 border border-white/[0.07] rounded-[13px] cursor-pointer">
              <span className="mono text-[13px] font-bold text-text-ghost w-4 flex-none">{v.num}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-[#c8c8cc]">{ex.name}</div>
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
