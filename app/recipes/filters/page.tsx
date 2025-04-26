'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FilterPage() {
  const [input, setInput] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('selectedIngredients');
    console.log('🧾 Loaded selectedIngredients in filters page:', stored);

    if (!stored || JSON.parse(stored).length === 0) {
        alert('No ingredients selected! Please go back and select some ingredients.');
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!filters.includes(input.trim())) {
        setFilters([...filters, input.trim()]);
      }
      setInput('');
    }
  };

  const removeFilter = (filter: string) => {
    setFilters(filters.filter(f => f !== filter));
  };

  return (
    <div className="min-h-screen bg-[#fccb82] px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-6 text-[#70994D]">Add Recipe Filters</h1>

      <div className="max-w-xl mx-auto">
        <button
          onClick={() => router.push('/recipes')}
          className="mb-4 bg-[#70994D] hover:bg-[#5a7d3c] px-4 py-1 rounded shadow text-white font-semibold"
        >
          ← Back
        </button>

        <label htmlFor="filterInput" className="block text-lg font-semibold text-[#70994D] mb-2">
          Type and press Enter to add a filter
        </label>
        <input
          id="filterInput"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-3 rounded-lg border border-[#70994D] shadow-sm text-amber-800 mb-4"
          placeholder="e.g. vegetarian, soup, high protein"
        />

        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((filter) => (
            <span key={filter} className="bg-[#70994D] text-white px-3 py-1 rounded-full flex items-center space-x-2">
              <span>{filter}</span>
              <button
                onClick={() => removeFilter(filter)}
                className="ml-2 text-white font-bold hover:text-red-300"
                aria-label={`Remove filter ${filter}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>

        <button
          onClick={async () => {
            setLoading(true);
            const selected = JSON.parse(localStorage.getItem('selectedIngredients') || '[]');
            const res = await fetch('/api/generate-recipes', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ ingredients: selected, filters }),
            });

            const data = await res.json();
            localStorage.setItem('generatedRecipes', JSON.stringify(data.recipes || []));
            router.push('/recipes/results');
          }}
          disabled={loading}
          className="bg-[#70994D] hover:bg-[#5a7d3c] text-white font-semibold px-6 py-2 rounded shadow w-full"
        >
          {loading ? 'Generating...' : 'Submit'}
        </button>

        {loading && (
          <div className="mt-6 flex flex-col items-center text-gray-800 text-lg font-semibold animate-pulse">
            <svg className="animate-spin h-6 w-6 mb-2 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>Loading<span className="animate-ping">...</span></span>
          </div>
        )}
      </div>
    </div>
  );
}