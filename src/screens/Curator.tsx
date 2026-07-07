import { useEffect, useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";
import { mmss } from "@/lib/format";
import { DEFAULT_ROUTINE_ID, getRoutineDetail, updateRoutineItemTimestamp, type RoutineDetail } from "@/lib/queries";

export function Curator() {
  const goProfile = useAppStore((s) => s.goProfile);
  const session = useAuthStore((s) => s.session);

  const [routine, setRoutine] = useState<RoutineDetail | null>(null);
  const [items, setItems] = useState<{ id: string; name: string; t: number }[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getRoutineDetail(DEFAULT_ROUTINE_ID).then((data) => {
      if (cancelled || !data) return;
      setRoutine(data);
      setItems(data.items.map((it) => ({ id: it.id, name: it.name, t: it.timestampSeconds ?? 0 })));
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function adjustTime(id: string, deltaSec: number) {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const nextT = Math.max(0, item.t + deltaSec);
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, t: nextT } : it)));
    setConfirmedIds((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
    await updateRoutineItemTimestamp(id, nextT);
  }

  function toggleConfirm(id: string) {
    setConfirmedIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  }

  if (!session) {
    return (
      <div className="scr pt-2 px-5 pb-[120px]">
        <div className="text-base font-bold text-text mb-2">로그인이 필요해요</div>
        <div className="text-sm text-text-dim">내정보 화면에서 로그인하면 큐레이터 도구를 쓸 수 있어요.</div>
      </div>
    );
  }

  const confCount = confirmedIds.size;
  const totalDurationSec = routine ? routine.durationMin * 60 : 2400;

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={goProfile} className="w-9 h-9 rounded-[11px] bg-card border border-white/[0.07] text-text text-[17px] flex-none">←</button>
        <div className="flex-1">
          <div className="text-xs font-semibold text-text-dim">큐레이터 도구 · 관리자 전용</div>
          <div className="text-xl font-extrabold text-text tracking-tight mt-0.5">타임스탬프 태깅</div>
        </div>
        <div className="text-right">
          <div className="mono text-xl font-extrabold text-success leading-none">{confCount}<span className="text-text-ghost">/{items.length}</span></div>
          <div className="text-[10px] text-text-faint mt-0.5">확정</div>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/[0.08] bg-black mb-2">
        <div
          className="aspect-video flex items-center justify-center relative"
          style={{ background: "repeating-linear-gradient(135deg,#141416,#141416 12px,#0f0f11 12px,#0f0f11 24px)" }}
        >
          <span className="w-[52px] h-[52px] rounded-full bg-white/10 flex items-center justify-center">
            <span className="w-0 h-0 border-l-[16px] border-l-text border-y-[10px] border-y-transparent ml-1" />
          </span>
          <span className="mono absolute bottom-2.5 left-3 text-[11px] text-text-dim">{routine?.title ?? "로딩 중"}</span>
        </div>
      </div>

      <div className="relative h-[34px] bg-card border border-white/[0.07] rounded-[10px] mb-1.5">
        {items.map((it) => (
          <span
            key={it.id}
            className="absolute top-1.5 bottom-1.5 w-[2.5px] rounded"
            style={{ left: `${((it.t / totalDurationSec) * 100).toFixed(1)}%`, background: confirmedIds.has(it.id) ? "#2fbf71" : "#5a5a60" }}
          />
        ))}
      </div>
      <div className="flex justify-between mb-[22px]">
        <span className="mono text-[11px] text-text-faint">00:00</span>
        <span className="mono text-[11px] text-text-faint">{mmss(totalDurationSec)}</span>
      </div>

      <div className="text-[13px] font-bold text-text-dim uppercase tracking-wide mb-2">AI 추정 · 사람 확정</div>
      <div className="flex flex-col gap-2.5">
        {items.map((it) => {
          const confirmed = confirmedIds.has(it.id);
          return (
            <div
              key={it.id}
              className="px-3.5 py-3 bg-card rounded-2xl border"
              style={{ borderColor: confirmed ? "rgba(47,191,113,.25)" : "rgba(255,255,255,.08)" }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: confirmed ? "#2fbf71" : "#5a5a60" }} />
                <span className="flex-1 min-w-0 text-sm font-bold text-text">{it.name}</span>
                <button
                  onClick={() => toggleConfirm(it.id)}
                  className="w-9 h-9 rounded-full text-[15px] font-extrabold flex-none border-none"
                  style={
                    confirmed
                      ? { background: "#2fbf71", color: "#08120b" }
                      : { background: "#1c1c1f", color: "#4a4a50", border: "1px solid rgba(255,255,255,.12)" }
                  }
                >
                  ✓
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => adjustTime(it.id, -5)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">−5</button>
                <button onClick={() => adjustTime(it.id, -1)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">−1</button>
                <div className="mono flex-1 text-center text-xl font-extrabold text-text">{mmss(it.t)}</div>
                <button onClick={() => adjustTime(it.id, 1)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">+1</button>
                <button onClick={() => adjustTime(it.id, 5)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">+5</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
