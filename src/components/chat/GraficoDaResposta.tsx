import { Table2 } from 'lucide-react';
import { useState } from 'react';
import { HBarChart, type BarItem } from '@/components/dashboard/HBarChart';
import { cn, formatInt, formatMs } from '@/lib/utils';
import type { EspecificacaoDeGrafico, FormatoDeValor, ItemDoGrafico } from '@/types';
import { BarrasAgrupadas } from './BarrasAgrupadas';
import { Heatmap } from './Heatmap';

/** Cor única para séries sem identidade própria — a mesma do dashboard. */
const COR_PADRAO = '#0a97d9';

function formatar(valor: number, formato: FormatoDeValor): string {
  if (formato === 'percentual') return `${valor.toFixed(1).replace('.', ',')}%`;
  if (formato === 'tempo') return formatMs(valor);
  return formatInt(valor);
}

/**
 * Tabela equivalente ao gráfico.
 *
 * Não é um extra: o gráfico nunca pode ser a única via de leitura do valor.
 * Quem usa leitor de tela, quem não distingue as cores e quem quer copiar os
 * números precisa desta tabela.
 */
function TabelaDoGrafico({
  itens,
  formato,
}: {
  itens: ItemDoGrafico[];
  formato: FormatoDeValor;
}) {
  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              Item
            </th>
            <th scope="col" className="py-1.5 pr-3 text-right font-medium">
              Valor
            </th>
            <th scope="col" className="py-1.5 font-medium">
              Detalhe
            </th>
          </tr>
        </thead>
        <tbody>
          {itens.map((item, i) => (
            <tr key={`${item.rotulo}-${i}`} className="border-b border-slate-100 last:border-0">
              <td className="py-1.5 pr-3 text-slate-700">{item.rotulo}</td>
              <td className="py-1.5 pr-3 text-right font-semibold tabular-nums text-slate-900">
                {formatar(item.valor, formato)}
              </td>
              <td className="py-1.5 text-slate-400">{item.detalhe ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Tabela equivalente ao heatmap — mesma exigência das barras. */
function TabelaDaMatriz({
  grafico,
  formato,
}: {
  grafico: EspecificacaoDeGrafico;
  formato: FormatoDeValor;
}) {
  const porChave = new Map((grafico.celulas ?? []).map((c) => [`${c.linha}|${c.coluna}`, c]));

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th scope="col" className="py-1.5 pr-3 font-medium">
              Categoria
            </th>
            {grafico.colunas?.map((coluna) => (
              <th key={coluna} scope="col" className="py-1.5 pr-3 text-right font-medium">
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grafico.linhas?.map((linha) => (
            <tr key={linha} className="border-b border-slate-100 last:border-0">
              <th scope="row" className="py-1.5 pr-3 font-normal text-slate-700">
                {linha}
              </th>
              {grafico.colunas?.map((coluna) => {
                const celula = porChave.get(`${linha}|${coluna}`);
                return (
                  <td
                    key={coluna}
                    className="py-1.5 pr-3 text-right tabular-nums text-slate-900"
                  >
                    {celula && celula.valor !== null ? formatar(celula.valor, formato) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Renderiza um gráfico devolvido pelo assistente.
 *
 * Reaproveita o `HBarChart` do dashboard de propósito: o mesmo dado deve ter a
 * mesma aparência nas duas telas. Uma linha só vira número, não barra — gráfico
 * de uma barra é ruído.
 */
export function GraficoDaResposta({ grafico }: { grafico: EspecificacaoDeGrafico }) {
  const [mostrarTabela, setMostrarTabela] = useState(false);

  const barras: BarItem[] = grafico.itens.map((item) => ({
    label: item.rotulo,
    ratio: item.proporcao,
    valueLabel: formatar(item.valor, grafico.formato),
    color: item.cor ?? COR_PADRAO,
    sub: item.detalhe,
  }));

  const unico = grafico.itens[0];

  return (
    <figure className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:p-4">
      <figcaption className="mb-3 flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">{grafico.titulo}</span>
        {grafico.tipo !== 'indicador' && (
          <button
            type="button"
            onClick={() => setMostrarTabela((v) => !v)}
            aria-pressed={mostrarTabela}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs transition',
              mostrarTabela
                ? 'bg-slate-200 text-slate-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
            )}
          >
            <Table2 className="h-3.5 w-3.5" />
            Tabela
          </button>
        )}
      </figcaption>

      {grafico.tipo === 'indicador' ? (
        <div>
          {/* Um valor só: o número é o gráfico. */}
          <p className="text-3xl font-bold text-slate-900">
            {formatar(unico.valor, grafico.formato)}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">{unico.rotulo}</p>
          {unico.detalhe && <p className="text-xs text-slate-400">{unico.detalhe}</p>}
        </div>
      ) : grafico.tipo === 'matriz' ? (
        mostrarTabela ? (
          <TabelaDaMatriz grafico={grafico} formato={grafico.formato} />
        ) : (
          <Heatmap
            celulas={grafico.celulas ?? []}
            linhas={grafico.linhas ?? []}
            colunas={grafico.colunas ?? []}
            formatar={(v) => formatar(v, grafico.formato)}
          />
        )
      ) : grafico.tipo === 'barras_agrupadas' ? (
        mostrarTabela ? (
          <TabelaDoGrafico itens={grafico.itens} formato={grafico.formato} />
        ) : (
          <BarrasAgrupadas
            itens={grafico.itens}
            series={grafico.series ?? []}
            formatar={(v) => formatar(v, grafico.formato)}
          />
        )
      ) : mostrarTabela ? (
        <TabelaDoGrafico itens={grafico.itens} formato={grafico.formato} />
      ) : (
        <HBarChart items={barras} />
      )}

      {grafico.nota && <p className="mt-3 text-xs text-amber-700">{grafico.nota}</p>}

      <p className="mt-1 text-[11px] text-slate-400">
        Dados de <code className="font-mono">{grafico.fonte}</code>, consultados agora.
      </p>
    </figure>
  );
}
