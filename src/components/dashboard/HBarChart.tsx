export interface BarItem {
  label: string;
  /** Largura da barra, de 0 a 1. */
  ratio: number;
  /** Texto exibido à direita da barra. */
  valueLabel: string;
  color?: string;
  /** Legenda secundária (ex.: total de respostas). */
  sub?: string;
}

/**
 * Gráfico de barras horizontais leve (sem dependências externas), adequado para
 * o volume do dashboard. Cada barra representa uma categoria (ODS, região…).
 */
export function HBarChart({ items, emptyLabel = 'Sem dados para o filtro atual.' }: {
  items: BarItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={`${it.label}-${i}`}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-medium text-slate-700">{it.label}</span>
            <span className="shrink-0 text-sm font-bold text-slate-900">{it.valueLabel}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.max(2, Math.min(100, it.ratio * 100))}%`,
                backgroundColor: it.color ?? '#10b981',
              }}
            />
          </div>
          {it.sub && <div className="mt-0.5 text-[11px] text-slate-400">{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}
