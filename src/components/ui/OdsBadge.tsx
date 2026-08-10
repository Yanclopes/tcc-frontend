import { odsColor, odsName } from '@/lib/ods';
import { cn } from '@/lib/utils';

/** Selo colorido do ODS (número + nome opcional), usando a cor oficial. */
export function OdsBadge({
  number,
  showName = true,
  className,
}: {
  number: number;
  showName?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-white',
        className,
      )}
      style={{ backgroundColor: odsColor(number) }}
    >
      <span className="grid h-4 w-4 place-items-center rounded-full bg-white/25 text-[10px] font-bold">
        {number}
      </span>
      {showName && <span className="max-w-[12rem] truncate">{odsName(number)}</span>}
    </span>
  );
}
