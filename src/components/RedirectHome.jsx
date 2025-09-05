import { Navigate } from "react-router-dom";
import { getSession, isAllowedAuthority } from "../utils/auth";

export default function RedirectHome() {
  const s = getSession();
  if (!s) return <Navigate to="/login" replace />;
  if (isAllowedAuthority(s.authority)) return <Navigate to="/dashboard" replace />;
  if (s.center_id) return <Navigate to={`/detail/${encodeURIComponent(s.center_id)}`} replace />;
  if (isAllowedAuthority(s.authority) && !s.center_id) return <Navigate to={`/login`} replace />;
  return <Navigate to="/login" replace />;
}
