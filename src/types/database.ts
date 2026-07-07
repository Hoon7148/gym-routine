// 로컬/원격 Supabase 스택에 마이그레이션 적용 후 실제 타입으로 대체 가능:
//   npm run db:types   (= supabase gen types typescript --local > src/types/database.ts)
// 그 전까지는 supabase/migrations/*.sql 스키마를 손으로 옮겨 적은 타입.
export type BodyPart = "chest" | "back" | "legs" | "shoulders" | "arms" | "core" | "glutes" | "full_body";
export type RoutineStatus = "draft" | "published";
export type SplitType = "push" | "pull" | "legs" | "full_body";

export type Database = {
  public: {
    Tables: {
      athletes: {
        Row: {
          id: string;
          name: string;
          youtube_channel_url: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          youtube_channel_url?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["athletes"]["Insert"]>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          youtube_id: string;
          athlete_id: string;
          title: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          caption_lang: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          youtube_id: string;
          athlete_id: string;
          title: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          caption_lang?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          name_ko: string;
          name_en: string | null;
          body_part: BodyPart;
          equipment: string | null;
          aliases: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name_ko: string;
          name_en?: string | null;
          body_part: BodyPart;
          equipment?: string | null;
          aliases?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
        Relationships: [];
      };
      routines: {
        Row: {
          id: string;
          video_id: string;
          title: string;
          body_part: BodyPart;
          split_type: SplitType;
          status: RoutineStatus;
          is_featured: boolean;
          curator_id: string | null;
          published_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          title: string;
          body_part: BodyPart;
          split_type: SplitType;
          status?: RoutineStatus;
          is_featured?: boolean;
          curator_id?: string | null;
          published_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["routines"]["Insert"]>;
        Relationships: [];
      };
      routine_items: {
        Row: {
          id: string;
          routine_id: string;
          exercise_id: string;
          position: number;
          timestamp_seconds: number | null;
          is_warmup: boolean;
          note: string | null;
        };
        Insert: {
          id?: string;
          routine_id: string;
          exercise_id: string;
          position: number;
          timestamp_seconds?: number | null;
          is_warmup?: boolean;
          note?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["routine_items"]["Insert"]>;
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          routine_id: string | null;
          started_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          routine_id?: string | null;
          started_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
        Relationships: [];
      };
      workout_sets: {
        Row: {
          id: string;
          workout_id: string;
          user_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg: number | null;
          reps: number | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          user_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg?: number | null;
          reps?: number | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_sets"]["Insert"]>;
        Relationships: [];
      };
      saved_routines: {
        Row: {
          user_id: string;
          routine_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          routine_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["saved_routines"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_trending_routines: {
        Args: { limit_count?: number };
        Returns: { routine_id: string; workout_count: number }[];
      };
      get_trending_exercises: {
        Args: { limit_count?: number };
        Returns: { exercise_id: string; set_count: number }[];
      };
    };
    Enums: {
      body_part: BodyPart;
      routine_status: RoutineStatus;
      split_type: SplitType;
    };
  };
};
