import { create } from "zustand";
import { initialCurator, initialRecords } from "@/data/mockData";
import { DEFAULT_ROUTINE_ID } from "@/lib/queries";
import type { ExerciseRecord } from "@/types/domain";

export type Screen = "home" | "explore" | "detail" | "record" | "profile" | "curator";

interface AppState {
  screen: Screen;
  cold: boolean;
  selectedPart: string;
  selectedCategory: string | null;
  selectedRoutineId: string;
  records: ExerciseRecord[];
  curator: typeof initialCurator;

  goHome: () => void;
  goExplore: () => void;
  goRecord: () => void;
  goProfile: () => void;
  goCurator: () => void;
  openDetail: (routineId?: string) => void;
  startRecord: () => void;

  setCold: (cold: boolean) => void;
  selectPart: (part: string) => void;
  selectCategory: (category: string) => void;

  addSet: (id: number) => void;
  completeExercise: (id: number) => void;
  reopenExercise: (id: number) => void;
  startExercise: (id: number) => void;

  adjustCuratorTime: (id: number, deltaSec: number) => void;
  toggleCuratorConfirm: (id: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  cold: false,
  selectedPart: "가슴",
  selectedCategory: null,
  selectedRoutineId: DEFAULT_ROUTINE_ID,
  records: initialRecords,
  curator: initialCurator,

  goHome: () => set({ screen: "home" }),
  goExplore: () => set({ screen: "explore" }),
  goRecord: () => set({ screen: "record" }),
  goProfile: () => set({ screen: "profile" }),
  goCurator: () => set({ screen: "curator" }),
  openDetail: (routineId = DEFAULT_ROUTINE_ID) => set({ screen: "detail", selectedRoutineId: routineId }),
  startRecord: () => set({ screen: "record" }),

  setCold: (cold) => set({ cold }),
  selectPart: (part) => set({ selectedPart: part }),
  selectCategory: (category) =>
    set((s) => ({ selectedCategory: s.selectedCategory === category ? null : category })),

  addSet: (id) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, sets: [...r.sets, [...r.last] as [number, number]] } : r)),
    })),

  completeExercise: (id) =>
    set((s) => {
      const records = s.records.map((r) => (r.id === id ? { ...r, status: "done" as const } : r));
      const hasActive = records.some((r) => r.status === "active");
      if (!hasActive) {
        const next = records.find((r) => r.status === "todo");
        if (next) next.status = "active";
      }
      return { records };
    }),

  reopenExercise: (id) =>
    set((s) => ({
      records: s.records.map((r) => {
        if (r.id === id) return { ...r, status: "active" as const };
        if (r.status === "active") return { ...r, status: "todo" as const };
        return r;
      }),
    })),

  startExercise: (id) =>
    set((s) => ({
      records: s.records.map((r) => {
        if (r.id === id) return { ...r, status: "active" as const };
        if (r.status === "active") return { ...r, status: "todo" as const };
        return r;
      }),
    })),

  adjustCuratorTime: (id, deltaSec) =>
    set((s) => ({
      curator: s.curator.map((c) => (c.id === id ? { ...c, t: Math.max(0, c.t + deltaSec), confirmed: false } : c)),
    })),

  toggleCuratorConfirm: (id) =>
    set((s) => ({
      curator: s.curator.map((c) => (c.id === id ? { ...c, confirmed: !c.confirmed } : c)),
    })),
}));
