import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * Protege rotas por autenticação e, opcionalmente, por papel.
 * - requireAdmin: exige papel 'admin' ou 'master'.
 * - requireMaster: exige papel 'master' (gestão de outros admins).
 */
export function ProtectedRoute({
  requireAdmin = false,
  requireMaster = false,
}: {
  requireAdmin?: boolean;
  requireMaster?: boolean;
}) {
  const { isAuthenticated, isAdmin, isMaster } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (requireMaster && !isMaster) {
    return <Navigate to="/" replace />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
