'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RecipeFiltersPage() {
  const [input, setInput] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAddFilter = () => {
    if (input.trim() && !filters.includes(input.trim())) {
      setFilters([...filters, input.trim()]);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFilter();
    }
  };

  const handleRemoveFilter = (filterToRemove: string) => {
    setFilters(filters.filter(f => f !== filterToRemove));
  };

  const handleGenerateRecipes = async () => {
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
    if (data.error) {
      console.error('Error generating recipes:', data.error);
      return;
    }
    localStorage.setItem('generatedRecipes', JSON.stringify(data.recipes || []));
    router.push('/recipes/results');
  };

  return (
    <div className="min-h-screen bg-[#fccb82]">
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push('/recipes')}
            className="bg-[#70994D] hover:bg-[#5a7d3c] text-white px-3 py-1 rounded shadow font-semibold"
          >
            ← Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white text-center mb-6">Recipe Filters</h1>

        <div className="space-y-6">
          <div className="bg-[#faa424ff] rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Add Filters</h2>
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., vegetarian, gluten-free, quick"
                className="flex-1 p-2 border border-[#fccb82] rounded bg-[#fccb82] text-white placeholder-white/70"
              />
              <button
                onClick={handleAddFilter}
                className="bg-[#70994D] text-white px-4 py-2 rounded font-semibold hover:bg-[#5a7d3c]"
              >
                Add
              </button>
            </div>
          </div>

          {filters.length > 0 && (
            <div className="bg-[#faa424ff] rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Active Filters</h2>
              <div className="flex flex-wrap gap-2">
                {filters.map((filter, index) => (
                  <div
                    key={index}
                    className="bg-[#fccb82] text-white px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{filter}</span>
                    <button
                      onClick={() => handleRemoveFilter(filter)}
                      className="ml-2 text-white hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleGenerateRecipes}
              disabled={loading}
              className="bg-[#70994D] text-white py-2 px-6 rounded-lg font-semibold hover:bg-[#5a7d3c] transition-colors disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Recipes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}