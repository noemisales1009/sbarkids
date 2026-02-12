
import React from 'react';

interface PasswordFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    toggleVisibility: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange, showPassword, toggleVisibility }) => {
    return (
        <label className="flex flex-col w-full">
            <div className="flex items-baseline justify-between pb-2">
                <p className="text-base font-medium leading-normal text-gray-700 dark:text-gray-300">Senha</p>
            </div>
            <div className="flex w-full flex-1 items-stretch rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                <input
                    id="password-field"
                    name="password"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg bg-transparent text-gray-900 dark:text-white focus:outline-0 border-0 h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 p-3.75 text-base font-normal leading-normal transition-all"
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    autoComplete="current-password"
                />
                <div 
                    className="flex items-center justify-center px-3.5 rounded-r-lg cursor-pointer text-blue-600 dark:text-blue-400 bg-transparent"
                    onClick={toggleVisibility}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </div>
            </div>
        </label>
    );
};
