import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/** Select acessível (Radix) com estilo Tailwind. */
export function Select({
  value,
  onValueChange,
  options,
  placeholder = 'Selecione…',
  className,
  disabled,
}: SelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger
        className={cn(
          'inline-flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900',
          'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-100',
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className={cn(
                  'relative flex cursor-pointer select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-slate-800',
                  'data-[highlighted]:bg-brand-50 data-[highlighted]:outline-none',
                )}
              >
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                  <Check className="h-4 w-4 text-brand-600" />
                </SelectPrimitive.ItemIndicator>
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
