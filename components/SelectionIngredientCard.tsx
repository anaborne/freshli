import { Ingredient } from '@/types/ingredient';

type Props = {
  ingredient: Ingredient;
  isSelected: boolean;
  toggleSelect: (ingredient: Ingredient) => void;
};

export default function SelectionIngredientCard({ ingredient, isSelected, toggleSelect }: Props) {
  const { name, quantity, unit, expirationDate } = ingredient;

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

  return (
    <div
      className={`flex justify-between items-start bg-[#fccb82] shadow-lg rounded-lg p-4 h-24 cursor-pointer border-4 ${borderColor}`}
      title={title}
      onClick={() => toggleSelect(ingredient)}
    >
      <div className="flex items-start gap-2 w-2/3">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
          className="form-checkbox mt-1 accent-[#70994D]"
          readOnly
        />
        <div>
          <h2 className="text-xl font-bold text-[#70994D] truncate" title={name}>
            {name}
          </h2>
          <p className="text-[#70994D] text-sm">Expires on: {expirationDate}</p>
        </div>
      </div>
      <div className="text-right text-[#70994D] text-2xl font-semibold">
        {quantity} {unit}
      </div>
    </div>
  );
}