type Props = {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
};

export default function IngredientCard({ name, quantity, unit, expirationDate }: Props) {
    return (
        <div className="flex justify-between items-start bg-orange-300 shadow-lg rounded-lg p-4 h-24">
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
    );
}