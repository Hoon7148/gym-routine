import type { ReactNode } from "react";
import { useAppStore } from "@/store/appStore";
import { bodyTagDefs, categories, routineDB } from "@/data/mockData";
import { ImageSlot } from "@/components/ImageSlot";

const ACCENT = "#e5484d";
const OFF = "#2a2a2e";

const categoryIcons: Record<string, ReactNode> = {
  푸시: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><rect x="2" y="10.5" width="4" height="6" rx="1" fill="#c8c8cc" /><rect x="6" y="9" width="3" height="9" rx="1" fill="#c8c8cc" /><rect x="9" y="11" width="6" height="5" rx="1" fill="#c8c8cc" /><rect x="15" y="9" width="3" height="9" rx="1" fill="#c8c8cc" /><rect x="18" y="10.5" width="4" height="6" rx="1" fill="#c8c8cc" /></svg>
  ),
  풀: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><line x1="3" y1="4" x2="21" y2="4" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" /><path d="M8 4v3.5M16 4v3.5" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" /><path d="M7 14 5 8M17 14l2-6" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8 12 20l4-12" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  레그: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="2.2" fill="#c8c8cc" /><path d="M12 6.5v6l-4 3v6M12 12.5l4 3v6" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
  전신: (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="4" r="2.2" fill="#c8c8cc" /><path d="M12 6.5v8M5 9.5l7 2 7-2M8 21l4-6.5 4 6.5" stroke="#c8c8cc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ),
};

export function Explore() {
  const selectedPart = useAppStore((s) => s.selectedPart);
  const selectPart = useAppStore((s) => s.selectPart);
  const openDetail = useAppStore((s) => s.openDetail);

  const figTorso = ["어깨", "가슴", "등", "복근"].includes(selectedPart) ? ACCENT : OFF;
  const figArms = selectedPart === "팔" ? ACCENT : OFF;
  const figLegs = selectedPart === "하체" ? ACCENT : OFF;

  const exploreRoutines = routineDB.filter((r) => r.part === selectedPart);

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      <div className="text-[27px] font-extrabold text-text tracking-tight mb-1">탐색</div>
      <div className="text-[13px] text-text-dim mb-4">부위를 눌러 루틴을 찾아보세요</div>

      {/* body map */}
      <div className="relative bg-card border border-white/[0.07] rounded-[20px] h-[330px] overflow-hidden mb-[18px]">
        <svg viewBox="0 0 200 420" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
          <circle cx="100" cy="40" r="24" fill="#2a2a2e" />
          <rect x="92" y="62" width="16" height="12" rx="4" fill="#2a2a2e" />
          <path d="M62 74 Q100 66 138 74 L130 190 Q100 200 70 190 Z" fill={figTorso} />
          <rect x="42" y="78" width="18" height="98" rx="9" fill={figArms} transform="rotate(6 51 127)" />
          <rect x="140" y="78" width="18" height="98" rx="9" fill={figArms} transform="rotate(-6 149 127)" />
          <rect x="74" y="192" width="22" height="130" rx="11" fill={figLegs} />
          <rect x="104" y="192" width="22" height="130" rx="11" fill={figLegs} />
        </svg>
        {bodyTagDefs.map((p) => {
          const active = selectedPart === p.name;
          return (
            <button
              key={p.name}
              onClick={() => selectPart(p.name)}
              className="absolute flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold whitespace-nowrap"
              style={{ top: p.top, left: p.left, background: active ? ACCENT : "rgba(20,20,22,.85)", color: active ? "#ffffff" : "#f4f4f5" }}
            >
              {p.name}
              <span className="text-[11px]">›</span>
            </button>
          );
        })}
      </div>

      {/* category chips */}
      <div className="text-[13px] font-bold text-text-dim uppercase tracking-wide mb-2.5">유형별</div>
      <div className="flex justify-between mb-[22px]">
        {categories.map((c) => (
          <div key={c.name} className="flex flex-col items-center gap-2">
            <div className="w-[60px] h-[60px] rounded-[18px] bg-card border border-white/[0.07] flex items-center justify-center">
              {categoryIcons[c.name]}
            </div>
            <span className="text-xs font-semibold text-[#c8c8cc]">{c.name}</span>
          </div>
        ))}
      </div>

      {/* filtered popular routines */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="text-base font-extrabold text-text tracking-tight">{selectedPart} 인기 루틴</div>
        <span className="text-xs text-text-dim">{exploreRoutines.length}개</span>
      </div>
      {exploreRoutines.map((r) => (
        <div key={r.slotId} onClick={openDetail} className="flex items-center gap-3 bg-card border border-white/[0.07] rounded-2xl p-3 mb-2.5 cursor-pointer">
          <ImageSlot className="w-[60px] h-[60px]" rounded="rounded-[13px]" />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-bold text-text tracking-tight">{r.name}</div>
            <div className="text-xs text-text-dim mt-1">{r.meta}</div>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-none">
            <span className="w-0 h-0 border-l-[9px] border-l-white border-y-[6px] border-y-transparent ml-0.5" />
          </div>
        </div>
      ))}
    </div>
  );
}
