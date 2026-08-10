import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Select com campo de busca — necessario para listas grandes (ex.: 5.570
 * cidades). Filtra por texto (case/acento-insensitivo) e fecha ao clicar fora.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = 'Selecione…',
  emptyText = 'Nada encontrado.',
  disabled,
  className,
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  // Normaliza removendo acentos para busca amigavel.
  const norm = (s: string) =>
    s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    const list = q ? options.filter((o) => norm(o.label).includes(q)) : options;
    return list.slice(0, 100); // limita a renderizacao para nao travar
  }, [options, query]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else setQuery('');
  }, [open]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:cursor-not-allowed disabled:bg-slate-100',
          selected ? 'text-slate-900' : 'text-slate-400',
        )}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-100 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar…"
              className="h-10 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-sm text-slate-400">{emptyText}</p>
            )}
            {filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-800 hover:bg-brand-50',
                  opt.value === value && 'font-semibold text-brand-700',
                )}
              >
                <Check
                  className={cn(
                    'h-4 w-4 shrink-0',
                    opt.value === value ? 'text-brand-600' : 'text-transparent',
                  )}
                />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
            {query.trim() === '' && options.length > filtered.length && (
              <p className="px-3 py-2 text-center text-xs text-slate-400">
                Digite para buscar entre {options.length} opções…
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
