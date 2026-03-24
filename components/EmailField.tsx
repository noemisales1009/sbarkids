
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface EmailFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <label className="flex flex-col w-full">
            <p
                className="text-base font-medium leading-normal pb-2"
                style={{ color: isDark ? '#cbd5e1' : '#334155' }}
            >
                E-mail ou ID Profissional
            </p>
            <input
                id="email-field"
                name="email"
                className="flex w-full rounded-lg h-14 px-4 text-base font-normal leading-normal transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                style={{
                    backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    color: isDark ? '#f1f5f9' : '#1e293b',
                    border: `1px solid ${isDark ? '#475569' : '#e2e8f0'}`,
                    WebkitAppearance: 'none',
                }}
                placeholder="Digite seu e-mail ou ID"
                value={value}
                onChange={onChange}
                type="email"
                autoComplete="email"
            />
        </label>
    );
};
