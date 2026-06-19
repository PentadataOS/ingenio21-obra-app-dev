export function fmtDate(s?: string | null) {
  if (!s) return "";
  return new Date(s).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
}
export function fmtDateTime(s?: string | null) {
  if (!s) return "";
  return new Date(s).toLocaleString("es-ES", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}
export function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/);
  return (((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || base[0]?.toUpperCase() || "?");
}
export function fmtBytes(n?: number | null) {
  if (!n) return "";
  const u = ["B", "KB", "MB", "GB"]; let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}
