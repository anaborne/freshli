import { Ingredient } from '@/types/ingredient';

type Props = {
  ingredient: Ingredient;
  isSelected: boolean;
  toggleSelect: (ingredient: Ingredient) => void;
};

export default function SelectionIngredientCard({ ingredient, isSelected, toggleSelect }: Props) {
  const { name, quantity, unit, expirationDate } = ingredient;

  let bgColor = 'bg-orange-300';
  let title = '';
  const today = new Date();
  const expDate = new Date(expirationDate);

  const daysDiff = Math.ceil((expDate.getTime() - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
  if (expDate < today) {
    title = 'Expired';
    bgColor = 'bg-red-500';
  } else if (daysDiff <= 7) {
    title = 'Expiring soon';
    bgColor = 'bg-yellow-400';
  } else {
    title = 'Fresh';
  }

  return (
    <div
      className={`flex justify-between items-start ${bgColor} shadow-lg rounded-lg p-4 h-24 cursor-pointer border ${isSelected ? 'border-black' : 'border-transparent'}`}
      title={title}
      onClick={() => toggleSelect(ingredient)}
    >
      <div className="flex items-start gap-2 w-2/3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="form-checkbox mt-1 accent-black"
          readOnly
        />
        <div>
          <h2 className="text-xl font-bold text-black truncate" title={name}>
            {name}
          </h2>
          <p className="text-gray-700 text-sm">Expires on: {expirationDate}</p>
        </div>
      </div>
      <div className="text-right text-gray-700 text-2xl font-semibold">
        {quantity} {unit}
      </div>
    </div>
  );
}