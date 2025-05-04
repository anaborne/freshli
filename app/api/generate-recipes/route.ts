import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(req: NextRequest) {
  try {
    const { ingredients, filters } = await req.json();
    if (!ingredients || !Array.isArray(ingredients)) {
      return NextResponse.json({ error: 'Invalid ingredients data' }, { status: 400 });
    }

    const ingredientList = ingredients.map((i: any) => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
    const filterText = filters && filters.length > 0 ? ` with the following criteria: ${filters.join(', ')}` : '';

    const prompt = `Create 9 detailed recipes that use UP TO these ingredients with their quantities: ${ingredientList}${filterText}. 
    You may only add these basic essentials if needed:
    - Salt and pepper
    - Olive oil or cooking oil
    - Basic seasonings (garlic, herbs)
    
    IMPORTANT RULES:
    1. You can use UP TO the quantities provided for each ingredient - you don't have to use the full amount
    2. If a filter is provided (e.g., vegetarian), you MUST follow that filter even if it means not using some of the provided ingredients
    3. DO NOT add any other ingredients beyond what was provided and the basic essentials listed above
    4. If a filter conflicts with an ingredient's use, prioritize the filter and exclude that ingredient
    5. For each recipe, you MUST list ALL ingredients with their EXACT quantities and units as provided
    6. The quantities in the ingredient list MUST be less than or equal to what was provided - do not exceed the provided quantities
    7. Format each ingredient as "Ingredient (quantity unit)" - for example: "Tomatoes (2 cnt)" or "Chicken Thighs (3 cnt)"
    
    For each recipe, provide:
    1. A creative name
    2. List of ingredients with EXACT quantities and units (only using the provided ingredients and basic essentials)
    3. Step-by-step instructions
    4. Estimated prep time, cook time, and total time
    5. Number of steps
    
    Format the response as a JSON array of recipe objects with this structure:
    {
      "recipes": [
        {
          "name": "Recipe Name",
          "ingredients": ["Tomatoes (2 cnt)", "Chicken Thighs (3 cnt)", ...],
          "instructions": ["step 1", "step 2", ...],
          "prepTime": "XX mins",
          "cookTime": "XX mins",
          "totalTime": "XX mins",
          "steps": ["step 1", "step 2", ...]
        },
        ...
      ]
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const rawResponse = completion.choices?.[0]?.message?.content;
    if (!rawResponse) {
      throw new Error('No response from OpenAI');
    }

    let response;
    try {
      response = JSON.parse(rawResponse);
    } catch (e) {
      console.error('Error parsing OpenAI response:', rawResponse);
      throw new Error('Invalid response format from OpenAI');
    }

    if (!response.recipes || !Array.isArray(response.recipes)) {
      throw new Error('Expected a recipes array in the response');
    }

    // Validate each recipe has required fields
    const validRecipes = response.recipes.filter(recipe => 
      recipe.name && 
      Array.isArray(recipe.ingredients) && 
      Array.isArray(recipe.instructions) &&
      recipe.prepTime && 
      recipe.cookTime && 
      recipe.totalTime
    );

    if (validRecipes.length === 0) {
      throw new Error('No valid recipes generated');
    }

    return NextResponse.json({ recipes: validRecipes });
  } catch (error) {
    console.error('Error generating recipes:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred while generating recipes' },
      { status: 500 }
    );
  }
}
