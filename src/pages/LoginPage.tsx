import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';

export function LoginPage() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/jogar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast('Bem-vindo de volta!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      toast(extractError(err, 'Não foi possível entrar.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-extrabold text-slate-900">Entrar</h1>
      <Card>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@escola.edu.br"
              />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Spinner /> : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-slate-600">
        Ainda não tem conta?{' '}
        <Link to="/registrar" className="font-semibold text-brand-700 hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
