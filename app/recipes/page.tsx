'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getResponse } from './generation';
import { relative } from 'path';
import FilterItem from '@/components/FilterItem';
import RecipeDisplay from '@/components/RecipeDisplay';

const FILTERS = ['Vegetarian', 'Vegan', 'Kosher', 'Halal', 'Keto'];

export default function RecipePage() {
  const [ingredients, setIngredientData] = useState<Ingredient[]>([]);
  const [cuisine, setCuisine] = useState('');
  const [restrictions, setRestrictions] = useState<Set<string>>(new Set());
  const [activeRecipe, setActiveRecipe] = useState({name: "", description: "", ingredients: [], instructions: []});

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

  const parseResponse = (response) => {
    const first = response.indexOf('{');
    const last = response.lastIndexOf('}')
    const output = JSON.parse(response.substring(first, last + 1));
    return output;
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
                      setActiveRecipe(parseResponse(response))
                  });
              }}
              className="bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
              >
              Submit
          </button>

          <RecipeDisplay key="test-display"
          name={activeRecipe.name}
          description={activeRecipe.description}
          ingredients={activeRecipe.ingredients}
          instructions={activeRecipe.instructions}
          />
        </div>
    </div>
  );
}