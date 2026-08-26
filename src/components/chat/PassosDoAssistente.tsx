import { useState } from 'react';
import { ChevronDown, Database, Search, TriangleAlert } from 'lucide-react';
import type { PassoDoAssistente } from '@/types';
import { cn } from '@/lib/utils';

/**
 * Mostra o que o assistente fez para chegar à resposta: quais trechos foram
 * recuperados e quais consultas foram executadas.
 *
 * Não é enfeite. É o que torna o RAG auditável — sem isso o pesquisador não
 * tem como saber se a resposta veio da base de conhecimento ou de dado ao vivo,
 * e é exatamente essa distinção que sustenta o uso no artigo.
 */
export function PassosDoAssistente({ passos }: { passos: PassoDoAssistente[] }) {
  const [aberto, setAberto] = useState(false);

  if (!passos.length) return null;

  const recuperacoes = passos.filter((p) => p.tipo === 'recuperacao');
  const ferramentas = passos.filter((p) => p.tipo === 'ferramenta');
  const trechos = recuperacoes.reduce(
    (total, p) => total + (p.tipo === 'recuperacao' ? p.trechos.length : 0),
    0,
  );

  const resumo = [
    `${trechos} trecho${trechos === 1 ? '' : 's'} recuperado${trechos === 1 ? '' : 's'}`,
    ferramentas.length > 0 &&
      `${ferramentas.length} consulta${ferramentas.length === 1 ? '' : 's'} ao banco`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="mt-3 border-t border-slate-200 pt-2">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', aberto && 'rotate-180')} />
        Como cheguei nisso — {resumo}
      </button>

      {aberto && (
        <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
          {passos.map((passo, i) =>
            passo.tipo === 'recuperacao' ? (
              <div key={i}>
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
                  <Search className="h-3.5 w-3.5" /> Base de conhecimento
                </p>
                {passo.trechos.length === 0 ? (
                  <p className="pl-5 text-slate-500">
                    Nada relevante encontrado — a resposta não se apoiou na base.
                  </p>
                ) : (
                  <ul className="space-y-0.5 pl-5">
                    {passo.trechos.map((t, j) => (
                      <li key={j} className="flex items-baseline justify-between gap-3">
                        <span className="truncate text-slate-600">{t.titulo}</span>
                        <span className="shrink-0 font-mono text-[11px] text-slate-400">
                          {t.similaridade.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <div key={i}>
                <p className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700">
                  <Database className="h-3.5 w-3.5" /> Consulta ao banco
                </p>
                <div className="pl-5 text-slate-600">
                  <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">
                    {passo.nome}
                    {Object.keys(passo.argumentos).length > 0 &&
                      `(${JSON.stringify(passo.argumentos)})`}
                  </code>
                  {passo.erro ? (
                    <p className="mt-1 flex items-center gap-1 text-amber-700">
                      <TriangleAlert className="h-3.5 w-3.5" /> {passo.erro}
                    </p>
                  ) : (
                    <span className="ml-2 text-slate-400">→ {passo.resumo}</span>
                  )}
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
