import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// .env(.local)에 VITE_SUPABASE_URL/ANON_KEY가 아직 없으면(Supabase 프로젝트 생성 전)
// createClient가 즉시 throw하므로, 그 전까지는 null로 두고 호출부에서 방어한다.
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient<Database>(supabaseUrl, supabaseKey, {
        auth: {
          // Supabase 서버는 OAuth를 항상 PKCE로 처리하므로 클라이언트도 PKCE로 맞춤.
          flowType: "pkce",
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      })
    : null;
