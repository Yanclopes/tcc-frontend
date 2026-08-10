import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type OptionVisualState = 'idle' | 'selected' | 'correct' | 'wrong' | 'removed';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function OptionButton({
  index,
  text,
  state,
  disabled,
  audiencePercent,
  onClick,
}: {
  index: number;
  text: string;
  state: OptionVisualState;
  disabled?: boolean;
  audiencePercent?: number;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || state === 'removed'}
      onClick={onClick}
      className={cn(
        'relative flex w-full items-center gap-3 overflow-hidden rounded-xl border-2 px-4 py-3.5 text-left transition-all',
        'disabled:cursor-not-allowed',
        state === 'idle' && 'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50',
        state === 'selected' && 'border-brand-500 bg-brand-50',
        state === 'correct' && 'border-emerald-500 bg-emerald-50',
        state === 'wrong' && 'border-rose-500 bg-rose-50 animate-shake',
        state === 'removed' && 'border-slate-100 bg-slate-50 opacity-40',
      )}
    >
      {/* Barra da plateia (power-up audience) */}
      {audiencePercent !== undefined && (
        <span
          className="absolute inset-y-0 left-0 bg-sky-100"
          style={{ width: `${audiencePercent}%` }}
          aria-hidden
        />
      )}

      <span
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-lg font-bold',
          state === 'correct'
            ? 'bg-emerald-500 text-white'
            : state === 'wrong'
              ? 'bg-rose-500 text-white'
              : 'bg-slate-100 text-slate-700',
        )}
      >
        {state === 'correct' ? (
          <Check className="h-5 w-5" />
        ) : state === 'wrong' ? (
          <X className="h-5 w-5" />
        ) : (
          LETTERS[index]
        )}
      </span>

      <span className="relative flex-1 font-medium text-slate-800">{text}</span>

      {audiencePercent !== undefined && (
        <span className="relative text-sm font-semibold text-sky-700">{audiencePercent}%</span>
      )}
    </button>
  );
}
