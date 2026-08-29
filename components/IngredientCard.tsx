import Link from 'next/link';
import { Ingredient } from '@/types/ingredient';
import { expiryBorderClass, expiryLabel, expiryStatus } from '@/lib/expiry';

type Props = Ingredient;

export default function IngredientCard({ name, quantity, unit, expirationDate }: Props) {
    const status = expiryStatus(expirationDate);
    return (
        <Link href={`/ingredients/edit/${encodeURIComponent(name)}?expiration_date=${expirationDate}`} className="block">
            <div
                title={expiryLabel(status)}
                className={`p-4 rounded-lg shadow-md bg-[#fccb82] border-2 ${expiryBorderClass(status)}`}
            >
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
