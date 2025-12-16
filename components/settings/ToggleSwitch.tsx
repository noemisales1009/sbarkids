
import React from 'react';

interface ToggleSwitchProps {
    defaultChecked?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ defaultChecked }) => {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" value="" className="peer sr-only" defaultChecked={defaultChecked} />
            <div className="peer h-6 w-11 rounded-full bg-slate-300 dark:bg-slate-600 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary dark:peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"></div>
        </label>
    );
};

export default ToggleSwitch;
