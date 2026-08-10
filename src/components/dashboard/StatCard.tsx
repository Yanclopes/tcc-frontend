import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-2xl font-extrabold text-slate-900">{value}</div>
          <div className="text-xs text-slate-500">{label}</div>
          {hint && <div className="text-[11px] text-slate-400">{hint}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
