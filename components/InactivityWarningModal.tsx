import React from 'react';

interface InactivityWarningModalProps {
  remainingSeconds: number;
  onExtend: () => void;
  onLogout: () => void;
}

const InactivityWarningModal: React.FC<InactivityWarningModalProps> = ({
  remainingSeconds,
  onExtend,
  onLogout,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-4xl mb-3">⏰</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Sessão expirando
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Você está inativo há algum tempo. Por segurança dos dados dos pacientes,
            sua sessão será encerrada em:
          </p>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-6">
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
            >
              Sair agora
            </button>
            <button
              onClick={onExtend}
              className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Continuar usando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InactivityWarningModal;
