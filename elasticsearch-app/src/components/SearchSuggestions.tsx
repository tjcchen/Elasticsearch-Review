'use client';

import { City } from '@/types/cities';

interface SearchSuggestionsProps {
  suggestions: City[];
  loading: boolean;
  query: string;
  onSelectSuggestion: (city: City) => void;
  onClose: () => void;
  show: boolean;
}

export default function SearchSuggestions({ 
  suggestions, 
  loading, 
  query, 
  onSelectSuggestion, 
  onClose,
  show 
}: SearchSuggestionsProps) {
  if (!show || (!loading && suggestions.length === 0 && query.length > 0)) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
      {loading ? (
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-300">Searching cities...</span>
          </div>
        </div>
      ) : suggestions.length > 0 ? (
        <div className="py-2">
          {suggestions.map((city, index) => (
            <button
              key={city.id}
              onClick={() => onSelectSuggestion(city)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:bg-gray-50 dark:focus:bg-gray-700 focus:outline-none transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {city.name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {city.state}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {city.description}
                  </p>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Pop: {city.population.toLocaleString()}
                  </div>
                </div>
              </div>
            </button>
          ))}
          
          {suggestions.length >= 5 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-600">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Press Enter to see all results
              </p>
            </div>
          )}
        </div>
      ) : query.length > 0 ? (
        <div className="p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No cities found matching "{query}"
          </p>
        </div>
      ) : null}
    </div>
  );
}
