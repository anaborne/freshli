'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function InventoryPage() {
    const [isManualUpload, setIsManualUpload] = useState(true);

    // Manual upload form state
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [category, setCategory] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const isFormComplete = name && quantity && unit && expirationDate && category;

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const lowercaseName = name.trim().toLowerCase();
        const lowercaseUnit = unit.trim().toLowerCase();
        const capitalizedName = lowercaseName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const { data, error } = await supabase
            .from('ingredients')
            .select('*')
            .filter('name', 'ilike', lowercaseName)
            .filter('unit', 'ilike', lowercaseUnit)
            .eq('expiration_date', expirationDate)
            .maybeSingle();

        if (data) {
            const updatedQuantity = (parseFloat(data.quantity) || 0) + (parseFloat(quantity) || 0);
            await supabase
                .from('ingredients')
                .update({ quantity: updatedQuantity.toString() })
                .eq('id', data.id);
        } else {
            await supabase.from('ingredients').insert([{
                name: capitalizedName,
                quantity,
                unit: lowercaseUnit,
                expiration_date: expirationDate,
                category,
            }]);
        }

        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        setName('');
        setQuantity('');
        setUnit('');
        setExpirationDate('');
        setCategory('');
    };

    const toggleUploadMode = () => {
        setIsManualUpload(!isManualUpload);
    };

    return (
      <div className="min-h-screen p-8 bg-orange-300 relative">
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-black">
          {isManualUpload ? "Manual Upload" : "Image Upload"}
        </h1>

        <button
          onClick={toggleUploadMode}
          className="block mx-auto mb-6 bg-yellow-500 text-black px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100"
        >
          {isManualUpload ? "Switch to Image Upload" : "Switch to Manual Upload"}
        </button>

        {isManualUpload ? (
          <form
            onSubmit={handleManualSubmit}
            className="max-w-md mx-auto bg-orange-500 p-6 rounded shadow space-y-4"
          >
            {saved && (
              <div className="text-center text-black bg-yellow-300 rounded p-2 font-semibold shadow">
                Saved!
              </div>
            )}

            <div>
              <label className="block font-semibold text-black">Name</label>
              <input
                className="w-full p-2 border border-black rounded mt-1"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-black">Quantity</label>
              <input
                className="w-full p-2 border border-black rounded mt-1"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-black">Unit</label>
              <input
                className="w-full p-2 border border-black rounded mt-1"
                placeholder="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-black">Expiration Date</label>
              <input
                className="w-full p-2 border border-black rounded mt-1"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-black">Category</label>
              <select
                className="w-full p-2 border border-black rounded mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value.toLowerCase())}
              >
                <option value="">Select Category</option>
                <option value="produce">Produce</option>
                <option value="meats">Meats</option>
                <option value="dairy">Dairy</option>
                <option value="pantry/grains">Pantry/Grains</option>
                <option value="frozen">Frozen</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={!isFormComplete || isSaving}
              className={`w-full p-2 rounded font-semibold ${
                isFormComplete ? 'bg-yellow-500 text-black hover:bg-yellow-100' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </form>
        ) : (
          <div className="max-w-md mx-auto bg-orange-500 p-6 rounded shadow text-black">
            <p className="text-center">Image upload functionality will be implemented here.</p>
          </div>
        )}
      </div>
    );
}