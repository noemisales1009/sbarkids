/**
 * Botão de debug flutuante para acessar página de teste
 */

import React from 'react';

interface DebugFloatingButtonProps {
  onTestClick: () => void;
}

export const DebugFloatingButton: React.FC<DebugFloatingButtonProps> = ({ onTestClick }) => {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <>
      {/* Menu flutuante */}
      {showMenu && (
        <div className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => {
              onTestClick();
              setShowMenu(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
          >
            🧪 Testar Supabase
          </button>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center font-bold transition hover:scale-110"
        title="Debug Menu"
      >
        ⚙️
      </button>
    </>
  );
};
