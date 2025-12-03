const parseAdminEmails = () =>
  (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

export const getUserRole = (session) => session?.user?.systemRole || 'user';

export const isUserBlocked = (session) => Boolean(session?.user?.isBlocked);

export const PERMISSIONS = {
  USERS_TAB: ['support', 'admin'],
  GROUPS_TAB: ['support', 'admin'],
  WITHDRAWALS_TAB: ['finance', 'admin'],
  AUDIT_TAB: ['admin'],
};

export const hasRole = (session, allowedRoles = []) => {
  if (!session?.user) return false;
  if (isUserBlocked(session)) return false;

  const role = getUserRole(session);
  if (allowedRoles.includes(role)) return true;

  // Fallback por email para administradores antigos
  const email = (session.user.email || '').toLowerCase();
  const adminEmails = parseAdminEmails();
  if (allowedRoles.includes('admin') && adminEmails.includes(email)) return true;

  return false;
};
