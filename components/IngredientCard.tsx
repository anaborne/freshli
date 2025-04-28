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
            <div className={`p-4 rounded-lg shadow-md bg-[#fccb82] border-2 ${borderColor}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-1">{name}</h3>
                        <p className="text-sm text-white/90">Expires: {expirationDate}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-semibold text-white">{quantity} {unit}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}