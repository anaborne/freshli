import { useState, useEffect } from 'react';
import { Ingredient } from '@/types/ingredient';

type Props = {
  ingredient: Ingredient;
  isSelected: boolean;
  toggleSelect: (ingredient: Ingredient, quantity?: number) => void;
};

export default function SelectionIngredientCard({ ingredient, isSelected, toggleSelect }: Props) {
  const { name, quantity, unit, expirationDate } = ingredient;
  const originalQuantity = typeof quantity === 'string' ? parseFloat(quantity) || 0 : quantity;
  const [selectedQuantity, setSelectedQuantity] = useState<number>(originalQuantity);

  // Update selectedQuantity when ingredient changes
  useEffect(() => {
    setSelectedQuantity(originalQuantity);
  }, [originalQuantity]);

  let borderColor = 'border-orange-300';
  let title = '';
  const today = new Date();
  const expDate = new Date(expirationDate);

  const daysDiff = Math.ceil((expDate.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
  if (expDate < today) {
    title = 'Expired';
    borderColor = 'border-red-500';
  } else if (daysDiff <= 7) {
    title = 'Expiring soon';
    borderColor = 'border-yellow-300';
  } else {
    title = 'Fresh';
    borderColor = 'border-green-600';
  }

  const getIncrementValue = (unit: string): number => {
    // For count-based units
    if (['cnt', 'piece', 'pieces', 'whole', 'each', 'slice', 'slices'].includes(unit.toLowerCase())) {
      return 1;
    }
    // For weight-based units
    if (['g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms', 'oz', 'ounce', 'ounces', 'lb', 'lbs', 'pound', 'pounds'].includes(unit.toLowerCase())) {
      return 0.25;
    }
    // For volume-based units
    if (['ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters', 'cup', 'cups', 'tbsp', 'tablespoon', 'tablespoons', 'tsp', 'teaspoon', 'teaspoons'].includes(unit.toLowerCase())) {
      return 0.25;
    }
    // For bag/container-based units
    if (['bag', 'bags', 'container', 'containers', 'box', 'boxes', 'pack', 'packs', 'package', 'packages'].includes(unit.toLowerCase())) {
      return 0.25;
    }
    // Default increment
    return 0.1;
  };

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelected) {
      toggleSelect(ingredient);
    } else {
      toggleSelect(ingredient, selectedQuantity);
    }
  };

  const handleQuantityChange = (increment: number) => {
    const incrementValue = getIncrementValue(unit);
    let newQuantity: number;

    if (increment > 0) {
      // When increasing from minimum
      if (selectedQuantity <= 0.1) {
        newQuantity = incrementValue;
      } else {
        newQuantity = selectedQuantity + incrementValue;
      }
    } else {
      // When decreasing
      if (selectedQuantity - incrementValue <= 0.1) {
        newQuantity = 0.1;
      } else {
        newQuantity = selectedQuantity - incrementValue;
      }
    }

    // Ensure we don't exceed the original quantity
    newQuantity = Math.min(originalQuantity, newQuantity);

    if (newQuantity !== selectedQuantity) {
      setSelectedQuantity(newQuantity);
      toggleSelect(ingredient, newQuantity);
    }
  };

  return (
    <div
      onClick={handleToggleSelect}
      className={`flex justify-between items-start bg-[#fccb82] shadow-lg rounded-lg p-4 h-auto min-h-24 cursor-pointer border-4 ${borderColor}`}
      title={title}
    >
      <div className="flex items-start gap-2 w-2/3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="form-checkbox mt-1 accent-[#70994D]"
        />
        <div>
          <h3 className="text-lg font-semibold text-white truncate" title={name}>
            {name}
          </h3>
          <p className="text-sm text-white/90">Expires: {expirationDate}</p>
        </div>
      </div>
      <div className="text-right text-white text-lg font-semibold flex flex-col items-end">
        {isSelected ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              <button 
                onClick={(e) => { e.stopPropagation(); handleQuantityChange(1); }}
                className={`w-6 h-6 bg-[#70994D] text-white rounded-t flex items-center justify-center ${selectedQuantity >= originalQuantity ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5a7d3c]'}`}
                disabled={selectedQuantity >= originalQuantity}
              >
                ▲
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleQuantityChange(-1); }}
                className={`w-6 h-6 bg-[#70994D] text-white rounded-b flex items-center justify-center ${selectedQuantity <= 0.1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5a7d3c]'}`}
                disabled={selectedQuantity <= 0.1}
              >
                ▼
              </button>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm">{selectedQuantity.toFixed(unit.toLowerCase() === 'cnt' || unit.toLowerCase() === 'slice' || unit.toLowerCase() === 'slices' ? 0 : 2)}</span>
              <span className="text-sm">{unit}</span>
            </div>
          </div>
        ) : (
          <div>
            {quantity} {unit}
          </div>
        )}
      </div>
    </div>
  );
}