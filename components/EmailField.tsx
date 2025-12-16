
import React from 'react';

interface EmailFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange }) => {
    return (
        <label className="flex flex-col w-full">
            <p className="text-slate-600 dark:text-slate-300 text-base font-medium leading-normal pb-2">E-mail ou ID Profissional</p>
            <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-slate-800 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-primary dark:focus:border-primary h-14 placeholder:text-slate-400 dark:placeholder:text-slate-500 p-[15px] text-base font-normal leading-normal"
                placeholder="Digite seu e-mail ou ID"
                value={value}
                onChange={onChange}
                type="email"
            />
        </label>
    );
};
