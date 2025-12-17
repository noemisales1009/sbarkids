
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
                <p className="text-base font-medium leading-normal" style={{ color: '#CBD5E1' }}>Senha</p>
                <a className="text-sm font-medium leading-normal hover:underline" style={{ color: '#13A2EA' }} href="#">Esqueceu sua senha?</a>
            </div>
            <div className="flex w-full flex-1 items-stretch rounded-lg">
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg text-white focus:outline-0 focus:ring-2 focus:ring-white border h-14 placeholder:text-slate-500 p-3.75 border-r-0 text-base font-normal leading-normal transition-all"
                    style={{ backgroundColor: '#1E293B', borderColor: '#1E293B', color: 'white' }}
                    placeholder="Digite sua senha"
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                />
                <div 
                    className="flex items-center justify-center px-3.5 rounded-r-lg border-l-0 cursor-pointer"
                    style={{ backgroundColor: '#1E293B', borderColor: '#1E293B', color: '#13A2EA' }}
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
