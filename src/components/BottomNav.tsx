import { useAppStore } from "@/store/appStore";

const ACTIVE = "#e5484d";
const IDLE = "#5a5a60";

export function BottomNav() {
  const screen = useAppStore((s) => s.screen);
  const goHome = useAppStore((s) => s.goHome);
  const goExplore = useAppStore((s) => s.goExplore);
  const goRecord = useAppStore((s) => s.goRecord);
  const goProfile = useAppStore((s) => s.goProfile);

  const cHome = screen === "home" ? ACTIVE : IDLE;
  const cExplore = screen === "explore" ? ACTIVE : IDLE;
  const cRecord = screen === "record" ? ACTIVE : IDLE;
  const cProfile = screen === "profile" || screen === "curator" ? ACTIVE : IDLE;

  return (
    <div className="flex-none h-[78px] bg-app/92 backdrop-blur-md border-t border-white/[0.07] flex items-start px-2.5 pt-3">
      <button onClick={goHome} className="flex-1 flex flex-col items-center gap-1.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" stroke={cHome} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: cHome }}>홈</span>
      </button>
      <button onClick={goExplore} className="flex-1 flex flex-col items-center gap-1.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke={cExplore} strokeWidth="1.8" />
          <path d="M20 20l-3.5-3.5" stroke={cExplore} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: cExplore }}>탐색</span>
      </button>
      <button onClick={goRecord} className="flex-1 flex flex-col items-center gap-1.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="3" width="16" height="18" rx="2.5" stroke={cRecord} strokeWidth="1.8" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke={cRecord} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: cRecord }}>기록</span>
      </button>
      <button onClick={goProfile} className="flex-1 flex flex-col items-center gap-1.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" stroke={cProfile} strokeWidth="1.8" />
          <path d="M4 21a8 8 0 0 1 16 0" stroke={cProfile} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <span className="text-[10px] font-semibold" style={{ color: cProfile }}>내정보</span>
      </button>
    </div>
  );
}
