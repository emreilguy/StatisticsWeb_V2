// src/utils/detailesexportToExcel.js
import * as XLSX from "xlsx";

export default function exportToExcel(rows, { centerName, effectiveCenterId, dateFilter, scope = "all" } = {}) {
  const data = rows.map((r) => ({
    Photo: r.photo || "",
    Seats: r.seats ?? 0,
    Movie: r.movie || "",
    Date: r.date || "",
    Hour: r.hour || "",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const headers = Object.keys(data[0] || { Photo: "", Seats: "", Movie: "", Date: "", Hour: "" });
  ws["!cols"] = headers.map((k) => ({
    wch: Math.max(k.length, ...data.map((d) => String(d[k] ?? "").length)) + 2,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");

  const center = centerName && centerName !== "—" ? centerName : `Center_${effectiveCenterId || "All"}`;
  const rangeLabel =
    dateFilter?.from && dateFilter?.to
      ? `${new Date(dateFilter.from).toISOString().slice(0, 10)}_${new Date(dateFilter.to).toISOString().slice(0, 10)}`
      : "all";

  const filename = `export_${center}_${rangeLabel}_${scope}.xlsx`.replace(/\s+/g, "_");
  XLSX.writeFile(wb, filename);
}
