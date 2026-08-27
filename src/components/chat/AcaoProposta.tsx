import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/context/ToastContext';
import { extractError } from '@/lib/api';
import { executarAcao } from '@/services/chat.service';
import type { AcaoProposta as Proposta } from '@/types';

type Estado = 'pendente' | 'executando' | 'confirmada' | 'descartada';

/**
 * Cartão de confirmação de uma ação proposta pelo assistente.
 *
 * O assistente **não executa nada**: ele preenche o formulário e este cartão
 * mostra exatamente o que vai acontecer. A escrita só ocorre no clique em
 * "Confirmar", pelo endpoint administrativo de sempre — com guard, validação e
 * auditoria. Ver `.specs/06-chat-ia.md`, seção "Ações administrativas".
 *
 * O botão de confirmar é deliberadamente o secundário, e os avisos ficam acima
 * dele: a leitura vem antes do clique.
 */
export function AcaoProposta({ acao }: { acao: Proposta }) {
  const { toast } = useToast();
  const [estado, setEstado] = useState<Estado>('pendente');

  const confirmar = async () => {
    setEstado('executando');
    try {
      await executarAcao(acao);
      setEstado('confirmada');
      toast('Ação executada.', 'success');
    } catch (e) {
      setEstado('pendente');
      toast(extractError(e, 'Não foi possível executar a ação.'), 'error');
    }
  };

  const atencoes = acao.avisos.filter((a) => a.nivel === 'atencao');

  return (
    <section
      className="mt-3 overflow-hidden rounded-xl border border-slate-300 bg-white"
      aria-label="Ação proposta"
    >
      <header className="border-b border-slate-200 bg-slate-50 px-4 py-2.5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Ação proposta — nada foi executado ainda
        </p>
        <p className="mt-0.5 text-sm font-semibold text-slate-900">{acao.resumo}</p>
      </header>

      <div className="px-4 py-3">
        <dl className="space-y-1.5 text-sm">
          {acao.detalhes.map((detalhe, i) => (
            // Empilha em tela estreita: uma coluna fixa de rotulo comia metade
            // da largura e o valor ficava num filete de 3 palavras por linha.
            <div key={`${detalhe.rotulo}-${i}`} className="sm:flex sm:gap-2">
              <dt className="text-slate-500 sm:w-36 sm:shrink-0">{detalhe.rotulo}</dt>
              <dd className="min-w-0 break-words text-slate-800 sm:flex-1">{detalhe.valor}</dd>
            </div>
          ))}
        </dl>

        {acao.avisos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {acao.avisos.map((aviso, i) => (
              <li
                key={i}
                className={
                  aviso.nivel === 'atencao'
                    ? 'flex gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-900'
                    : 'flex gap-2 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600'
                }
              >
                {aviso.nivel === 'atencao' ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                {aviso.texto}
              </li>
            ))}
          </ul>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-2.5">
        {estado === 'confirmada' ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <Check className="h-4 w-4" /> Executada
          </p>
        ) : estado === 'descartada' ? (
          <p className="text-sm text-slate-500">Proposta descartada.</p>
        ) : (
          <>
            <Button
              onClick={() => void confirmar()}
              disabled={estado === 'executando'}
              variant="secondary"
              size="sm"
              className="gap-1.5"
            >
              {estado === 'executando' ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Confirmar
            </Button>
            <Button
              onClick={() => setEstado('descartada')}
              disabled={estado === 'executando'}
              variant="ghost"
              size="sm"
              className="gap-1.5"
            >
              <X className="h-3.5 w-3.5" />
              Descartar
            </Button>
            {atencoes.length > 0 && (
              <span className="text-xs text-amber-700 sm:ml-auto">
                {atencoes.length === 1 ? 'Leia o aviso' : `Leia os ${atencoes.length} avisos`} antes
              </span>
            )}
          </>
        )}
      </footer>
    </section>
  );
}
