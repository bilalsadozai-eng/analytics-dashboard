import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastMessage { id: string; message: string; type: ToastType; }

let addToastFn: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  addToastFn?.({ message, type });
}

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };
const STYLES = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  error:   'border-red-500/30 bg-red-500/10 text-red-400',
  info:    'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (msg) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...msg, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-glass text-sm font-medium animate-slide-up ${STYLES[t.type]}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="text-white">{t.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} className="ml-2 opacity-60 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
          </div>
        );
      })}
    </div>
  );
}
