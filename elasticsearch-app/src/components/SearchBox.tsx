'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import SearchSuggestions from './SearchSuggestions';
import { City } from '@/types/cities';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBox({ onSearch, loading }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  
  // Debounce the query to reduce API calls
  const debouncedQuery = useDebounce(query, 300);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  const handleSelectSuggestion = (city: City) => {
    const fullName = `${city.name}, ${city.state}`;
    setQuery(fullName);
    onSearch(fullName);
    setShowSuggestions(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim().length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      if (debouncedQuery.trim().length < 2) {
        return; // Don't search for single characters
      }

      setSuggestionsLoading(true);
      try {
        const response = await fetch(`/api/cities-es?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.cities || []);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    };

    if (showSuggestions) {
      fetchSuggestions();
    }
  }, [debouncedQuery, showSuggestions]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div ref={searchBoxRef} className="relative">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Search for cities in America..."
              className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200 shadow-lg"
              disabled={loading}
            />
            
            <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-2">
              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  disabled={loading}
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </div>
        </form>
        
        {/* Search Suggestions Dropdown */}
        <SearchSuggestions
          suggestions={suggestions}
          loading={suggestionsLoading}
          query={query}
          onSelectSuggestion={handleSelectSuggestion}
          onClose={() => setShowSuggestions(false)}
          show={showSuggestions && isFocused}
        />
      </div>
      
      {/* Popular city searches */}
      <div className="mt-4 flex flex-wrap gap-2">
        {['San Francisco', 'New York', 'Los Angeles', 'Chicago', 'Miami'].map((cityName) => (
          <button
            key={cityName}
            onClick={() => {
              setQuery(cityName);
              onSearch(cityName);
            }}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            disabled={loading}
          >
            {cityName}
          </button>
        ))}
      </div>
    </div>
  );
}
