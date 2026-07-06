// 로컬 Supabase 스택 기동 후 실제 타입으로 대체:
//   npm run db:types   (= supabase gen types typescript --local > src/types/database.ts)
// 그 전까지 컴파일이 통과하도록 두는 최소 플레이스홀더.
export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      body_part:
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "arms"
        | "core"
        | "glutes"
        | "full_body";
      routine_status: "draft" | "published";
    };
  };
};
