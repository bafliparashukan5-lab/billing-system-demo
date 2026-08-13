import React from 'react';
import { useERP } from '../context/ERPContext';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useERP();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const bg = 
          toast.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' :
          toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200' :
          toast.type === 'warning' ? 'bg-amber-950/90 border-amber-500/50 text-amber-200' :
          'bg-slate-900/90 border-brand-500/50 text-brand-200';

        const Icon = 
          toast.type === 'success' ? CheckCircle2 :
          toast.type === 'error' ? XCircle :
          toast.type === 'warning' ? AlertTriangle : Info;

        return (
          <div 
            key={toast.id}
            className={`pointer-events-auto flex items-center space-x-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-semibold animate-in slide-in-from-right duration-200 ${bg}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
