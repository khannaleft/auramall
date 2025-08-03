import React, { useEffect } from 'react';
import { Toast as ToastType } from '../types';
import Icon from './Icon';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const ICONS: Record<ToastType['type'], React.ComponentProps<typeof Icon>['name']> = {
  success: 'check-circle',
  error: 'x-circle',
  info: 'information-circle',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  const colorClass = 
      toast.type === 'success' ? 'text-green-500' 
    : toast.type === 'error' ? 'text-red-500' 
    : 'text-blue-500';

  return (
    <div className="bg-secondary text-text-primary rounded-xl shadow-2xl p-4 flex items-start gap-4 w-full max-w-sm border border-glass-border animate-fade-in-up">
      <div className={`w-6 h-6 flex-shrink-0 ${colorClass}`}>
        <Icon name={ICONS[toast.type]} className="w-full h-full" />
      </div>
      <p className="flex-grow text-sm font-medium pr-4">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors -mr-1 -mt-1 flex-shrink-0">
        <Icon name="close" className="w-5 h-5 text-text-secondary" />
      </button>
    </div>
  );
};

export default Toast;
