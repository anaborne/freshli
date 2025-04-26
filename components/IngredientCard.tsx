import Link from 'next/link';
import { Ingredient } from '@/types/ingredient';

type Props = Ingredient;

export default function IngredientCard({ name, quantity, unit, expirationDate }: Props) {
    // Determine expiration status and card border color
    let borderColor = 'border-orange-300';
    let title = '';
    const today = new Date();
    const expDate = new Date(expirationDate);
    // Calculate difference in days
    const daysDiff = Math.ceil((expDate.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
    if (expDate < today) {
        title = 'Expired';
        borderColor = 'border-red-500';
    } else if (daysDiff <= 7) {
        title = 'Expiring soon';
        borderColor = 'border-yellow-300';
    } else {
        title = 'Fresh'
        borderColor = 'border-green-600';
    }
    return (
        <Link href={`/ingredients/edit/${encodeURIComponent(name)}?expiration_date=${expirationDate}`} className="block">
            <div className={`flex justify-between items-start bg-[#fccb82] shadow-lg rounded-lg p-4 h-24 border-4 ${borderColor}`} title={title}>
                <div className="w-2/3">
                    <h2 className="text-xl font-bold text-[#70994D] truncate" title={name}>
                        {name}
                    </h2>
                    <p className="text-[#70994D] text-sm">Expires on: {expirationDate}</p>
                </div>
                <div className="text-right text-[#70994D] text-2xl font-semibold">
                    {quantity} {unit}
                </div>
            </div>
        </Link>
    );
}