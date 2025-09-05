// src/components/DateRangePicker.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "./ui/button";
import '../index.css'
function fmt(d) {
  try { return format(d, "yyyy/MM/dd"); } catch { return ""; }
}

export default function DateRangePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  // Close the date picker when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!btnRef.current) return;
      if (!open) return;
      const panel = document.getElementById("drp-portal-panel");
      if (panel && (panel.contains(e.target) || btnRef.current.contains(e.target))) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Update position of the date picker panel
  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const top = r.bottom + 8;

    const maxLeft = Math.max(8, Math.min(r.left, window.innerWidth - r.width - 8));
    setPos({ top, left: maxLeft, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();
    const onResize = () => updatePos();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open]);

  const label =
    value?.from && value?.to ? `${fmt(value.from)} ~ ${fmt(value.to)}` : "Select date range";

  return (
    <>
      <Button
        ref={btnRef}
        type="button"
        className="w-full justify-between bg-white/5 border border-white/20 text-white hover:bg-white/10"
        onClick={() => setOpen(v => !v)}
      >
        <span className="truncate">{label}</span>
        <CalendarIcon className="h-4 w-4 opacity-70" />
      </Button>

      {open &&
        createPortal(
          <div
            id="drp-portal-panel"
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              width: Math.max(pos.width, 320),
            }}
            className="rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur p-3 shadow-2xl"
          >
            <DayPicker
              //className="flex flex-row gap-4"
              mode="range"
              selected={value}
              onSelect={(rng) => onChange(rng || { from: null, to: null })}
              numberOfMonths={2}
              defaultMonth={value?.from || new Date()}
              weekStartsOn={1}
              styles={{

                root: { color: "rgba(255,255,255,0.95)" },
                caption: { color: "rgba(255,255,255,0.95)" },
                caption_label: { color: "rgba(255,255,255,0.95)", fontWeight: 600 },
                head: { color: "rgba(255,255,255,0.85)" },
                head_cell: { color: "rgba(255,255,255,0.7)", fontWeight: 600 },


                day: { color: "rgba(255,255,255,0.95)" },
                day_today: {
                  color: "white",
                  outline: "2px solid rgba(124,58,237,0.7)",
                  outlineOffset: "2px",
                  borderRadius: 10,
                },
                day_outside: { color: "rgba(255,255,255,0.28)" },
                day_disabled: { color: "rgba(255,255,255,0.28)", opacity: 0.6 },


                nav_button: { color: "white" },
                nav_button_previous: { color: "white" },
                nav_button_next: { color: "white" },

                day_selected: { backgroundColor: "rgba(124,58,237,0.95)", color: "#fff" },
                day_range_start: { backgroundColor: "rgba(124,58,237,0.95)", color: "#fff" },
                day_range_end: { backgroundColor: "rgba(124,58,237,0.95)", color: "#fff" },


                day_range_middle: {
                  backgroundColor: "rgba(124,58,237,0.12)", // كان غامق؛ صار أخف
                  color: "rgba(255,255,255,0.95)",
                },
              }}
            />


            <div className="flex gap-2 mt-3">
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                onClick={() => setOpen(false)}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white hover:bg-white/10"
                onClick={() => onChange({ from: null, to: null })}
              >
                Clear
              </Button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
