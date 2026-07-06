import { useAppStore } from "@/store/appStore";
import { mmss } from "@/lib/format";

const TOTAL_DURATION_SEC = 2400;

export function Curator() {
  const curator = useAppStore((s) => s.curator);
  const goProfile = useAppStore((s) => s.goProfile);
  const adjustCuratorTime = useAppStore((s) => s.adjustCuratorTime);
  const toggleCuratorConfirm = useAppStore((s) => s.toggleCuratorConfirm);

  const confCount = curator.filter((c) => c.confirmed).length;

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={goProfile} className="w-9 h-9 rounded-[11px] bg-card border border-white/[0.07] text-text text-[17px] flex-none">←</button>
        <div className="flex-1">
          <div className="text-xs font-semibold text-text-dim">큐레이터 도구 · 관리자 전용</div>
          <div className="text-xl font-extrabold text-text tracking-tight mt-0.5">타임스탬프 태깅</div>
        </div>
        <div className="text-right">
          <div className="mono text-xl font-extrabold text-success leading-none">{confCount}<span className="text-text-ghost">/{curator.length}</span></div>
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
          <span className="mono absolute bottom-2.5 left-3 text-[11px] text-text-dim">CBUM — PUSH DAY.mp4</span>
        </div>
      </div>

      <div className="relative h-[34px] bg-card border border-white/[0.07] rounded-[10px] mb-1.5">
        {curator.map((c) => (
          <span
            key={c.id}
            className="absolute top-1.5 bottom-1.5 w-[2.5px] rounded"
            style={{ left: `${((c.t / TOTAL_DURATION_SEC) * 100).toFixed(1)}%`, background: c.confirmed ? "#2fbf71" : "#5a5a60" }}
          />
        ))}
      </div>
      <div className="flex justify-between mb-[22px]">
        <span className="mono text-[11px] text-text-faint">00:00</span>
        <span className="mono text-[11px] text-text-faint">40:00</span>
      </div>

      <div className="text-[13px] font-bold text-text-dim uppercase tracking-wide mb-2">AI 추정 · 사람 확정</div>
      <div className="flex flex-col gap-2.5">
        {curator.map((c) => (
          <div
            key={c.id}
            className="px-3.5 py-3 bg-card rounded-2xl border"
            style={{ borderColor: c.confirmed ? "rgba(47,191,113,.25)" : "rgba(255,255,255,.08)" }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className="w-[7px] h-[7px] rounded-full flex-none" style={{ background: c.confirmed ? "#2fbf71" : "#5a5a60" }} />
              <span className="flex-1 min-w-0 text-sm font-bold text-text">{c.name}</span>
              <button
                onClick={() => toggleCuratorConfirm(c.id)}
                className="w-9 h-9 rounded-full text-[15px] font-extrabold flex-none border-none"
                style={
                  c.confirmed
                    ? { background: "#2fbf71", color: "#08120b" }
                    : { background: "#1c1c1f", color: "#4a4a50", border: "1px solid rgba(255,255,255,.12)" }
                }
              >
                ✓
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => adjustCuratorTime(c.id, -5)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">−5</button>
              <button onClick={() => adjustCuratorTime(c.id, -1)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">−1</button>
              <div className="mono flex-1 text-center text-xl font-extrabold text-text">{mmss(c.t)}</div>
              <button onClick={() => adjustCuratorTime(c.id, 1)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">+1</button>
              <button onClick={() => adjustCuratorTime(c.id, 5)} className="mono w-[34px] h-[34px] rounded-lg bg-card-alt border border-white/[0.08] text-text-dim text-[11px] font-bold flex-none">+5</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
