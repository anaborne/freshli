import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RecipeCardProps {
  recipe: {
    name: string;
    ingredients: string[];
    instructions: string[];
    prepTime: string;
    cookTime: string;
    totalTime: string;
    steps: string[];
  };
  imageUrl: string;
}

export default function RecipeCard({ recipe, imageUrl }: RecipeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCooking, setIsCooking] = useState(false);
  const router = useRouter();

  const handleCookRecipe = async () => {
    setIsCooking(true);
    try {
      const response = await fetch('/api/update-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: recipe.ingredients }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory');
      }

      // Refresh the page to show updated inventory
      router.refresh();
    } catch (error) {
      console.error('Error updating inventory:', error);
    } finally {
      setIsCooking(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-2">{recipe.name}</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            <span className="mr-4">Prep: {recipe.prepTime}</span>
            <span className="mr-4">Cook: {recipe.cookTime}</span>
            <span>Total: {recipe.totalTime}</span>
          </div>
          <button
            onClick={handleCookRecipe}
            disabled={isCooking}
            className="bg-[#70994D] hover:bg-[#5a7d3c] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {isCooking ? 'Updating Inventory...' : 'Cooked This Recipe'}
          </button>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Ingredients:</h3>
          <ul className="list-disc list-inside text-gray-600">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[#70994D] hover:text-[#5a7d3c] font-semibold"
        >
          {isExpanded ? 'Hide Instructions' : 'Show Instructions'}
        </button>
        {isExpanded && (
          <div className="mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">Instructions:</h3>
            <ol className="list-decimal list-inside text-gray-600">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="mb-2">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
} 