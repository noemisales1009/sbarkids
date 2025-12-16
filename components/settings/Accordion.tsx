
import React from 'react';

interface AccordionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, icon, children, defaultOpen = false }) => {
    return (
        <details className="group rounded-xl bg-white dark:bg-slate-900/70 shadow-sm overflow-hidden border border-slate-200 dark:border-slate-800" open={defaultOpen}>
            <summary className="flex items-center gap-4 p-4 min-h-14 cursor-pointer focus:outline-none justify-between list-none">
                <div className="flex items-center gap-4">
                    <div className="text-primary flex items-center justify-center rounded-lg shrink-0 size-10">
                        <span className="material-symbols-outlined text-2xl">{icon}</span>
                    </div>
                    <h3 className="text-slate-800 dark:text-slate-200 text-base font-medium leading-normal flex-1 truncate">{title}</h3>
                </div>
                <div className="shrink-0 text-slate-500 dark:text-slate-400 group-open:rotate-90 transition-transform duration-200">
                    <span className="material-symbols-outlined size-7 flex items-center justify-center">chevron_right</span>
                </div>
            </summary>
            <div className="px-4 pb-4 pt-2">
                {children}
            </div>
        </details>
    );
};

export default Accordion;
