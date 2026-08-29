'use client';

import { useState, useEffect } from 'react';
import FoodCategoryColumn from '@/components/FoodCategoryColumn';
import { supabase } from '@/lib/supabaseClient';
import { Ingredient } from '@/types/ingredient';
import { CATEGORY_ORDER, filterByName, fromRow, groupByCategory, sortByExpiry } from '@/lib/ingredients';


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [finalData, setFinalData] = useState<Record<string, Ingredient[]>>(() => groupByCategory([]));

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (error) {
        console.error('Error fetching ingredients:', error.message);
        return;
      }

      setFinalData(groupByCategory((data ?? []).map(fromRow)));
    };

    fetchIngredients();
  }, []);

  const filterIngredients = (ingredients: Ingredient[]): Ingredient[] =>
    sortByExpiry(filterByName(ingredients, searchQuery));

  return (
    <div className="min-h-screen bg-[#fccb82] px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-white">Home</h1>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <div className="bg-[#faa424ff] rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="Search for an ingredient..."
            className="w-full p-2 border border-[#fccb82] rounded bg-[#fccb82] text-white placeholder-white/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {Object.keys(finalData).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {CATEGORY_ORDER.map((category) => (
            <FoodCategoryColumn
              key={category}
              category={category}
              ingredients={filterIngredients(finalData[category])}
            />
          ))}
        </div>
      )}
    </div>
  );
}