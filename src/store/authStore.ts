import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  session: Session | null;
  sendMagicLink: (email: string) => Promise<{ error: string | null }>;
  signInWithKakao: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  sendMagicLink: async (email) => {
    if (!supabase) return { error: "Supabase가 아직 설정되지 않았어요." };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  },
  signInWithKakao: async () => {
    if (!supabase) return { error: "Supabase가 아직 설정되지 않았어요." };
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: { redirectTo: window.location.origin },
    });
    return { error: error?.message ?? null };
  },
  signOut: async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    set({ session: null });
  },
}));

if (supabase) {
  supabase.auth.getSession().then(({ data }) => {
    useAuthStore.setState({ session: data.session });
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.setState({ session });
  });
}
