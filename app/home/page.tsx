'use client';

import { useState, useEffect } from 'react';
import FoodCategoryColumn from '@/components/FoodCategoryColumn';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [finalData, setFinalData] = useState<{ [key: string]: Ingredient[] }>({});

  interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
  }

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (error) {
        console.error('Error fetching ingredients:', error.message);
        return;
      }
      const grouped: { [key: string]: Ingredient[] } = {};
      data?.forEach((item) => {
        const category = item.category || 'uncategorized';
        if (!grouped[category]) grouped[category] = [];
        grouped[category].push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expiration_date,
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

      useEffect(() => {
        const fetchIngredients = async () => {
          const { data, error } = await supabase.from('ingredients').select('*');
          if (error) {
            console.error('Error fetching ingredients:', error.message);
            return;
          }
    
          const categoryOrder = ['produce', 'meats', 'dairy', 'pantry/grains', 'frozen', 'miscellaneous'];
          const grouped: { [key: string]: Ingredient[] } = {};
    
          categoryOrder.forEach((cat) => {
            grouped[cat] = [];
          });
    
          data?.forEach((item) => {
            const category = item.category || 'uncategorized';
            if (!grouped[category]) grouped[category] = [];
            grouped[category].push({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              expirationDate: item.expiration_date,
            });
          });
    
          const orderedGrouped: { [key: string]: Ingredient[] } = {};
          categoryOrder.forEach((cat) => {
            orderedGrouped[cat] = grouped[cat] || [];
          });
    
          setFinalData(orderedGrouped);
        };
    
        fetchIngredients();
      }, []);
    
  return (
    <div className="min-h-screen bg-orange-300 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Home</h1>

      <div className="max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search for an ingredient..."
          className="w-full p-3 rounded-lg border border-amber-500 shadow-sm text-amber-800"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {Object.keys(finalData).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {Object.entries(finalData).map(([category, items]) => (
            <FoodCategoryColumn
              key={category}
              category={category}
              ingredients={filterIngredients(items)}
            />
          ))}
        </div>
      )}
    </div>
  );
}