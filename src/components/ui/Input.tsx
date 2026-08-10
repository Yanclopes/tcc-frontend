import * as LabelPrimitive from '@radix-ui/react-label';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Label = forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900',
        'placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200',
        'disabled:cursor-not-allowed disabled:bg-slate-100',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
