type Props = {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
};

export default function IngredientCard({ name, quantity, unit, expirationDate }: Props) {
    return (
        <div className="flex flex-col bg-orange-300 shadow-lg rounded-lg p-4">
            <h2 className="text-xl font-bold text-black">{name}</h2>
            <p className="text-gray-700">
                {quantity} {unit}
            </p>
            <p className="text-gray-700">Expires on: {expirationDate}</p>
        </div>
    );
}