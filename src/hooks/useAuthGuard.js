// src/hooks/useAuthGuard.js
import { useEffect } from "react";
import {
  getSession,
  isAllowedAuthority,
  canAccessCenter,
  clearSession,
} from "../utils/auth";
import { useNavigate } from "react-router-dom";

export default function useAuthGuard(centerIdParam) {
  const navigate = useNavigate();
  const session = getSession();
  const isAdmin = isAllowedAuthority(session?.authority);

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    if (isAdmin) return;
    if (!canAccessCenter(session, centerIdParam)) {
      if (session.center_id) {
        navigate(`/detail/${encodeURIComponent(session.center_id)}`, {
          replace: true,
        });
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [centerIdParam, isAdmin, navigate]);

  return {
    session,
    isAdmin,
    logout: () => {
      clearSession();
      navigate("/login", { replace: true });
    },
  };
}
