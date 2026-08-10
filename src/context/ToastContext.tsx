import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ToastKind = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-brand-600" />,
  error: <XCircle className="h-5 w-5 text-rose-600" />,
  info: <Info className="h-5 w-5 text-sky-600" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, kind, message }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-md animate-scale-in items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg',
              t.kind === 'error' ? 'border-rose-200' : 'border-slate-200',
            )}
          >
            {icons[t.kind]}
            <p className="flex-1 text-sm font-medium text-slate-800">{t.message}</p>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>.');
  return ctx;
}
