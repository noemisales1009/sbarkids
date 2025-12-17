
import React from 'react';

interface EmailFieldProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EmailField: React.FC<EmailFieldProps> = ({ value, onChange }) => {
    return (
        <label className="flex flex-col w-full">
            <p className="text-base font-medium leading-normal pb-2" style={{ color: '#CBD5E1' }}>E-mail ou ID Profissional</p>
            <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-white border h-14 p-3.75 text-base font-normal leading-normal transition-all"
                style={{ backgroundColor: '#1E293B', borderColor: '#1E293B', color: 'white' }}
                placeholder="Digite seu e-mail ou ID"
                value={value}
                onChange={onChange}
                type="email"
            />
        </label>
    );
};
