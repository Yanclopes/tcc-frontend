import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { TOKEN_KEY } from '@/lib/api';
import { authService, type RegisterPayload } from '@/services/auth.service';
import { userService } from '@/services/user.service';
import type { AuthUser } from '@/types';

const USER_KEY = 'ods_user';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMaster: boolean;
  /** True quando a ultima sugestao de escola foi rejeitada. */
  needsSchoolReregistration: boolean;
  /** True quando a versao vigente do termo LGPD ainda nao foi aceita. */
  needsConsentReacceptance: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  /** Re-carrega o perfil do backend (usado ao completar-perfil apos rejeicao). */
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  // Mantém localStorage e estado sincronizados.
  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      // O master faz tudo do admin (super-admin), entao tambem conta como admin.
      isAdmin: user?.role === 'admin' || user?.role === 'master',
      isMaster: user?.role === 'master',
      needsSchoolReregistration: !!user?.needsSchoolReregistration,
      needsConsentReacceptance: !!user?.needsConsentReacceptance,
      async login(email, password) {
        const res = await authService.login(email, password);
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        setUser(res.user);
      },
      async register(payload) {
        const res = await authService.register(payload);
        localStorage.setItem(TOKEN_KEY, res.accessToken);
        setUser(res.user);
      },
      async refreshUser() {
        const me = await userService.me();
        setUser((prev) =>
          prev
            ? {
                ...prev,
                needsSchoolReregistration: me.needsSchoolReregistration,
                schoolRejectionReason: me.schoolRejectionReason,
                needsConsentReacceptance: me.needsConsentReacceptance,
                currentConsentVersion: me.currentConsentVersion,
              }
            : prev,
        );
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
