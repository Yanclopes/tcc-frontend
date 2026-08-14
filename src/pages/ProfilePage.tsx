import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, Download, Trash2, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { userService } from '@/services/user.service';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await userService.exportMyData();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `desafio-ods-meus-dados-${user?.id ?? ''}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast('Seus dados foram baixados com sucesso.', 'success');
    } catch (err) {
      toast(extractError(err, 'Não foi possível baixar seus dados.'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!password) {
      toast('Informe sua senha para confirmar.', 'error');
      return;
    }
    setDeleting(true);
    try {
      await userService.deleteMyAccount(password);
      toast('Sua conta foi excluída. Sentiremos sua falta.', 'success');
      setDeleteOpen(false);
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      toast(extractError(err, 'Não foi possível excluir a conta.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100 text-slate-700">
          <UserCircle2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Meu perfil</h1>
          <p className="text-sm text-slate-500">Seus dados e controles de privacidade</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados básicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Nome" value={user?.name ?? '—'} />
          <Row label="E-mail" value={user?.email ?? '—'} />
          <Row label="Papel" value={user?.role ?? '—'} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacidade (LGPD)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Você tem direito de baixar todos os dados que a plataforma armazena sobre
            você e de excluir sua conta a qualquer momento. Consulte a{' '}
            <Link to="/privacidade" className="font-medium text-brand-700 hover:underline">
              Política de Privacidade
            </Link>{' '}
            para detalhes.
          </p>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900">Baixar meus dados</p>
                <p className="mt-1 text-xs text-slate-500">
                  Gera um arquivo JSON com perfil, consentimentos, partidas, respostas,
                  ranking e sugestões de escola.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? <Spinner /> : <Download className="h-4 w-4" />}
                Baixar
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-rose-800">Excluir minha conta</p>
                <p className="mt-1 text-xs text-rose-700">
                  Ação irreversível. Remove sua conta e todos os dados vinculados (partidas,
                  respostas, ranking, sugestões).
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-300 text-rose-700 hover:bg-rose-100"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog.Root open={deleteOpen} onOpenChange={setDeleteOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <Dialog.Title className="text-lg font-bold text-slate-900">
                Confirmar exclusão
              </Dialog.Title>
            </div>
            <Dialog.Description className="mb-4 text-sm text-slate-600">
              Esta ação é <strong>irreversível</strong>. Todos os seus dados serão apagados.
              Para confirmar, informe sua senha atual.
            </Dialog.Description>

            <div className="mb-4">
              <Label htmlFor="delete-password">Senha atual</Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deleting}>
                Cancelar
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting || !password}
                className="bg-rose-600 hover:bg-rose-700"
              >
                {deleting ? <Spinner /> : 'Excluir conta permanentemente'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  );
}
