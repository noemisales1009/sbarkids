import React from 'react';

interface TabContentProps {
  title: string;
  addButtonLabel?: string;
  onAddClick?: () => void;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}

const TabContent: React.FC<TabContentProps> = ({
  title,
  addButtonLabel,
  onAddClick,
  isEmpty,
  emptyMessage,
  children,
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h4>
      {addButtonLabel && onAddClick && (
        <button
          onClick={onAddClick}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          {addButtonLabel}
        </button>
      )}
    </div>
    {isEmpty ? (
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">{emptyMessage}</p>
    ) : (
      children
    )}
  </div>
);

export default TabContent;
