'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getResponse } from './generation';
import { relative } from 'path';

export default function RecipePage() {
  const [ingredients, setIngredientData] = useState<Ingredient[]>([]);

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

  const getPrompt = (): string => {
    const nameList: string[] = ingredients.map<string>(ingredient => {
      return "{" + ingredient.name + "}";
    });
    const names: string = "[" + nameList.toString() + "]";

    return "Give me a recipe using the ingredients in the following list, you do not have to use all the items.\n" + names
  }

  return (
    <div className="min-h-screen p-8 bg-orange-300 relative">
        <button
          onClick={() => window.history.back()}
          className="absolute top-4 left-4 bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
        >
          ← Back
        </button>

        <button
            onClick={() => {
                getResponse(getPrompt()).then((response) => {
                    console.log(response);
                });
                // console.log(getPrompt());
            }}
            className="absolute top-30 left-4 bg-yellow-500 px-3 py-1 rounded text-black font-semibold shadow hover:bg-yellow-100"
            >
            submit
        </button>
    </div>
  );
}