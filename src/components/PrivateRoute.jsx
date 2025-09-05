import { Navigate, Outlet } from "react-router-dom";
import { getSession } from "../utils/auth";

export default function PrivateRoute() {
  const s = getSession();
  if (!s) return <Navigate to="/login" replace />;
  return <Outlet />;
}
