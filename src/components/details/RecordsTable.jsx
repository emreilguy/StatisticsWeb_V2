// src/components/details/RecordsTable.jsx
import React, { forwardRef, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

const ROWS_PER_PAGE = 10;

const RecordsTable = forwardRef(function RecordsTable(
  { rows = [], onClickPhoto, onExportFiltered, onExportPage },
  tableWrapRef
) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalRows = rows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));
  const safePage = Math.min(currentPage, pageCount);
  const start = (safePage - 1) * ROWS_PER_PAGE;
  const end = Math.min(start + ROWS_PER_PAGE, totalRows);
  const pageRows = useMemo(() => rows.slice(start, end), [rows, start, end]);

  return (
    <div ref={tableWrapRef}>
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {/* 👇 SCROLLBAR sınıfları eklendi */}
            <div className="max-h-[1200px] overflow-y-auto custom-scroll">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#233762] to-[#2F3F87]">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-300">PHOTO</th>
                    <th className="text-left p-4 font-medium text-gray-300">SEATS OCCUPIED</th>
                    <th className="text-left p-4 font-medium text-gray-300">MOVIE</th>
                    <th className="text-left p-4 font-medium text-gray-300">DATE</th>
                    <th className="text-left p-4 font-medium text-gray-300">HOUR</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400">
                        No data
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, index) => (
                      <tr
                        onClick={() => onClickPhoto(row)}
                        key={`${row.photo}-${index}`}
                        className={`cursor-pointer border-b border-white/5 hover:bg-white/10 ${index % 2 === 0 ? "bg-white/0" : "bg-white/5"}`}
                      >
                        <td className="p-4">
                          <p type="text">
                            {row.photo || "—"}
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                            {row.seats}
                          </span>
                        </td>
                        <td className="p-4 text-white">{row.movie}</td>
                        <td className="p-4 text-gray-300">{row.date}</td>
                        <td className="p-4 text-gray-300">{row.hour}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-white/10">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => onExportFiltered(rows)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                onClick={() => onExportPage(pageRows)}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Page
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {totalRows === 0 ? "0-0 of 0" : `${start + 1}-${end} of ${totalRows}`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                  onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
                  disabled={safePage >= pageCount}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

export default RecordsTable;
