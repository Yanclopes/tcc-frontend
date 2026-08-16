import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { userService } from '@/services/user.service';

/**
 * Modal bloqueante para reconsentimento LGPD (L5). Aparece quando a versao
 * atual do termo (backend) e mais recente que a ultima aceita pelo usuario.
 * Fica sobre qualquer rota autenticada — nao ha como dispensar sem aceitar.
 */
export function ReconsentModal() {
  const { user, needsConsentReacceptance, refreshUser } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  if (!user || !needsConsentReacceptance) return null;

  const accept = async () => {
    setSaving(true);
    try {
      await userService.acceptConsent();
      await refreshUser();
      toast('Novo termo aceito. Obrigado!', 'success');
    } catch (err) {
      toast(extractError(err, 'Não foi possível registrar o aceite.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/70 p-4">
      <Card className="w-full max-w-lg">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Termo LGPD atualizado</h3>
              <p className="text-sm text-slate-600">
                A versão vigente da nossa política de privacidade é{' '}
                <span className="font-semibold">{user.currentConsentVersion}</span>, mais recente que a última que você aceitou.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            Para continuar usando a plataforma, é necessário revisar e aceitar novamente o termo.
            Você pode <Link to="/privacidade" className="font-semibold text-brand-700 hover:underline">ler o conteúdo completo aqui</Link>.
          </div>

          <div className="flex justify-end">
            <Button onClick={accept} disabled={saving}>
              {saving ? <Spinner /> : 'Aceitar nova versão'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
