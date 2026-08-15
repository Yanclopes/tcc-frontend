import { SkipForward, Users, Scissors } from 'lucide-react';
import { cn } from '@/lib/utils';

const POWERUPS = [
  { key: 'fifty', label: '50:50', icon: Scissors, hint: 'Elimina 2 alternativas' },
  { key: 'audience', label: 'Plateia', icon: Users, hint: 'Placar da galera' },
  { key: 'skip', label: 'Trocar', icon: SkipForward, hint: 'Troca por outra pergunta' },
];

/** Barra de power-ups (ajudas). Desabilita os já usados/indisponíveis. */
export function PowerupBar({
  powerups,
  disabled,
  onUse,
}: {
  powerups: Record<string, boolean>;
  disabled?: boolean;
  onUse: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {POWERUPS.map((p) => {
        const available = powerups[p.key];
        return (
          <button
            key={p.key}
            type="button"
            title={p.hint}
            disabled={disabled || !available}
            onClick={() => onUse(p.key)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              available && !disabled
                ? 'border-brand-300 bg-white text-brand-700 hover:bg-brand-50'
                : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through',
            )}
          >
            <p.icon className="h-4 w-4" />
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
