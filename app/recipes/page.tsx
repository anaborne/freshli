'use client';

import { useState, useEffect } from 'react';
import SelectionFoodCategoryColumn from '@/components/SelectionFoodCategoryColumn';
import { supabase } from '@/lib/supabaseClient';
import { Ingredient } from '@/types/ingredient';

const CATEGORY_ORDER = ['produce', 'meats', 'dairy', 'pantry/grains', 'frozen', 'miscellaneous'];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [finalData, setFinalData] = useState<{ [key: string]: Ingredient[] }>(() =>
    CATEGORY_ORDER.reduce((acc, cat) => {
      acc[cat] = [];
      return acc;
    }, {} as { [key: string]: Ingredient[] })
  );

  const [selectedIngredients, setSelectedIngredients] = useState<Ingredient[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleSelect = (ingredient: Ingredient, quantity?: number) => {
    setSelectedIngredients((prev) => {
      // Check if ingredient is already selected
      const existingIndex = prev.findIndex(item => item.name === ingredient.name);
      
      if (existingIndex >= 0) {
        // If ingredient is already selected, remove it
        return prev.filter((item) => item.name !== ingredient.name);
      } else {
        // If ingredient is not selected, add it with the specified quantity
        const newIngredient = { ...ingredient };
        if (quantity !== undefined) {
          newIngredient.quantity = quantity;
        }
        return [...prev, newIngredient];
      }
    });
  };

  const groupedSelected = selectedIngredients.reduce<Record<string, string[]>>((acc, item) => {
    const category = item.category || 'miscellaneous';
    acc[category] = acc[category] || [];
    acc[category].push(item.name);
    return acc;
  }, {});

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (error) {
        console.error('Error fetching ingredients:', error.message);
        return;
      }

      const grouped: { [key: string]: Ingredient[] } = CATEGORY_ORDER.reduce((acc, cat) => {
        acc[cat] = [];
        return acc;
      }, {} as { [key: string]: Ingredient[] });

      data?.forEach((item) => {
        const category = item.category || 'miscellaneous';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expiration_date,
          category: item.category,
        });
      });

      setFinalData(grouped);
    };

    fetchIngredients();
  }, []);

  const filterIngredients = (ingredients: Ingredient[]): Ingredient[] =>
    ingredients
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => Date.parse(a.expirationDate) - Date.parse(b.expirationDate));

  return (
    <div className="min-h-screen bg-[#fccb82] px-6 pt-4 pb-8 relative">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center mb-6">
          <div className="flex w-full justify-between mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className="bg-[#70994D] hover:bg-[#5a7d3c] px-3 py-1 rounded shadow text-white font-semibold"
              >
                {showOverlay ? 'Hide Selected' : 'View Selected'}
              </button>
              <button
                onClick={() => {
                  const allIngredients = Object.values(finalData).flat();
                  setSelectedIngredients(allIngredients);
                }}
                className="bg-[#70994D] hover:bg-[#5a7d3c] px-3 py-1 rounded shadow text-white font-semibold"
              >
                Select All
              </button>
            </div>

            <button
              onClick={() => {
                const selected = JSON.stringify(selectedIngredients);
                localStorage.setItem('selectedIngredients', selected);
                window.location.href = '/recipes/filters';
              }}
              className="bg-[#70994D] hover:bg-[#5a7d3c] px-3 py-1 rounded shadow text-white font-semibold"
            >
              Next
            </button>
          </div>

          <h1 className="text-3xl font-bold text-white text-center">
            Select Ingredients
          </h1>
        </div>
      </div>

      <div className="max-w-xl mx-auto mb-6">
        <div className="bg-[#faa424ff] rounded-lg shadow p-6">
          <input
            type="text"
            placeholder="Search for an ingredient..."
            className="w-full p-2 border border-[#fccb82] rounded bg-[#fccb82] text-white placeholder-white/70 text-base font-normal"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showOverlay && (
        <div className="absolute left-0 top-20 bg-[#faa424ff] shadow-lg border rounded p-4 w-64 max-h-[80vh] flex flex-col overflow-hidden z-50">
          <div className="overflow-y-auto flex-1">
            {Object.entries(groupedSelected).map(([category, items]) => (
              <div key={category} className="mb-2">
                <h2 className="font-bold text-sm text-white mb-1 capitalize">{category}</h2>
                <ul className="pl-4 list-disc text-sm text-white">
                  {items.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            onClick={() => setSelectedIngredients([])}
            className="mt-4 bg-[#cc4b4b] hover:bg-[#e06666] text-white font-semibold px-3 py-2 rounded"
          >
            Clear Selection
          </button>
        </div>
      )}

      {Object.keys(finalData).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {CATEGORY_ORDER.map((category) => (
            <SelectionFoodCategoryColumn
              key={category}
              category={category}
              ingredients={filterIngredients(finalData[category])}
              selectedIngredients={selectedIngredients}
              toggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}