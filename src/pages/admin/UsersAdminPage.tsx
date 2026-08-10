import { Crown, Shield, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { cn } from '@/lib/utils';
import { usersAdminService } from '@/services/admin.service';
import type { AdminUser, Role } from '@/types';

const ROLE_META: Record<Role, { label: string; icon: typeof UserIcon; cls: string }> = {
  user: { label: 'Usuário', icon: UserIcon, cls: 'bg-slate-100 text-slate-600' },
  admin: { label: 'Admin', icon: ShieldCheck, cls: 'bg-brand-100 text-brand-700' },
  master: { label: 'Master', icon: Crown, cls: 'bg-amber-100 text-amber-700' },
};

export function UsersAdminPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = () => usersAdminService.list().then(setUsers);

  useEffect(() => {
    load()
      .catch((err) => toast(extractError(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRole = async (u: AdminUser, role: 'user' | 'admin') => {
    setBusyId(u.id);
    try {
      await usersAdminService.setRole(u.id, role);
      toast(`${u.name} agora é ${role === 'admin' ? 'admin' : 'usuário'}.`, 'success');
      await load();
    } catch (err) {
      toast(extractError(err), 'error');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <FullPageSpinner label="Carregando usuários…" />;

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-900">
          <Crown className="h-6 w-6 text-amber-500" /> Usuários e permissões
        </h1>
        <p className="text-sm text-slate-600">
          Como <strong>master</strong>, você concede ou revoga o acesso de administrador. O papel
          master é único e não pode ser alterado por aqui.
        </p>
      </div>

      <Input
        placeholder="Buscar por nome ou e-mail…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      <Card>
        <CardContent className="space-y-1">
          <ul className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const role = (u.role?.name ?? 'user') as Role;
              const meta = ROLE_META[role];
              const Icon = meta.icon;
              return (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('grid h-9 w-9 place-items-center rounded-lg', meta.cls)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">
                        {u.email}
                        {u.school ? ` · ${u.school.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', meta.cls)}>
                      {meta.label}
                    </span>
                    {role === 'master' ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : role === 'admin' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busyId === u.id}
                        onClick={() => changeRole(u, 'user')}
                      >
                        <UserIcon className="h-4 w-4" /> Revogar admin
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled={busyId === u.id}
                        onClick={() => changeRole(u, 'admin')}
                      >
                        <Shield className="h-4 w-4" /> Tornar admin
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {filtered.length === 0 && (
            <p className="py-6 text-center text-sm text-slate-500">Nenhum usuário encontrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
