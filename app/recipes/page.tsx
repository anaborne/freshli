'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getResponse } from './generation';
import { relative } from 'path';
import FilterItem from '@/components/FilterItem';
import RecipeDisplay from '@/components/RecipeDisplay';

const FILTERS = ['Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Keto'];

const TEST_JSON = `\`\`\`json
{
  "name": "Vegetable Risotto with Mozzarella",
  "description": "A creamy and delicious vegetarian risotto featuring rice, fresh vegetables, and melted mozzarella, perfect for a comforting meal.",
  "ingredients": [
    "1 cup Arborio rice",
    "4 cups vegetable broth",
    "1 cup milk",
    "1/2 cup frozen peas",
    "1 medium carrot, diced",
    "1/2 cup corn kernels",
    "1 cup diced tomatoes",
    "1/2 cup mozzarella, cubed",
    "1 jalapeño, finely chopped (optional for heat)",
    "Salt and pepper to taste",
    "Olive oil"
  ],
  "instructions": [
    "In a saucepan, heat the vegetable broth and keep it warm over low heat.",
    "In a large skillet, heat a drizzle of olive oil over medium heat.",
    "Add the diced carrots and sauté for 3-4 minutes until they start to soften.",
    "Stir in the Arborio rice and cook for 1-2 minutes, stirring constantly until the rice is slightly translucent.",
    "Pour in 1 cup of warm vegetable broth, stirring frequently, and allow it to absorb.",
    "Once the broth has been absorbed, add another cup of broth, followed by the peas, corn, and diced tomatoes.",
    "Continue adding broth, one cup at a time, until the rice is creamy and al dente, about 18-20 minutes.",
    "In the last few minutes of cooking, stir in the milk and jalapeño (if using).",
    "Remove from heat and fold in the cubed mozzarella until it's melted and well incorporated.",
    "Season with salt and pepper to taste, and serve warm."
  ]
}
\`\`\``;

export default function RecipePage() {
  const [ingredients, setIngredientData] = useState<Ingredient[]>([]);
  const [cuisine, setCuisine] = useState('');
  const [restrictions, setRestrictions] = useState<Set<string>>(new Set());

  interface Ingredient {
    name: string;
    quantity: string;
    unit: string;
    expirationDate: string;
  }

  useEffect(() => {
    const fetchIngredients = async () => {
      const { data, error } = await supabase.from('ingredients').select('*');
      if (error) {
        console.error('Error fetching ingredients:', error.message);
        return;
      }

      const items: Ingredient[] = [];

      data?.forEach((item) => {
        items.push({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          expirationDate: item.expiration_date,
        });
      });

      setIngredientData(items);
    };

    fetchIngredients();
  }, []);

  const getCuisineString = (): string => {
    if (cuisine.length <= 0)
      return 'The recipe may be any cuisine.'

    return `The recipe is of the ${cuisine} cuisine.`
  }

  const getRestrictionString = (): string => {
    const filters = Array.from(restrictions.values());

    if (filters.length <= 0)
      return 'The recipe has no dietary restrictions.'

    return `The recipe should be ${filters}.`;
  }

  const getPrompt = (): string => {
    const nameList: string[] = ingredients.map<string>(ingredient => {
      return `{${ingredient.name}}`;
    });
    const names: string = `[${nameList.toString()}]`;

    return(
`Give me a recipe using the ingredients in the following list, you do not have to use all the items.
${names}
${getCuisineString()}
${getRestrictionString()}
The output should be in a JSON format containing:
A string of the recipe's name with the key "name",
A string of the recipe's description with the key "description",
An array of strings of the recipe's ingredients with the key "ingredients",
An array of strings of the recipe's instructions with the key "instructions"`
      );
  }

  const onFilterChange = (filter, checked) => {
    if (checked) {
      restrictions.add(filter);
    } else if (restrictions.has(filter)) {
      restrictions.delete(filter);
    }
  }

  const onCuisineChange = (newCuisine) => {
    setCuisine(newCuisine.target.value);
  }

  return (
    <div className="min-h-screen p-8 bg-orange-300 relative">
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
        >
          ← Back
        </button>

        <div className="absolute top-20 left-4">
          <input
            className="bg-orange-100 text-black"
            type="text"
            onChange={onCuisineChange}
            />

          {FILTERS.map((filter) => (
            <FilterItem
              key={filter}
              filter={filter}
              onChange={onFilterChange} />
          ))}

          <button
              onClick={() => {
                  console.log(getPrompt());
                  getResponse(getPrompt()).then((response) => {
                      console.log(response);
                  });
              }}
              className="bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
              >
              Submit
          </button>

          <RecipeDisplay key="test-display" description={TEST_JSON}
          />
        </div>
    </div>
  );
}