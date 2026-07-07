import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useAuthStore } from "@/store/authStore";

export function Profile() {
  const goCurator = useAppStore((s) => s.goCurator);
  const session = useAuthStore((s) => s.session);
  const sendMagicLink = useAuthStore((s) => s.sendMagicLink);
  const signOut = useAuthStore((s) => s.signOut);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSendMagicLink() {
    if (!email) return;
    setStatus("sending");
    const { error } = await sendMagicLink(email);
    if (error) {
      setErrorMessage(error);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="scr pt-2 px-5 pb-[120px]">
      {session ? (
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-[52px] h-[52px] rounded-full bg-card-alt border border-white/[0.08] flex items-center justify-center font-bold text-text-dim text-[17px] flex-none">
            {(session.user.email ?? "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="text-[17px] font-extrabold text-text tracking-tight">{session.user.email}</div>
            <div className="text-xs text-text-dim mt-0.5">웨이트 트레이닝 · 6년차</div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-white/[0.07] rounded-2xl p-4 mb-6">
          <div className="text-[15px] font-bold text-text mb-1">로그인</div>
          <div className="text-xs text-text-dim mb-3">이메일로 로그인 링크를 보내드려요. 비밀번호는 필요 없어요.</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-card-alt border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-text placeholder:text-text-faint mb-2.5"
          />
          <button
            onClick={handleSendMagicLink}
            disabled={!email || status === "sending"}
            className="w-full bg-accent text-white rounded-xl py-2.5 text-sm font-bold disabled:opacity-50"
          >
            {status === "sending" ? "보내는 중…" : "매직링크 보내기"}
          </button>
          {status === "sent" && (
            <div className="text-xs text-success mt-2.5">이메일을 확인해서 로그인 링크를 눌러주세요.</div>
          )}
          {status === "error" && <div className="text-xs text-accent mt-2.5">{errorMessage}</div>}
        </div>
      )}

      <div className="text-xs font-bold text-text-dim uppercase tracking-wide mb-2">도구</div>
      <div onClick={goCurator} className="flex items-center gap-3 p-3.5 bg-card border border-white/[0.07] rounded-2xl cursor-pointer mb-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M20.6 13.4 13 21a2 2 0 0 1-2.8 0l-6.5-6.5a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7.1a2 2 0 0 1 1.4.6l6.9 6.9a2 2 0 0 1 0 2.9z" stroke="#8a8a90" strokeWidth="1.8" strokeLinejoin="round" /><circle cx="8.5" cy="8.5" r="1.6" fill="#8a8a90" /></svg>
        <div className="flex-1 min-w-0">
          <div className="text-[14.5px] font-bold text-text">큐레이터 도구</div>
          <div className="text-[11.5px] text-text-dim mt-px">타임스탬프 태깅 · 관리자 전용</div>
        </div>
        <span className="text-text-faint">›</span>
      </div>

      <div className="text-xs font-bold text-text-dim uppercase tracking-wide mt-[22px] mb-2">계정</div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between py-3.5 px-0.5 border-b border-white/[0.06]">
          <span className="text-sm text-text">기록 데이터 내보내기</span><span className="text-text-faint">›</span>
        </div>
        <div className="flex items-center justify-between py-3.5 px-0.5 border-b border-white/[0.06]">
          <span className="text-sm text-text">알림 설정</span><span className="text-text-faint">›</span>
        </div>
        {session && (
          <div onClick={() => signOut()} className="flex items-center justify-between py-3.5 px-0.5 cursor-pointer">
            <span className="text-sm text-text">로그아웃</span><span className="text-text-faint">›</span>
          </div>
        )}
      </div>
    </div>
  );
}
