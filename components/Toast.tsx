import React, { useState, useCallback, createContext, useContext } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
  showPrompt: (title: string, placeholder?: string) => Promise<string | null>;
  showConfirm: (message: string) => Promise<boolean>;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider');
  }
  return context;
};

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
  const [prompt, setPrompt] = useState<{
    visible: boolean;
    title: string;
    placeholder: string;
    value: string;
    resolve: ((value: string | null) => void) | null;
  }>({ visible: false, title: '', placeholder: '', value: '', resolve: null });
  const [confirm, setConfirm] = useState<{
    visible: boolean;
    message: string;
    resolve: ((value: boolean) => void) | null;
  }>({ visible: false, message: '', resolve: null });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const showPrompt = useCallback((title: string, placeholder = ''): Promise<string | null> => {
    return new Promise((resolve) => {
      setPrompt({ visible: true, title, placeholder, value: '', resolve });
    });
  }, []);

  const showConfirm = useCallback((message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirm({ visible: true, message, resolve });
    });
  }, []);

  const showLoading = useCallback((message = 'Atualizando...') => {
    setLoading({ visible: true, message });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({ visible: false, message: '' });
  }, []);

  const handlePromptConfirm = () => {
    prompt.resolve?.(prompt.value.trim() || null);
    setPrompt({ visible: false, title: '', placeholder: '', value: '', resolve: null });
  };

  const handlePromptCancel = () => {
    prompt.resolve?.(null);
    setPrompt({ visible: false, title: '', placeholder: '', value: '', resolve: null });
  };

  const handleConfirmYes = () => {
    confirm.resolve?.(true);
    setConfirm({ visible: false, message: '', resolve: null });
  };

  const handleConfirmNo = () => {
    confirm.resolve?.(false);
    setConfirm({ visible: false, message: '', resolve: null });
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-green-600 text-white';
      case 'error': return 'bg-red-600 text-white';
      case 'warning': return 'bg-yellow-500 text-black';
      case 'info': return 'bg-blue-600 text-white';
    }
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '!';
      case 'info': return 'i';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showPrompt, showConfirm, showLoading, hideLoading }}>
      {children}

      {/* Loading bar */}
      {loading.visible && (
        <div className="fixed top-0 left-0 right-0 z-[10000]">
          <div className="h-1 bg-blue-900/40 overflow-hidden">
            <div className="h-full bg-blue-500 animate-loading-bar" />
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="flex items-center gap-2 bg-gray-900/90 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
              <svg className="animate-spin h-3 w-3 text-blue-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {loading.message}
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${getToastStyles(toast.type)}`}
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-sm font-bold">
              {getToastIcon(toast.type)}
            </span>
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-white/70 hover:text-white text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Modal Prompt */}
      {prompt.visible && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {prompt.title}
            </h3>
            <textarea
              value={prompt.value}
              onChange={(e) => setPrompt(prev => ({ ...prev, value: e.target.value }))}
              placeholder={prompt.placeholder}
              className="w-full h-24 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handlePromptCancel}
                className="flex-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handlePromptConfirm}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm */}
      {confirm.visible && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              {confirm.message}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmNo}
                className="flex-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};
