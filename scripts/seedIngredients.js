const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lfhkwoykslzcebyrzgli.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaGt3b3lrc2x6Y2VieXJ6Z2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjgyODgsImV4cCI6MjA2MDg0NDI4OH0.A2SqJ9B8Xz4cScqOv9aW16Db7B7VSH_H7rwjZDcaIXA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockIngredients = [
  {
    name: 'Carrots',
    quantity: '2',
    unit: 'cnt',
    expiration_date: '2025-04-28',
    category: 'produce',
  },
  {
    name: 'Spinach',
    quantity: '1',
    unit: 'bag',
    expiration_date: '2025-05-22',
    category: 'produce',
  },
  {
    name: 'Chicken Breast',
    quantity: '2',
    unit: 'cnt',
    expiration_date: '2025-04-28',
    category: 'meats',
  },
  {
    name: 'Milk',
    quantity: '1',
    unit: 'gallon',
    expiration_date: '2025-04-27',
    category: 'dairy',
  },
  {
    name: 'Rice',
    quantity: '1',
    unit: 'bag',
    expiration_date: '2026-01-01',
    category: 'pantry/grains',
  },
  {
    name: 'Frozen Peas',
    quantity: '1',
    unit: 'bag',
    expiration_date: '2025-10-10',
    category: 'frozen',
  },
];

async function seed() {
  const { data, error } = await supabase.from('ingredients').insert(mockIngredients);
  if (error) {
    console.error('Error seeding data:', error.message);
  } else {
    console.log('Seeded data successfully:', data);
  }
}

seed();