import React, { useState, useCallback, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800';
      case 'error':
        return 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container - Mobile: bottom center, Desktop: top right */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:bottom-auto sm:translate-x-0 sm:top-4 sm:right-4 sm:left-auto z-[100] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border',
              'w-full sm:min-w-[300px] sm:max-w-[400px]',
              'transform transition-all duration-300 animate-in',
              'slide-in-from-bottom-full sm:slide-in-from-bottom-auto sm:slide-in-from-right-full',
              getStyles(toast.type)
            )}
          >
            {getIcon(toast.type)}
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
