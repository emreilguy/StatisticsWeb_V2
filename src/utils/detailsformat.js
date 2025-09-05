// src/utils/detailesformat.js
export const pad2 = (n) => String(n ?? "").padStart(2, "0");

export const normalizeDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).split(/\D+/).map(Number);
  if (!y || !m || !day) return String(d);
  return `${y}-${pad2(m)}-${pad2(day)}`;
};

export const normalizeHour = (h) => {
  if (!h) return "";
  const [H, M, S] = String(h).split(/\D+/).map(Number);
  if (Number.isNaN(H)) return String(h);
  return `${pad2(H)}:${pad2(M ?? 0)}:${pad2(S ?? 0)}`;
};

export const onlyFile = (photo_name) => {
  if (!photo_name) return "";
  const parts = String(photo_name).split("___");
  const file = parts.length > 1 ? parts[1] : parts[0];
  return file.trim();
};

export const toInt = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : 0;
};

export const formatDotDate = (d) => {
  if (!d) return "";
  const [y, m, day] = String(d).includes("-") ? String(d).split("-").map(Number) : String(d).split(/\D+/).map(Number);
  if (!y || !m || !day) return String(d);
  return `${y}.${m}.${day}`;
};
