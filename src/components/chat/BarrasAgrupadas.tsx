import type { ItemDoGrafico, SerieDoGrafico } from '@/types';

/**
 * Duas medidas da mesma unidade, lado a lado por categoria.
 *
 * Uma escala só — as duas séries são contagens comparáveis. Duas escalas no
 * mesmo gráfico inventariam uma correlação que não está no dado.
 *
 * A legenda é obrigatória com duas séries, e o valor aparece ao lado de cada
 * barra: a cor nunca é a única forma de identificar a série.
 */
export function BarrasAgrupadas({
  itens,
  series,
  formatar,
}: {
  itens: ItemDoGrafico[];
  series: SerieDoGrafico[];
  formatar: (valor: number) => string;
}) {
  const maior = Math.max(...series.flatMap((s) => s.valores), 0);

  if (itens.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">Sem dados para exibir.</p>;
  }

  return (
    <div>
      <ul className="mb-3 flex flex-wrap gap-x-4 gap-y-1">
        {series.map((serie) => (
          <li key={serie.nome} className="flex items-center gap-1.5 text-xs text-slate-600">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: serie.cor }}
              aria-hidden
            />
            {serie.nome}
          </li>
        ))}
      </ul>

      <div className="space-y-3">
        {itens.map((item, i) => (
          <div key={`${item.rotulo}-${i}`}>
            <p className="mb-1 truncate text-sm font-medium text-slate-700" title={item.rotulo}>
              {item.rotulo}
            </p>
            {/* Um sulco por série; 2px de respiro entre elas, sem borda. */}
            <div className="space-y-0.5">
              {series.map((serie) => (
                <div key={serie.nome} className="flex items-center gap-2">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${maior > 0 ? Math.max(1, (serie.valores[i] / maior) * 100) : 0}%`,
                        backgroundColor: serie.cor,
                      }}
                    />
                  </div>
                  <span className="w-12 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
                    {formatar(serie.valores[i])}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
