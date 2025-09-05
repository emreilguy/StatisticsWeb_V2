// src/pages/DetailsPage.jsx
import React, { useMemo, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
//import { Settings } from "lucide-react";
import useBaseTables from "../hooks/useBaseTables";
import { GetPhoto } from "../constants/AwsUtils";
import DateRangePicker from "../components/DateRangePicker";
import { normalizeDate, normalizeHour, onlyFile, toInt } from "../utils/detailsformat";
import exportToExcel from "../utils/detailsexportToExcel";
import useDateRangeFilter from "../hooks/useDateRangeFilter";
import usePreviewHeight from "../hooks/usePreviewHeight";
import RecordsTable from "../components/details/RecordsTable";
import LiveDetectionPanel from "../components/details/LiveDetectionPanel";
import DailyUsersChart from "../components/details/DailyUsersChart";
import MovieStatsChart from "../components/details/MovieStatsChart";
import useCenterProfile from "../hooks/useCenterProfile";
import AccountPopover from "../components/AccountPopover";
import { getSession, isAllowedAuthority, clearSession, canAccessCenter } from "../utils/auth";



export default function DetailsPage() {
  const { statistics = [], location } = useBaseTables();
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const { centerId: centerIdParam } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  //  const centerName = state?.row?.centerName ?? "—";

  const centerIdFromState = state?.row?.center_id || state?.row?.centerId || state?.center_id;
  const effectiveCenterId = centerIdParam || centerIdFromState || "";

  //console.log(centerIdParam);
  const matchedItem = location.find(item => item.id === centerIdParam);
  const centerName = matchedItem ? matchedItem.name : "";
  const { profile, isLoading } = useCenterProfile(effectiveCenterId);
  const { rangeUI, setRangeUI, dateFilter } = useDateRangeFilter();

  const allRowsForCenter = useMemo(() => {
    const filtered = (statistics || []).filter((r) => {
      if (!effectiveCenterId) return true;
      const byField = r.center_id && String(r.center_id) === String(effectiveCenterId);
      const byPhotoPrefix = r.photo_name && String(r.photo_name).includes("___") && String(r.photo_name).startsWith(String(effectiveCenterId));
      return byField || byPhotoPrefix;
    });

    const mapped = filtered.map((r) => {
      const date = normalizeDate(r.date);
      const hour = normalizeHour(r.hour);
      const photo = onlyFile(r.photo_name);
      const seats = toInt(r.seats_occupied);
      const movie = r.movie_name || "—";
      const sortKey = new Date(`${date}T${hour || "00:00:00"}`).getTime() || 0;
      const photoKey = r.photo_name || "";
      return { photo, photoKey, seats, movie, date, hour, sortKey };
    });

    return mapped.sort((a, b) => b.sortKey - a.sortKey);
  }, [statistics, effectiveCenterId]);

  const filteredRowsByDate = useMemo(() => {
    const { from, to } = dateFilter || {};
    if (!from || !to) return allRowsForCenter;
    return allRowsForCenter.filter((r) => {
      if (!r.date) return false;
      const [y, m, d] = r.date.split("-").map(Number);
      const ms = Date.UTC(y, (m || 1) - 1, d || 1);
      return ms >= from && ms <= to;
    });
  }, [allRowsForCenter, dateFilter]);

  const tableCardWrapRef = useRef(null);
  const previewHeight = usePreviewHeight(tableCardWrapRef, [filteredRowsByDate, selectedPhoto, dateFilter]);

  const handleClickPhoto = async (row) => {

    try {
      const candidates = buildPhotoKeyCandidates(row, effectiveCenterId);
      const { url /*, key*/ } = await resolvePhotoUrl(GetPhoto, candidates);
      setSelectedPhoto(url);
    } catch (err) {
      setSelectedPhoto(null);

    }
  };


  const handleExportFiltered = (rows) =>
    exportToExcel(rows, { centerName, effectiveCenterId, dateFilter, scope: "filtered" });

  const handleExportPage = (rows) =>
    exportToExcel(rows, { centerName, effectiveCenterId, dateFilter, scope: "page" });


  const session = getSession();
  const isAdmin = isAllowedAuthority(session?.authority);



  React.useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }

    // allow admins to see any center
    if (isAllowedAuthority(session.authority)) {
      return;
    }

    // normal user: must match his own center
    if (!canAccessCenter(session, centerIdParam)) {
      if (session.center_id) {
        navigate(`/detail/${encodeURIComponent(session.center_id)}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [centerIdParam, navigate]);





  function buildPhotoKeyCandidates(row, effectiveCenterId) {
    const raw = row.photoKey || row.photo || "";
    const justFile = raw.split("___").pop().split("/").pop();

    return [
      `${effectiveCenterId}___${justFile}`, // الشكل الأول
      justFile                              // الشكل الثاني
    ];
  }
  async function resolvePhotoUrl(GetPhoto, candidates) {
    for (const key of candidates) {
      console.log("Trying photo key:", key);
      try {
        const url = await GetPhoto(key);
        if (url) return { url, key };
      } catch (_) {
        // جرب المفتاح اللي بعده
      }
    }
    throw new Error("No valid photo key found");
  }





  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {isAdmin ? (

            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
          ) : (
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => {
                clearSession();
                //navigate("/login", { replace: true });
              }}
            >
              Logout
            </Button>
          )}

          <h1 className="text-2xl font-semibold">
            {centerName}
          </h1>
        </div>

        {isLoading ? (
          <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse" />
        ) : (
          <AccountPopover
            profile={profile}
            isAdmin={isAdmin}
            onLogout={() => {
              clearSession();
              navigate("/login", { replace: true });
            }}
          />
        )}

      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <DateRangePicker value={rangeUI} onChange={setRangeUI} />
            </div>

            {/* <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
                🔽 Filter
              </Button>
              <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10" onClick={() => setRangeUI({ from: null, to: null })}>
                Clear
              </Button>
            </div> */}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start mb-6">
        <RecordsTable
          ref={tableCardWrapRef}
          rows={filteredRowsByDate}
          onClickPhoto={handleClickPhoto}
          onExportFiltered={handleExportFiltered}
          onExportPage={handleExportPage}
        />

        <div className="xl:col-span-1">
          <div className="sticky top-24" style={{ height: previewHeight || undefined }}>
            <LiveDetectionPanel file={selectedPhoto} onClear={() => setSelectedPhoto(null)} fullHeight />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyUsersChart rows={filteredRowsByDate} />
        <MovieStatsChart rows={filteredRowsByDate} />
      </div>
    </div>
  );
}
