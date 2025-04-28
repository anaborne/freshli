'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function EditIngredientPage() {
  const { name } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('expiration_date') || '';
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
        .eq('expiration_date', dateParam)
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
    }

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      router.push('/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fccb82] p-8 relative">
      <button 
        onClick={() => router.push('/home')} 
        className="absolute top-4 left-4 bg-[#70994D] px-3 py-1 rounded text-white font-semibold shadow hover:bg-[#5a7d3c]"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold text-white mb-8 text-center">{decodeURIComponent(name as string)}</h1>

      {showPopup && (
        <div className="mb-4 text-center text-white bg-[#70994D] rounded p-2 font-semibold shadow">
          Saved!
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-[#faa424] p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-lg font-semibold text-white mb-2">Quantity</label>
          <input 
            type="text" 
            value={quantity} 
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-[#fccb82] rounded-lg bg-[#fccb82] text-white placeholder-white/70 focus:ring-2 focus:ring-[#70994D] focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-white mb-2">Unit</label>
          <input 
            type="text" 
            value={unit} 
            onChange={(e) => setUnit(e.target.value)}
            className="w-full p-2 border border-[#fccb82] rounded-lg bg-[#fccb82] text-white placeholder-white/70 focus:ring-2 focus:ring-[#70994D] focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-lg font-semibold text-white mb-2">Expiration Date</label>
          <input 
            type="date" 
            value={expirationDate} 
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full p-2 border border-[#fccb82] rounded-lg bg-[#fccb82] text-white focus:ring-2 focus:ring-[#70994D] focus:border-transparent" 
          />
        </div>
        <div className="flex flex-col items-center space-y-4 pt-4">
          <button
            type="submit"
            className="w-32 bg-[#70994D] text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-[#5a7d3c] transition-colors"
          >
            Save
          </button>
          <button
            type="button"
            onClick={async () => {
              const { error } = await supabase
                .from('ingredients')
                .delete()
                .eq('name', decodeURIComponent(name as string))
                .eq('unit', originalData.unit)
                .eq('expiration_date', originalData.expiration_date);

              if (error) {
                console.error('Failed to delete ingredient:', error.message);
                return;
              }

              router.push('/home');
            }}
            className="w-32 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold shadow hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  );
}