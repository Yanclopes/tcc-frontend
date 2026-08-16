import { Link, Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { ReconsentModal } from './ReconsentModal';

/** Casca comum: navbar no topo, conteúdo roteado no meio, rodapé embaixo. */
export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>
          Desafio ODS · TCC — Sistemas de Informação / UNIDAVI · Levantamento do
          conhecimento sobre os Objetivos de Desenvolvimento Sustentável
        </p>
        <p className="mt-2">
          <Link to="/privacidade" className="font-medium text-slate-600 hover:text-brand-700">
            Política de Privacidade
          </Link>
        </p>
      </footer>
      <ReconsentModal />
    </div>
  );
}
