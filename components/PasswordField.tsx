
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
                <p className="text-slate-300 dark:text-slate-200 text-base font-medium leading-normal">Senha</p>
                <a className="text-primary text-sm font-medium leading-normal hover:underline" href="#">Esqueceu sua senha?</a>
            </div>
            <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-primary dark:focus:border-primary h-14 placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 py-3 border-r-0 text-base font-normal leading-normal"
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                />
                <div 
                    className="text-gray-600 dark:text-gray-300 flex border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 items-center justify-center px-3.5 rounded-r-lg border-l-0 cursor-pointer"
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
