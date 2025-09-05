import { Navigate, Outlet } from "react-router-dom";
import { getSession, isAllowedAuthority } from "../utils/auth";

export default function ProtectedRoute() {
  const s = getSession();
  if (!s || !isAllowedAuthority(s.authority)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
