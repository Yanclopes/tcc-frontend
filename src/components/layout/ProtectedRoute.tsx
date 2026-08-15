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
  const { isAuthenticated, isAdmin, isMaster, needsSchoolReregistration } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Sugestao rejeitada → bloqueia tudo ate o aluno reajustar a escola.
  if (needsSchoolReregistration && location.pathname !== '/completar-perfil') {
    return <Navigate to="/completar-perfil" replace />;
  }
  if (requireMaster && !isMaster) {
    return <Navigate to="/" replace />;
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
