import { Bot, User } from 'lucide-react';
import type { ChatMensagem } from '@/types';
import { cn } from '@/lib/utils';
import { AcaoProposta } from './AcaoProposta';
import { GraficoDaResposta } from './GraficoDaResposta';
import { PassosDoAssistente } from './PassosDoAssistente';

/**
 * Renderiza markdown simples sem dependência nova: negrito, código inline,
 * listas e parágrafos. O assistente é instruído a usar markdown moderado, e
 * trazer uma biblioteca inteira para isso não se paga.
 */
function Markdown({ texto }: { texto: string }) {
  const blocos = texto.split(/\n{2,}/);

  const inline = (linha: string) =>
    linha
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((parte, i) => {
        if (parte.startsWith('**') && parte.endsWith('**')) {
          return <strong key={i}>{parte.slice(2, -2)}</strong>;
        }
        if (parte.startsWith('`') && parte.endsWith('`')) {
          return (
            <code key={i} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px]">
              {parte.slice(1, -1)}
            </code>
          );
        }
        return parte;
      });

  return (
    <div className="space-y-2">
      {blocos.map((bloco, i) => {
        const linhas = bloco.split('\n');
        const ehLista = linhas.every((l) => /^\s*[-*]\s+/.test(l) || /^\s*\d+\.\s+/.test(l));

        if (ehLista) {
          return (
            <ul key={i} className="list-disc space-y-0.5 pl-5">
              {linhas.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*(?:[-*]|\d+\.)\s+/, ''))}</li>
              ))}
            </ul>
          );
        }

        if (/^#{1,6}\s/.test(bloco)) {
          return (
            <p key={i} className="font-bold text-slate-900">
              {inline(bloco.replace(/^#{1,6}\s/, ''))}
            </p>
          );
        }

        return (
          <p key={i} className="whitespace-pre-wrap">
            {inline(bloco)}
          </p>
        );
      })}
    </div>
  );
}

export function Mensagem({ mensagem }: { mensagem: ChatMensagem }) {
  const doUsuario = mensagem.papel === 'usuario';

  return (
    <div className={cn('flex gap-3', doUsuario && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          doUsuario ? 'bg-slate-200 text-slate-600' : 'bg-brand-600 text-white',
        )}
        aria-hidden
      >
        {doUsuario ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'max-w-[min(46rem,85%)] rounded-2xl px-4 py-3 text-sm',
          !doUsuario && (mensagem.graficos?.length || mensagem.acoes?.length) ? 'w-full' : '',
          doUsuario ? 'bg-slate-100 text-slate-800' : 'border border-slate-200 bg-white text-slate-700',
        )}
      >
        <Markdown texto={mensagem.conteudo} />

        {/* Gráficos antes dos passos: são conteúdo da resposta, não auditoria. */}
        {!doUsuario &&
          mensagem.graficos?.map((grafico, i) => (
            <GraficoDaResposta key={`${grafico.fonte}-${i}`} grafico={grafico} />
          ))}

        {/* Ações antes dos passos: exigem decisão, não são auditoria. */}
        {!doUsuario &&
          mensagem.acoes?.map((acao) => <AcaoProposta key={acao.id} acao={acao} />)}

        {!doUsuario && mensagem.passos && <PassosDoAssistente passos={mensagem.passos} />}
      </div>
    </div>
  );
}
