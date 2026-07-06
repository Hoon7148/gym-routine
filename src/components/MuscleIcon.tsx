interface MuscleIconProps {
  hit: "delt" | "pec" | "arm";
  accent: string;
}

const OFF = "#2a2a2e";

export function MuscleIcon({ hit, accent }: MuscleIconProps) {
  const deltFill = hit === "delt" ? accent : OFF;
  const pecFill = hit === "pec" ? accent : OFF;
  const abFill = OFF;
  const armFill = hit === "arm" ? accent : OFF;

  return (
    <svg width="90" height="74" viewBox="0 0 120 100" fill="none">
      <path d="M34 22 C22 22 16 32 18 44 C28 46 38 42 40 32 C40 26 38 22 34 22 Z" fill={deltFill} />
      <path d="M86 22 C98 22 104 32 102 44 C92 46 82 42 80 32 C80 26 82 22 86 22 Z" fill={deltFill} />
      <path d="M44 34 C55 32 58 37 58 46 C58 56 52 60 45 58 C39 56 37 47 39 41 C40 37 41 35 44 34 Z" fill={pecFill} />
      <path d="M76 34 C65 32 62 37 62 46 C62 56 68 60 75 58 C81 56 83 47 81 41 C80 37 79 35 76 34 Z" fill={pecFill} />
      <rect x="50" y="62" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <rect x="61.5" y="62" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <rect x="50" y="73" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <rect x="61.5" y="73" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <rect x="50" y="84" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <rect x="61.5" y="84" width="8.5" height="8.5" rx="2.5" fill={abFill} />
      <path d="M20 48 C14 50 12 62 16 76 C22 76 28 72 28 60 C28 52 26 48 20 48 Z" fill={armFill} />
      <path d="M100 48 C106 50 108 62 104 76 C98 76 92 72 92 60 C92 52 94 48 100 48 Z" fill={armFill} />
    </svg>
  );
}
