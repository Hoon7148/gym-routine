import { create } from "zustand";
import { initialCurator } from "@/data/mockData";
import { DEFAULT_ROUTINE_ID } from "@/lib/queries";

export type Screen = "home" | "explore" | "detail" | "record" | "profile" | "curator";

interface AppState {
  screen: Screen;
  cold: boolean;
  selectedPart: string;
  selectedCategory: string | null;
  selectedRoutineId: string;
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

  adjustCuratorTime: (id: number, deltaSec: number) => void;
  toggleCuratorConfirm: (id: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screen: "home",
  cold: false,
  selectedPart: "가슴",
  selectedCategory: null,
  selectedRoutineId: DEFAULT_ROUTINE_ID,
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

  adjustCuratorTime: (id, deltaSec) =>
    set((s) => ({
      curator: s.curator.map((c) => (c.id === id ? { ...c, t: Math.max(0, c.t + deltaSec), confirmed: false } : c)),
    })),

  toggleCuratorConfirm: (id) =>
    set((s) => ({
      curator: s.curator.map((c) => (c.id === id ? { ...c, confirmed: !c.confirmed } : c)),
    })),
}));
