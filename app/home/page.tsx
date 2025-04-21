'use client';

import FoodCategoryColumn from '@/components/FoodCategoryColumn';
// import { sortByExpiration } from '@/utils/sortByExpiration';

const mockData = {
  vegetables: [
    { name: 'Carrots', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Spinach', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22'},
  ],
  fruits: [
    { name: 'Bananas', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Apples', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
  ],
  meats: [
    { name: 'Chicken Breast', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
    { name: 'Ground Beef', quantity: '2', unit: 'cnt', expirationDate : '2025-04-22' },
  ],
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-orange-300 px-6 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">freshli </h1>

      <div className="flex flex-wrap justify-center gap-8">
        <FoodCategoryColumn
          category="vegetables"
          ingredients={mockData.vegetables}
        />
        <FoodCategoryColumn
          category="fruits"
          ingredients={mockData.fruits}
        />
        <FoodCategoryColumn
          category="meats"
          ingredients={mockData.meats}
        />
      </div>
    </div>
  );
}