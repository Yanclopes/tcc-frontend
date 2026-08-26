import { BarChart3, Bot, Crown, LogOut, Menu, School, ScrollText, Trophy, UserCircle2, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isMaster, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const links = [
    { to: '/jogar', label: 'Jogar' },
    { to: '/ranking', label: 'Ranking', icon: Trophy },
    ...(isAdmin
      ? [
          { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
          { to: '/admin/chat', label: 'Assistente', icon: Bot },
          { to: '/admin/perguntas', label: 'Perguntas', icon: ScrollText },
          { to: '/admin/escolas', label: 'Escolas', icon: School },
        ]
      : []),
    ...(isMaster ? [{ to: '/admin/usuarios', label: 'Usuários', icon: Crown }] : []),
  ];

  const roleBadge = isMaster ? 'master' : isAdmin ? 'admin' : null;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="ods-stripe h-1 w-full" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            ODS
          </span>
          <span className="hidden sm:inline">Desafio ODS</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100',
                )
              }
            >
              {l.icon && <l.icon className="h-4 w-4" />}
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to="/perfil"
                className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand-700"
              >
                <UserCircle2 className="h-4 w-4" />
                Olá, <strong className="text-slate-900">{user?.name.split(' ')[0]}</strong>
                {roleBadge && (
                  <span
                    className={cn(
                      'ml-1 rounded-full px-2 py-0.5 text-xs text-white',
                      roleBadge === 'master' ? 'bg-amber-500' : 'bg-slate-800',
                    )}
                  >
                    {roleBadge}
                  </span>
                )}
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/registrar">Criar conta</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm font-medium',
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <div className="mt-2 border-t border-slate-100 pt-2">
              {isAuthenticated ? (
                <>
                  <NavLink
                    to="/perfil"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <UserCircle2 className="h-4 w-4" /> Meu perfil
                  </NavLink>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start">
                    <LogOut className="h-4 w-4" /> Sair
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/login" onClick={() => setOpen(false)}>Entrar</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/registrar" onClick={() => setOpen(false)}>Criar conta</Link>
                  </Button>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
