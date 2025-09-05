const SESSION_KEY = "dof_user";

export function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAllowedAuthority(authority) {
  if (!authority) return false;
  const a = String(authority).toLowerCase();
  return a === "admin" || a === "super admin";
}

// Check if the user can access a specific center
export function canAccessCenter(session, centerId) {
  if (!session) return false;
  if (isAllowedAuthority(session.authority)) return true;
  return session.center_id && String(session.center_id) === String(centerId);
}

