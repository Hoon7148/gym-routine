export type ExerciseStatus = "done" | "active" | "todo";

export interface ExerciseRecord {
  id: number;
  name: string;
  part: string;
  equip: string;
  status: ExerciseStatus;
  sets: [number, number][];
  last: [number, number];
}

export interface CuratorRow {
  id: number;
  name: string;
  t: number;
  confirmed: boolean;
}

export interface RoutineListing {
  name: string;
  part: string;
  meta: string;
  slotId: string;
}
