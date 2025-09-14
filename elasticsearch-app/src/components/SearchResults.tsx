'use client';

import { SearchResult } from '@/types/search';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  query: string;
}

export default function SearchResults({ results, loading, query }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 text-gray-300 dark:text-gray-600">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.007-5.824-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          We couldn't find any documents matching "{query}". Try adjusting your search terms or check your spelling.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
          Search Results
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </span>
      </div>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={result._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                {result._source.title || `Document ${result._id}`}
              </h3>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                  Score: {result._score.toFixed(2)}
                </span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {result._source.content?.substring(0, 300)}
              {result._source.content && result._source.content.length > 300 && '...'}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {result._source.tags?.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {result._source.created_at && (
                  <span>
                    Created: {new Date(result._source.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
