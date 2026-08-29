const { createClient } = require('@supabase/supabase-js');

// Credentials come from the environment, the same variables the app reads. Run with
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/seedIngredients.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY before running this script.');
  process.exit(1);
}

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