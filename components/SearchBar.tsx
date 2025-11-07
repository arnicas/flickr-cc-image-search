import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Creative Commons images..."
          className="w-full p-4 pl-6 pr-20 text-lg text-white bg-gray-800 border-2 border-gray-700 rounded-full focus:ring-2 focus:ring-brand-blue focus:border-brand-blue focus:outline-none transition-colors duration-300"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute top-1/2 right-2.5 transform -translate-y-1/2 bg-gradient-to-r from-brand-blue to-brand-pink text-white font-semibold py-2.5 px-6 rounded-full flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
        >
          <SearchIcon className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
