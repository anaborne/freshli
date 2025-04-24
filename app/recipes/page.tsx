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

  const toggleSelect = (ingredient: Ingredient) => {
    setSelectedIngredients((prev) =>
      prev.some((item) => item.name === ingredient.name)
        ? prev.filter((item) => item.name !== ingredient.name)
        : [...prev, ingredient]
    );
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
    <div className="min-h-screen bg-orange-300 px-6 py-8 relative">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowOverlay(!showOverlay)}
          className="bg-yellow-400 px-3 py-1 rounded shadow"
        >
          {showOverlay ? 'Hide Selected' : 'View Selected'}
        </button>
        <h1 className="text-3xl font-bold text-center flex-1 text-gray-800">Select Ingredients</h1>
        <div className="w-[96px]"></div>
      </div>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search for an ingredient..."
          className="w-full p-3 rounded-lg border border-amber-500 shadow-sm text-amber-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {showOverlay && (
        <div className="absolute left-0 top-20 bg-white shadow-lg border rounded p-4 w-64 max-h-[80vh] overflow-y-auto z-50">
          {Object.entries(groupedSelected).map(([category, items]) => (
            <div key={category} className="mb-2">
              <h2 className="font-bold text-sm text-black mb-1 capitalize">{category}</h2>
              <ul className="pl-4 list-disc text-sm text-gray-700">
                {items.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          ))}
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