import { Route, Routes } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { DashboardPage } from '@/pages/DashboardPage';
import { GamePage } from '@/pages/GamePage';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { RankingPage } from '@/pages/RankingPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { QuestionsAdminPage } from '@/pages/admin/QuestionsAdminPage';
import { SchoolsAdminPage } from '@/pages/admin/SchoolsAdminPage';
import { UsersAdminPage } from '@/pages/admin/UsersAdminPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="registrar" element={<RegisterPage />} />
        <Route path="privacidade" element={<PrivacyPage />} />
        {/* Ranking e aberto (visualizacao publica); jogar e perfil exigem autenticacao. */}
        <Route path="ranking" element={<RankingPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="jogar" element={<GamePage />} />
          <Route path="perfil" element={<ProfilePage />} />
        </Route>
        {/* Área administrativa exige papel admin (ou master). */}
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="admin/escolas" element={<SchoolsAdminPage />} />
          <Route path="admin/perguntas" element={<QuestionsAdminPage />} />
        </Route>
        {/* Gestão de papéis exige master. */}
        <Route element={<ProtectedRoute requireMaster />}>
          <Route path="admin/usuarios" element={<UsersAdminPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
