'use client';

import { useState } from 'react';
import FoodCategoryColumn from '@/components/FoodCategoryColumn';

const mockData = {
  produce: [
    { name: 'Carrots', quantity: '2', unit: 'cnt', expirationDate : '2025-04-28' },
    { name: 'Spinach', quantity: '1', unit: 'bag', expirationDate : '2025-05-22' },
    { name: 'Bananas', quantity: '6', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '3', unit: 'cnt', expirationDate : '2025-08-22' },
    { name: 'Kale', quantity: '1', unit: 'bunch', expirationDate : '2025-04-24' },
    { name: 'Bell Pepper', quantity: '4', unit: 'cnt', expirationDate : '2025-04-26' },
  ],
  meats: [
    { name: 'Chicken Breast', quantity: '2', unit: 'cnt', expirationDate : '2025-04-28' },
    { name: 'Ground Beef', quantity: '1', unit: 'lb', expirationDate : '2025-04-26' },
    { name: 'Bacon', quantity: '1', unit: 'pack', expirationDate : '2025-05-05' },
    { name: 'Salmon', quantity: '2', unit: 'fillets', expirationDate : '2025-04-23' },
  ],
  dairy: [
    { name: 'Milk', quantity: '1', unit: 'gallon', expirationDate : '2025-04-27' },
    { name: 'Cheddar Cheese', quantity: '1', unit: 'block', expirationDate : '2025-05-10' },
    { name: 'Yogurt', quantity: '4', unit: 'cups', expirationDate : '2025-04-25' },
  ],
  'pantry/grains': [
    { name: 'Rice', quantity: '1', unit: 'bag', expirationDate : '2026-01-01' },
    { name: 'Pasta', quantity: '2', unit: 'boxes', expirationDate : '2025-12-01' },
    { name: 'Bread', quantity: '1', unit: 'loaf', expirationDate : '2025-04-24' },
  ],
  frozen: [
    { name: 'Frozen Peas', quantity: '1', unit: 'bag', expirationDate : '2025-10-10' },
    { name: 'Ice Cream', quantity: '1', unit: 'tub', expirationDate : '2025-06-01' },
    { name: 'Frozen Pizza', quantity: '2', unit: 'cnt', expirationDate : '2025-07-15' },
  ],
  miscellaneous: [
    { name: 'Hummus', quantity: '1', unit: 'container', expirationDate : '2025-04-29' },
    { name: 'Salsa', quantity: '1', unit: 'jar', expirationDate : '2025-05-12' },
    { name: 'Linguini Pasta  Pasta pasdfjasdjfasdf', quantity: '1', unit: 'container', expirationDate : '2025-04-23' },
  ],
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');

  interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
  }

  const filterIngredients = (ingredients: Ingredient[]): Ingredient[] =>
    ingredients
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => Date.parse(a.expirationDate) - Date.parse(b.expirationDate));

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
        {Object.entries(mockData).map(([category, items]) => (
          <FoodCategoryColumn
            key={category}
            category={category}
            ingredients={filterIngredients(items)}
          />
        ))}
      </div>
    </div>
  );
}