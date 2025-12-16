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
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                <div className="text-zinc-500 dark:text-zinc-400 flex border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 items-center justify-center pl-3 sm:pl-4 rounded-l-xl border border-r-0">
                    <span className="material-symbols-outlined text-xl sm:text-2xl">search</span>
                </div>
                <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-zinc-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-inset focus:ring-primary border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 h-full placeholder:text-zinc-500 dark:placeholder:text-zinc-400 px-3 sm:px-4 rounded-l-none border-l-0 text-sm sm:text-base font-normal leading-normal"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={handleChange}
                />
            </div>
        </label>
    );
};

export default SearchBar;