import React from 'react';

interface AlertasHeaderProps {
  activeCount: number;
  expanded: boolean;
  onToggle: () => void;
}

const AlertasHeader: React.FC<AlertasHeaderProps> = ({ activeCount, expanded, onToggle }) => {
  return (
    <div
      onClick={onToggle}
      className="bg-linear-to-r from-red-600 to-red-700 dark:from-red-900 dark:to-red-800 rounded-lg p-4 text-white border border-red-300 dark:border-red-700 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔔</span>
          <h3 className="text-lg font-bold">Alertas do Paciente</h3>
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-500 text-white font-bold text-sm">
              {activeCount}
            </span>
          )}
          <span className={`text-2xl transition-transform ${expanded ? 'rotate-90' : ''}`}>›</span>
        </div>
      </div>
    </div>
  );
};

export default AlertasHeader;
