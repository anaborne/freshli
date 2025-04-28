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
    const ingredientList = ingredients.map((i: any) => i.name).join(', ');
    const filterText = filters && filters.length > 0 ? ` with the following criteria: ${filters.join(', ')}` : '';

    const prompt = `Create 3 detailed recipes that use ONLY these ingredients: ${ingredientList}${filterText}. 
    You may only add these basic essentials if needed:
    - Salt and pepper
    - Olive oil or cooking oil
    - Basic seasonings (garlic, herbs)
    
    DO NOT add any other ingredients beyond what was provided and the basic essentials listed above.
    
    For each recipe, provide:
    1. A creative name
    2. List of ingredients with quantities (only using the provided ingredients and basic essentials)
    3. Step-by-step instructions
    4. Estimated prep time, cook time, and total time
    5. Number of steps
    
    Format the response as a JSON array of recipe objects with this structure:
    {
      "name": "Recipe Name",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": ["step 1", "step 2", ...],
      "prepTime": "XX mins",
      "cookTime": "XX mins",
      "totalTime": "XX mins",
      "steps": ["step 1", "step 2", ...]
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
    });

    const rawResponse = completion.choices?.[0]?.message?.content ?? '[]';
    const recipes = JSON.parse(rawResponse);

    // Return recipes without images - images will be generated on-demand
    return NextResponse.json({ recipes });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while generating recipes' }, { status: 500 });
  }
}
