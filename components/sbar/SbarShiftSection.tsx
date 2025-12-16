
import React, { useState } from 'react';

type Shift = 'morning' | 'afternoon' | 'night';

// Reusing the structure defined in parent or standalone
interface FieldData {
    text: string;
    authorId: string | null;
    authorName: string | null;
    updatedAt: string | null;
}

interface SbarShiftSectionProps {
    title: string;
    placeholders: Record<Shift, string>;
    data: Record<string, FieldData>; // Changed from simple string values
    onValueChange: (shift: Shift, value: string) => void;
    currentUserId: string;
}

const shiftConfig: { key: Shift; label: string; icon: string }[] = [
    { key: 'morning', label: 'Manhã', icon: 'light_mode' },
    { key: 'afternoon', label: 'Tarde', icon: 'wb_twilight' },
    { key: 'night', label: 'Noite', icon: 'dark_mode' },
];

export type ShiftData = Record<string, FieldData>;

const SbarShiftSection: React.FC<SbarShiftSectionProps> = ({ title, placeholders, data, onValueChange, currentUserId }) => {
    const [activeShift, setActiveShift] = useState<Shift>('morning');

    // Determine if the current active shift is locked
    const currentEntry = data[activeShift];
    const isLocked = currentEntry.authorId !== null && currentEntry.authorId !== currentUserId;

    const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!isLocked) {
            onValueChange(activeShift, e.target.value);
        }
    };

    return (
        <div className={`flex flex-col rounded-xl border ${isLocked && currentEntry.text ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50'}`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <p className="text-gray-900 dark:text-white text-base font-medium leading-normal">{title}</p>
                
                {/* Status Badge */}
                {isLocked && currentEntry.text && (
                     <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 animate-fadeIn">
                        <span className="material-symbols-outlined text-amber-700 dark:text-amber-500 text-sm">lock</span>
                        <span className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                            {currentEntry.authorName}
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {shiftConfig.map((shift) => {
                        const hasContent = data[shift.key].text.length > 0;
                        const isShiftLocked = data[shift.key].authorId !== null && data[shift.key].authorId !== currentUserId;
                        
                        return (
                            <button
                                key={shift.key}
                                onClick={() => setActiveShift(shift.key)}
                                className={`relative flex items-center justify-center gap-2 rounded-md py-2 px-3 text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 ${
                                    activeShift === shift.key
                                        ? 'bg-primary text-white shadow'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                                aria-selected={activeShift === shift.key}
                            >
                                <span className="material-symbols-outlined text-base">{shift.icon}</span>
                                <span className="hidden xs:inline">{shift.label}</span>
                                {/* Dot indicator for content */}
                                {hasContent && activeShift !== shift.key && (
                                    <span className={`absolute top-1 right-1 size-2 rounded-full ${isShiftLocked ? 'bg-amber-400' : 'bg-green-500'}`}></span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Mobile Locked Badge (Visible inside content area for small screens) */}
                {isLocked && currentEntry.text && (
                     <div className="sm:hidden flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 mb-1">
                        <span className="material-symbols-outlined text-amber-600 text-lg">lock</span>
                        <p className="text-xs text-amber-800 dark:text-amber-400">
                            Registrado por <strong>{currentEntry.authorName}</strong>
                        </p>
                    </div>
                )}

                {/* Textarea */}
                <label className="flex flex-col w-full relative">
                    <textarea
                        className={`form-input flex w-full min-w-0 flex-1 resize-y overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 border focus:border-primary min-h-28 text-base font-normal leading-normal transition-colors
                            ${isLocked 
                                ? 'bg-transparent border-transparent cursor-not-allowed resize-none text-slate-600 dark:text-slate-400 pl-0 pt-0' 
                                : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary placeholder:text-gray-500 dark:placeholder:text-gray-400 p-3'
                            }`}
                        placeholder={isLocked ? "Nenhuma informação registrada neste turno por este profissional." : placeholders[activeShift]}
                        value={currentEntry.text}
                        onChange={handleValueChange}
                        readOnly={isLocked}
                        key={activeShift} // Force re-render on tab change to reset height/state if needed
                    ></textarea>
                </label>
            </div>
        </div>
    );
};

export default SbarShiftSection;
