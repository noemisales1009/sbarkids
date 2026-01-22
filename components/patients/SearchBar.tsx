import React, { useState } from 'react';

interface SearchBarProps {
    placeholder: string;
    onSearch?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearch }) => {
    const [searchValue, setSearchValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <label className="flex flex-col w-full h-10 sm:h-11 lg:h-12">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                <div className="text-slate-500 dark:text-slate-400 flex border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 items-center justify-center pl-3 sm:pl-4 rounded-l-xl border border-r-0">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
                </div>
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-inset focus:ring-blue-500 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 h-full placeholder:text-slate-500 dark:placeholder:text-slate-400 px-3 sm:px-4 rounded-l-none border-l-0 text-sm sm:text-base font-normal leading-normal"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={handleChange}
                />
            </div>
        </label>
    );
};

export default SearchBar;