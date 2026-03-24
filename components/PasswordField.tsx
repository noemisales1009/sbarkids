
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PasswordFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    showPassword: boolean;
    toggleVisibility: () => void;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({ value, onChange, showPassword, toggleVisibility }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <label className="flex flex-col w-full">
            <div className="flex items-baseline justify-between pb-2">
                <p
                    className="text-base font-medium leading-normal"
                    style={{ color: isDark ? '#cbd5e1' : '#334155' }}
                >
                    Senha
                </p>
            </div>
            <div
                className="flex w-full flex-1 items-stretch rounded-lg transition-all focus-within:ring-2 focus-within:ring-blue-500"
                style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                }}
            >
                <input
                    id="password-field"
                    name="password"
                    className="flex w-full min-w-0 flex-1 rounded-l-lg bg-transparent h-14 px-4 text-base font-normal leading-normal transition-all focus:outline-none border-0"
                    style={{ color: isDark ? '#f1f5f9' : '#1e293b' }}
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    autoComplete="current-password"
                />
                <div
                    className="flex items-center justify-center px-3.5 rounded-r-lg cursor-pointer"
                    style={{ color: isDark ? '#60a5fa' : '#2563eb' }}
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
