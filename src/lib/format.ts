export function mmss(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.max(0, Math.round(sec % 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function fmt(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}
