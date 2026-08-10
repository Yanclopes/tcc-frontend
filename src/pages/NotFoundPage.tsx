import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-bold text-slate-900">Página não encontrada</h1>
      <p className="mt-1 text-slate-500">O endereço que você tentou acessar não existe.</p>
      <Button className="mt-6" asChild>
        <Link to="/">Voltar ao início</Link>
      </Button>
    </div>
  );
}
