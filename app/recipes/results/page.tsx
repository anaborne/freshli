'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ClockIcon, ListBulletIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface Recipe {
  name: string;
  steps: string[];
  prepTime: string;
  cookTime: string;
  totalTime: string;
  ingredients: string[];
  instructions: string[];
  imageUrl?: string;
}

export default function RecipeResultsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedRecipes = localStorage.getItem('generatedRecipes');
    if (!storedRecipes) {
      router.push('/recipes');
      return;
    }

    try {
      const parsedRecipes = JSON.parse(storedRecipes);
      setRecipes(Array.isArray(parsedRecipes) ? parsedRecipes : [parsedRecipes]);
    } catch (error) {
      console.error('Error parsing recipes:', error);
      router.push('/recipes');
    }
    setLoading(false);
  }, [router]);

  const generateImage = async (recipe: Recipe) => {
    if (!recipe || generatingImage) return;
    
    setGeneratingImage(true);
    setImageError(null);
    try {
      const response = await fetch('/api/generate-recipe-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipeName: recipe.name }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 429) {
          setImageError('Rate limit reached. Please try again in a minute.');
          return;
        }
        throw new Error(data.error || 'Failed to generate image');
      }
      
      // Update the recipe with the new image URL
      const updatedRecipe = { ...recipe, imageUrl: data.imageUrl };
      setSelectedRecipe(updatedRecipe);
      
      // Update the recipe in the recipes array
      setRecipes(prevRecipes => 
        prevRecipes.map(r => r.name === recipe.name ? updatedRecipe : r)
      );
      
      // Update localStorage
      const updatedRecipes = recipes.map(r => r.name === recipe.name ? updatedRecipe : r);
      localStorage.setItem('generatedRecipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Error generating image:', error);
      setImageError('Failed to generate image. Please try again later.');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fccb82] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/recipes/filters')}
            className="bg-[#70994D] hover:bg-[#5a7d3c] text-white px-3 py-1 rounded shadow font-semibold"
          >
            ← Back
          </button>
        </div>
        
        <h1 className="text-3xl font-bold text-white text-center mb-8">Your Recipes</h1>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70994D]"></div>
          <p className="ml-4 text-lg text-white">Loading your recipes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              onClick={() => setSelectedRecipe(recipe)}
              className="bg-[#faa424ff] rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-white mb-4">{recipe.name}</h2>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-white">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  <span>{recipe.totalTime}</span>
                </div>
                <div className="flex items-center text-white">
                  <ListBulletIcon className="h-5 w-5 mr-2" />
                  <span>{recipe.instructions.length} steps</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#fccb82] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-white">{selectedRecipe.name}</h2>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-white hover:text-amber-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              {selectedRecipe.imageUrl ? (
                <div className="mb-6">
                  <Image
                    src={selectedRecipe.imageUrl}
                    alt={selectedRecipe.name}
                    width={600}
                    height={400}
                    className="rounded-lg object-cover w-full h-[300px]"
                  />
                </div>
              ) : (
                <div className="mb-6 flex flex-col items-center gap-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      generateImage(selectedRecipe);
                    }}
                    disabled={generatingImage}
                    className="bg-[#70994D] hover:bg-[#5a7d3c] text-white px-4 py-2 rounded-lg flex items-center"
                  >
                    {generatingImage ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Generating Image...</span>
                      </>
                    ) : (
                      <>
                        <PhotoIcon className="h-5 w-5 mr-2" />
                        <span>Generate Image</span>
                      </>
                    )}
                  </button>
                  {imageError && (
                    <p className="text-red-500 text-sm">{imageError}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[#faa424ff] p-4 rounded-lg">
                  <p className="text-sm text-white/80">Prep Time</p>
                  <p className="text-lg font-semibold text-white">{selectedRecipe.prepTime}</p>
                </div>
                <div className="bg-[#faa424ff] p-4 rounded-lg">
                  <p className="text-sm text-white/80">Cook Time</p>
                  <p className="text-lg font-semibold text-white">{selectedRecipe.cookTime}</p>
                </div>
                <div className="bg-[#faa424ff] p-4 rounded-lg">
                  <p className="text-sm text-white/80">Total Time</p>
                  <p className="text-lg font-semibold text-white">{selectedRecipe.totalTime}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-3">Ingredients</h3>
                <ul className="list-disc list-inside space-y-2">
                  {selectedRecipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-white">{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Instructions</h3>
                <ol className="space-y-3 pl-5">
                  {selectedRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="text-white">
                      {instruction}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex justify-center mt-8">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/update-inventory', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ ingredients: selectedRecipe.ingredients }),
                      });

                      if (!response.ok) {
                        throw new Error('Failed to update inventory');
                      }

                      // Navigate to home page
                      router.push('/home');
                    } catch (error) {
                      console.error('Error updating inventory:', error);
                    }
                  }}
                  className="bg-[#70994D] hover:bg-[#5a7d3c] text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Cooked This Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 