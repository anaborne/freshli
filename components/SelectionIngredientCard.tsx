import { useState, useEffect } from 'react';
import { Ingredient } from '@/types/ingredient';

type Props = {
  ingredient: Ingredient;
  isSelected: boolean;
  toggleSelect: (ingredient: Ingredient, quantity?: number) => void;
};

export default function SelectionIngredientCard({ ingredient, isSelected, toggleSelect }: Props) {
  const { name, quantity, unit, expirationDate } = ingredient;
  const [selectedQuantity, setSelectedQuantity] = useState<number>(
    typeof quantity === 'string' ? parseFloat(quantity) || 0 : quantity
  );

  // Update selectedQuantity when ingredient changes
  useEffect(() => {
    setSelectedQuantity(typeof quantity === 'string' ? parseFloat(quantity) || 0 : quantity);
  }, [quantity]);

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

  const handleToggleSelect = () => {
    if (!isSelected) {
      toggleSelect(ingredient, selectedQuantity);
    } else {
      toggleSelect(ingredient);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseFloat(e.target.value);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      setSelectedQuantity(newQuantity);
      // Always update the parent component with the new quantity
      toggleSelect(ingredient, newQuantity);
    }
  };

  return (
    <div
      className={`flex justify-between items-start bg-[#fccb82] shadow-lg rounded-lg p-4 h-auto min-h-24 cursor-pointer border-4 ${borderColor}`}
      title={title}
    >
      <div className="flex items-start gap-2 w-2/3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleToggleSelect}
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
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={selectedQuantity}
              onChange={handleQuantityChange}
              className="w-12 p-1 rounded bg-white text-[#fccb82] text-center text-sm"
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: 'center' }}
            />
            <span>{unit}</span>
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