import Link from 'next/link';
type Props = {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
};

export default function IngredientCard({ name, quantity, unit, expirationDate }: Props) {
    // Determine expiration status and card color
    let bgColor = 'bg-orange-300';
    let title = '';
    const today = new Date();
    const expDate = new Date(expirationDate);
    // Calculate difference in days
    const daysDiff = Math.ceil((expDate.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
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
        <Link href={`/ingredients/edit/${encodeURIComponent(name)}`} className="block">
            <div className={`flex justify-between items-start ${bgColor} shadow-lg rounded-lg p-4 h-24`} title={title}>
                <div className="w-2/3">
                    <h2 className="text-xl font-bold text-black truncate" title={name}>
                        {name}
                    </h2>
                    <p className="text-gray-700 text-sm">Expires on: {expirationDate}</p>
                </div>
                <div className="text-right text-gray-700 text-2xl font-semibold">
                    {quantity} {unit}
                </div>
            </div>
        </Link>
    );
}