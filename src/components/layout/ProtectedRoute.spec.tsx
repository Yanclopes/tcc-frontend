import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import { TOKEN_KEY } from '@/lib/api';
import { ProtectedRoute } from './ProtectedRoute';

/**
 * Utilitario: monta as rotas com uma origem inicial arbitraria.
 * A tela "protegida" renderiza um marcador para o teste inspecionar.
 */
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<div>tela de login</div>} />
          <Route path="/" element={<div>home publica</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/jogar" element={<div>tela de jogo</div>} />
            <Route path="/completar-perfil" element={<div>completar perfil</div>} />
          </Route>
          <Route element={<ProtectedRoute requireAdmin />}>
            <Route path="/dashboard" element={<div>dashboard admin</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redireciona para /login quando o usuario nao esta autenticado', () => {
    renderAt('/jogar');
    expect(screen.getByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('tela de jogo')).not.toBeInTheDocument();
  });

  it('libera a rota autenticada quando ha usuario no localStorage', () => {
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    localStorage.setItem(
      'ods_user',
      JSON.stringify({ id: 1, name: 'Yan', email: 'yan@test', role: 'user' }),
    );
    renderAt('/jogar');
    expect(screen.getByText('tela de jogo')).toBeInTheDocument();
  });

  it('bloqueia rota admin para usuario comum (redireciona pra /)', () => {
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    localStorage.setItem(
      'ods_user',
      JSON.stringify({ id: 1, name: 'Yan', email: 'yan@test', role: 'user' }),
    );
    renderAt('/dashboard');
    expect(screen.getByText('home publica')).toBeInTheDocument();
    expect(screen.queryByText('dashboard admin')).not.toBeInTheDocument();
  });

  it('libera rota admin quando o papel e admin', () => {
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    localStorage.setItem(
      'ods_user',
      JSON.stringify({ id: 1, name: 'Yan', email: 'yan@test', role: 'admin' }),
    );
    renderAt('/dashboard');
    expect(screen.getByText('dashboard admin')).toBeInTheDocument();
  });

  it('redireciona pra /completar-perfil quando sugestao de escola foi rejeitada', () => {
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    localStorage.setItem(
      'ods_user',
      JSON.stringify({
        id: 1,
        name: 'Yan',
        email: 'yan@test',
        role: 'user',
        needsSchoolReregistration: true,
        schoolRejectionReason: 'Nome muito generico',
      }),
    );
    renderAt('/jogar');
    expect(screen.getByText('completar perfil')).toBeInTheDocument();
    expect(screen.queryByText('tela de jogo')).not.toBeInTheDocument();
  });

  it('libera /completar-perfil enquanto a flag esta ativa (evita loop de redirect)', () => {
    localStorage.setItem(TOKEN_KEY, 'fake-token');
    localStorage.setItem(
      'ods_user',
      JSON.stringify({
        id: 1,
        name: 'Yan',
        email: 'yan@test',
        role: 'user',
        needsSchoolReregistration: true,
      }),
    );
    renderAt('/completar-perfil');
    expect(screen.getByText('completar perfil')).toBeInTheDocument();
  });
});
