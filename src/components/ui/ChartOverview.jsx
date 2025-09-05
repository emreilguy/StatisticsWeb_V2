import React, { useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function ChartOverview({
  series = [],
  selectedTimeFilter = "7 Days",
  overrideTodayValue = null,
}) {
  const now = useMemo(() => new Date(), []);

  // Helpers لتوليد مفاتيح محلية
  const pad = (n) => String(n).padStart(2, "0");

  const localDateKey = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const localHourKey = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:00`;



  // Buckets حسب الفلتر
  const buckets = useMemo(() => {
    const items = [];

    if (selectedTimeFilter === "24 Hours") {
      const end = new Date(now);
      const start = new Date(end);
      start.setHours(end.getHours() - 23, 0, 0, 0);

      for (let i = 0; i < 24; i++) {
        const t = new Date(start);
        t.setHours(start.getHours() + i, 0, 0, 0);
        items.push({
          key: localHourKey(t),
          label: `${pad(t.getHours())}:00`,
        });
      }

      return { granularity: "hour", items };
    }

    if (selectedTimeFilter === "7 Days") {
      const end = new Date(now);
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        items.push({
          key: localDateKey(d),
          label: `${dayNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`,
        });
      }

      return { granularity: "day", items };
    }

    if (selectedTimeFilter === "30 Days") {
      const end = new Date(now);
      end.setHours(0, 0, 0, 0);
      const start = new Date(end);
      start.setDate(end.getDate() - 29);

      for (let i = 0; i < 30; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        items.push({
          key: localDateKey(d),
          label: `${d.getMonth() + 1}/${d.getDate()}`,
        });
      }

      return { granularity: "day", items };
    }

    return { granularity: "auto", items: [] };
  }, [selectedTimeFilter, now]);

  // تجميع البيانات
  const data = useMemo(() => {
    const hourKey = (d) => {
      const t = new Date(d);
      t.setMinutes(0, 0, 0);
      return localHourKey(t);
    };

    const dayKey = (d) => localDateKey(new Date(d));

    if (buckets.granularity === "auto") {
      const byDay = new Map();

      for (const ev of series) {
        const d = new Date(ev.date);
        if (isNaN(d)) continue;
        const k = localDateKey(d);
        byDay.set(k, (byDay.get(k) || 0) + Number(ev.visitors ?? 0));
      }

      // ✨ تحديث اليوم الحالي بالقيمة الفعلية لو في أكثر من حدث مفقود أو تأخير
      const today = new Date();
      const todayKey = localDateKey(today);

      // اجمع القيمة الحقيقية لليوم الحالي من الـ series
      const todayTotal = series.reduce((sum, ev) => {
        const d = new Date(ev.date);
        const k = localDateKey(d);
        return k === todayKey ? sum + Number(ev.visitors || 0) : sum;
      }, 0);

      // تحديث القيمة داخل الماب
      const finalTodayValue = overrideTodayValue ?? todayTotal;
      byDay.set(todayKey, finalTodayValue);


      // ترتيب
      const entries = Array.from(byDay.entries()).sort((a, b) =>
        a[0].localeCompare(b[0])
      );

      return entries.map(([k, v]) => {
        return { x: k, visitors: v };
      });


    }


    const bucketMap = new Map(buckets.items.map((b) => [b.key, 0]));

    for (const ev of series) {
      const d = new Date(ev.date);
      if (isNaN(d)) continue;

      let k = buckets.granularity === "hour" ? hourKey(d) : dayKey(d);

      if (bucketMap.has(k)) {
        bucketMap.set(k, bucketMap.get(k) + Number(ev.visitors ?? 0));
      }
    }

    return buckets.items.map((b) => ({
      x: b.label,
      visitors: bucketMap.get(b.key) || 0,
    }));
  }, [series, buckets]);

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="visitorsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis
            dataKey="x"
            // Sadece auto modunda kategori çakışmalarını engelle
            allowDuplicatedCategory={buckets.granularity === "auto" ? false : true}
            tickFormatter={(k) => {
              if (buckets.granularity === "auto") {
                // k = 'YYYY-MM-DD' → burada tarih formatla (yıl dahil)
                const d = new Date(k);
                return `${d.getMonth() + 1}/${d.getDate()}`; // istersen buraya yıl da ekleyebilirsin
              }
              // 24h/7g/30g: k zaten 'HH:00' veya 'M/D' → direkt göster
              return String(k);
            }}
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
            tickMargin={8}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              backdropFilter: "blur(6px)",
              color: "#fff",
            }}
            labelStyle={{ color: "#93C5FD" }}
            labelFormatter={(k) => {
              if (buckets.granularity === "auto") {
                const d = new Date(k); // k = 'YYYY-MM-DD'
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              }
              // 24h/7g/30g: label zaten hazır (HH:00 / M/D)
              return String(k);
            }}
            formatter={(value) => [Number(value).toLocaleString(), "Visitors"]}
          />
          <XAxis
            dataKey="x"
            // Sadece auto modunda kategori çakışmalarını engelle
            allowDuplicatedCategory={buckets.granularity === "auto" ? false : true}
            tickFormatter={(k) => {
              if (buckets.granularity === "auto") {
                // k = 'YYYY-MM-DD' → burada tarih formatla (yıl dahil)
                const d = new Date(k);
                return `${d.getMonth() + 1}/${d.getDate()}`; // istersen buraya yıl da ekleyebilirsin
              }
              // 24h/7g/30g: k zaten 'HH:00' veya 'M/D' → direkt göster
              return String(k);
            }}
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
            tickMargin={8}
          />

          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              backdropFilter: "blur(6px)",
              color: "#fff",
            }}
            labelStyle={{ color: "#93C5FD" }}
            labelFormatter={(k) => {
              if (buckets.granularity === "auto") {
                const d = new Date(k); // k = 'YYYY-MM-DD'
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              }
              // 24h/7g/30g: label zaten hazır (HH:00 / M/D)
              return String(k);
            }}
            formatter={(value) => [Number(value).toLocaleString(), "Visitors"]}
          />

          <Area
            type="monotone"
            dataKey="visitors"
            stroke="#60A5FA"
            strokeWidth={2}
            fill="url(#visitorsFill)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {data.length === 0 && (
        <div className="flex items-center justify-center h-full -mt-80">
          <div className="text-center opacity-70">
            <div className="text-5xl mb-3">📈</div>
            <p>No data for the selected range</p>
          </div>
        </div>
      )}
    </div>
  );
}
