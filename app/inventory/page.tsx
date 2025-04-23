'use client';

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

const isComplete = (item: any) =>
  item.name && item.quantity && item.unit && item.expirationDate && item.category;

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

    const [recognized, setRecognized] = useState<{ name: string; quantity?: string; unit?: string; expirationDate?: string; category?: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const isFormComplete = name && quantity && unit && expirationDate && category;

    const allComplete = recognized.every(isComplete);

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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setUploadedImage(base64);
      };

      reader.readAsDataURL(file);
    };

    const handleImageSubmit = async () => {
      if (!uploadedImage) return;
      setLoading(true);

      const res = await fetch('/api/gpt-vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Image: uploadedImage }),
      });

      const { ingredients, error, raw } = await res.json();
      setLoading(false);

      if (ingredients) {
        setRecognized(ingredients.map((name: string) => ({ name })));
      } else {
        console.error("Error parsing GPT response:", raw || error);
      }
    };

    const updateIngredient = (index: number, newItem: any) => {
      setRecognized(prev =>
        prev.map((item, i) => (i === index ? { ...item, ...newItem } : item))
      );
    };

    const deleteIngredient = (index: number) => {
      setRecognized(prev => prev.filter((_, i) => i !== index));
    };

    const confirmUpload = async () => {
      for (let item of recognized) {
        const lowercaseName = item.name.trim().toLowerCase();
        const capitalizedName = lowercaseName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        await supabase.from('ingredients').insert([{
          name: capitalizedName,
          quantity: item.quantity || '',
          unit: item.unit || '',
          expiration_date: item.expirationDate || '',
          category: item.category || 'miscellaneous',
        }]);
      }

      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
      setRecognized([]);
      setUploadedImage(null);
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
          <div className="max-w-md mx-auto bg-orange-500 p-6 rounded shadow text-black space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 w-full"
            >
              Upload Image
            </button>
            {uploadedImage && (
              <div className="space-y-4">
                <img
                  src={`data:image/jpeg;base64,${uploadedImage}`}
                  alt="Preview"
                  className="w-full max-h-64 object-contain rounded border border-black"
                />
                <button
                  type="button"
                  onClick={handleImageSubmit}
                  className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold shadow hover:bg-yellow-100 w-full"
                >
                  Submit
                </button>
              </div>
            )}
            {showToast && (
              <div className="text-center text-black bg-yellow-300 rounded p-2 font-semibold shadow">
                ✅ Ingredients added!
              </div>
            )}
            {loading && (
              <div className="flex justify-center mt-4">
                <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {recognized.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recognized.map((item, i) => {
                  const isItemComplete = isComplete(item);
                  const isExpanded = expandedIndex === i;

                  return (
                    <div
                      key={i}
                      className={`p-3 rounded border shadow-sm space-y-2 ${
                        isItemComplete ? 'border-green-500 bg-green-100' : 'border-red-500 bg-red-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <input
                          className="flex-1 border rounded p-1 mr-2"
                          value={item.name}
                          onChange={(e) =>
                            updateIngredient(i, { ...item, name: e.target.value })
                          }
                          placeholder="Name"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteIngredient(i)}
                            className="text-red-500 text-xl font-bold"
                            title="Delete"
                          >
                            ❌
                          </button>
                          <button
                            onClick={() =>
                              setExpandedIndex(isExpanded ? null : i)
                            }
                            className="text-black font-bold"
                            title="Toggle Details"
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="space-y-2 mt-2">
                          <input
                            className="w-full border rounded p-1"
                            value={item.quantity || ''}
                            onChange={(e) =>
                              updateIngredient(i, { ...item, quantity: e.target.value })
                            }
                            placeholder="Quantity"
                          />
                          <input
                            className="w-full border rounded p-1"
                            value={item.unit || ''}
                            onChange={(e) =>
                              updateIngredient(i, { ...item, unit: e.target.value })
                            }
                            placeholder="Unit"
                          />
                          <input
                            className="w-full border rounded p-1"
                            type="date"
                            value={item.expirationDate || ''}
                            onChange={(e) =>
                              updateIngredient(i, { ...item, expirationDate: e.target.value })
                            }
                          />
                          <select
                            className="w-full border rounded p-1"
                            value={item.category || ''}
                            onChange={(e) =>
                              updateIngredient(i, { ...item, category: e.target.value.toLowerCase() })
                            }
                          >
                            <option value="">Select Category</option>
                            <option value="produce">Produce</option>
                            <option value="meats">Meats</option>
                            <option value="dairy">Dairy</option>
                            <option value="pantry/grains">Pantry/Grains</option>
                            <option value="frozen">Frozen</option>
                            <option value="miscellaneous">Miscellaneous</option>
                          </select>
                          <button
                            onClick={() => setExpandedIndex(null)}
                            className="w-full bg-yellow-500 text-black py-1 px-2 rounded font-semibold hover:bg-yellow-400"
                          >
                            Save & Collapse
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={confirmUpload}
                  disabled={!allComplete}
                  className={`w-full px-4 py-2 rounded font-semibold ${
                    allComplete
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm & Add Ingredients
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
}