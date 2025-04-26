

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { ingredients, filters } = await req.json();

    const ingredientList = ingredients.map((i: any) => i.name).join(', ');
    const filterText = filters && filters.length > 0 ? ` with the following criteria: ${filters.join(', ')}` : '';

    const prompt = `Create a list of up to 30 unique recipe names that use most or all of the following ingredients and adhere to all the filters if any are present: ${ingredientList}${filterText}. Only return the recipe names in a JSON array format.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const rawResponse = completion.choices?.[0]?.message?.content ?? '[]';
    let recipes;
    try {
      recipes = JSON.parse(rawResponse);
    } catch (e) {
      return NextResponse.json({ error: 'Could not parse GPT response', raw: rawResponse }, { status: 500 });
    }

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('GPT route error:', error);
    return NextResponse.json({ error: 'An error occurred while generating recipes' }, { status: 500 });
  }
}
