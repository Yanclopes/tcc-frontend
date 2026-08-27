import { CornerDownLeft } from 'lucide-react';

/**
 * Respostas rápidas: as alternativas que o assistente ofereceu ao terminar
 * perguntando o que fazer.
 *
 * São apenas texto pré-preenchido — clicar envia a frase como uma pergunta
 * normal. **Não executam nada**: quem executa continua sendo o cartão de ação,
 * com sua própria confirmação. A distinção importa, e por isso estes botões são
 * discretos e o de confirmar ação não é.
 */
export function RespostasRapidas({
  opcoes,
  onEscolher,
  desabilitado,
}: {
  opcoes: string[];
  onEscolher: (opcao: string) => void;
  desabilitado?: boolean;
}) {
  if (opcoes.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {opcoes.map((opcao) => (
        <button
          key={opcao}
          type="button"
          onClick={() => onEscolher(opcao)}
          disabled={desabilitado}
          className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs text-slate-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-800 disabled:opacity-50"
        >
          <CornerDownLeft className="h-3 w-3 shrink-0 text-slate-400" aria-hidden />
          {opcao}
        </button>
      ))}
    </div>
  );
}
