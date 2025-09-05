import { Navigate, Outlet } from "react-router-dom";
import { getSession, isAllowedAuthority } from "../utils/auth";

export default function AdminRoute() {
  const s = getSession();
  if (!s) return <Navigate to="/login" replace />;
  if (!isAllowedAuthority(s.authority)) {
    const target = s.center_id ? `/detail/${encodeURIComponent(s.center_id)}` : "/login";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
