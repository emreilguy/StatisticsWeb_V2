// src/utils/date.js
export const pad2 = (n) => String(n).padStart(2, "0");

export function toDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value)) return value;

  if (
    typeof value === "object" &&
    ("seconds" in value || "_seconds" in value)
  ) {
    const s = value.seconds ?? value._seconds;
    const d = new Date(Number(s) * 1000);
    return isNaN(d) ? null : d;
  }
  if (typeof value === "number") {
    const n = Number(value);
    const ms = n > 1e12 ? n : n * 1000;
    const d = new Date(ms);
    return isNaN(d) ? null : d;
  }
  if (typeof value === "string") {
    const t = value.trim();
    let d = new Date(t);
    if (!isNaN(d)) return d;

    const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      d = new Date(`${m[3]}-${m[2]}-${m[1]}T00:00:00Z`);
      if (!isNaN(d)) return d;
    }
    const m2 = t.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
    if (m2) {
      d = new Date(`${m2[1]}-${m2[2]}-${m2[3]}T00:00:00Z`);
      if (!isNaN(d)) return d;
    }
    const m3 = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (m3) {
      d = new Date(`${m3[1]}-${m3[2]}-${m3[3]}T00:00:00Z`);
      if (!isNaN(d)) return d;
    }
    return null;
  }
  return null;
}

export function formatDateKey(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate()
  )}`;
}

export function formatYMD(value) {
  const d = toDateSafe(value);
  if (!d) return "—";
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}
