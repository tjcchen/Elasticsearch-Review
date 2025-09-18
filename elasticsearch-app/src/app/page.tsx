'use client';

import { useState } from 'react';
import SearchBox from '@/components/SearchBox';
import SearchResults from '@/components/SearchResults';
import { City } from '@/types/cities';

export default function Home() {
  const [results, setResults] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);

    try {
      const url = searchQuery.trim() 
        ? `/api/cities-es?q=${encodeURIComponent(searchQuery)}&limit=20`
        : '/api/cities-es?limit=20';
        
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.cities || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            Elasticsearch
            <span className="text-blue-600 dark:text-blue-400"> Search</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Powerful search capabilities powered by Elasticsearch. Find what you're looking for instantly.
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto">
          <SearchBox onSearch={handleSearch} loading={loading} />
          
          {/* Results Section */}
          <div className="mt-8">
            <SearchResults 
              results={results} 
              loading={loading} 
              query={query}
            />
          </div>
        </div>

        {/* Features Section */}
        {!query && (
          <div className="max-w-6xl mx-auto mt-16">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Fast Search</h3>
                <p className="text-gray-600 dark:text-gray-300">Lightning-fast full-text search powered by Elasticsearch engine.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Smart Ranking</h3>
                <p className="text-gray-600 dark:text-gray-300">Intelligent relevance scoring to show the most relevant results first.</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Advanced Filters</h3>
                <p className="text-gray-600 dark:text-gray-300">Filter by tags, date ranges, and other criteria for precise results.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
