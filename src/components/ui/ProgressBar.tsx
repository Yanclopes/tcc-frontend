import * as Progress from '@radix-ui/react-progress';
import { cn } from '@/lib/utils';

/** Barra de progresso acessível (Radix), usada no HUD do jogo. */
export function ProgressBar({
  value,
  className,
  indicatorClassName,
}: {
  value: number; // 0-100
  className?: string;
  indicatorClassName?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <Progress.Root
      value={clamped}
      className={cn('h-2.5 w-full overflow-hidden rounded-full bg-slate-200', className)}
    >
      <Progress.Indicator
        className={cn('h-full rounded-full bg-brand-500 transition-all duration-500', indicatorClassName)}
        style={{ width: `${clamped}%` }}
      />
    </Progress.Root>
  );
}
