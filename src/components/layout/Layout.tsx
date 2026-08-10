import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

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
      </footer>
    </div>
  );
}
