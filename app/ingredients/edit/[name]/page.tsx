'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function EditIngredientPage() {
  const { name } = useParams();
  const router = useRouter();
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [originalData, setOriginalData] = useState({ quantity: '', unit: '', expiration_date: '' });
  const [showPopup, setShowPopup] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const fetchIngredient = async () => {
      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .eq('name', decodeURIComponent(name as string))
        .single();

      if (error) {
        console.error('Failed to fetch ingredient:', error.message);
        return;
      }

      setQuantity(data.quantity || '');
      setUnit(data.unit || '');
      setExpirationDate(data.expiration_date || '');
      setOriginalData({
        quantity: data.quantity || '',
        unit: data.unit || '',
        expiration_date: data.expiration_date || '',
      });
    };

    fetchIngredient();
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const noChanges =
      quantity === originalData.quantity &&
      unit === originalData.unit &&
      expirationDate === originalData.expiration_date;

    if (noChanges) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    const { error } = await supabase
      .from('ingredients')
      .update({
        quantity,
        unit,
        expiration_date: expirationDate,
      })
      .eq('name', decodeURIComponent(name as string));

    if (error) {
      console.error('Failed to update ingredient:', error.message);
      return;
    }const supabaseUrl = 'https://lfhkwoykslzcebyrzgli.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxmaGt3b3lrc2x6Y2VieXJ6Z2xpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNjgyODgsImV4cCI6MjA2MDg0NDI4OH0.A2SqJ9B8Xz4cScqOv9aW16Db7B7VSH_H7rwjZDcaIXA';

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push('/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen p-8 bg-orange-300 relative">
      <button onClick={() => router.push('/home')} className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100">
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center text-black">{decodeURIComponent(name as string)}</h1>

      {showPopup && (
        <div className="mb-4 text-center text-black bg-yellow-300 rounded p-2 font-semibold shadow">
          Saved!
        </div>
      )}

      {showError && (
        <div className="mb-4 text-center text-black bg-red-400 rounded p-2 font-semibold shadow">
          No changes made.
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-orange-500 p-6 rounded shadow space-y-4">
        <div>
          <label className="block font-semibold text-black">Quantity</label>
          <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                 className="w-full p-2 border border-black rounded mt-1" />
        </div>
        <div>
          <label className="block font-semibold text-black">Unit</label>
          <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)}
                 className="w-full p-2 border border-black rounded mt-1" />
        </div>
        <div>
          <label className="block font-semibold text-black">Expiration Date</label>
          <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)}
                 className="w-full p-2 border border-black rounded mt-1" />
        </div>
        <button type="submit" className="bg-yellow-500 text-black px-4 py-2 rounded hover:bg-yellow-100">
          Save Changes
        </button>
      </form>
    </div>
  );
}