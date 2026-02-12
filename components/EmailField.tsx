
import React from 'react';

interface EmailFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange }) => {
    return (
        <label className="flex flex-col w-full">
            <p className="text-base font-medium leading-normal pb-2 text-gray-700 dark:text-gray-300">E-mail ou ID Profissional</p>
            <input
                id="email-field"
                name="email"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 focus:outline-0 focus:ring-2 focus:ring-blue-500 h-14 p-3.75 text-base font-normal leading-normal transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400"
                placeholder="Digite seu e-mail ou ID"
                value={value}
                onChange={onChange}
                type="email"
                autoComplete="email"
            />
        </label>
    );
};
