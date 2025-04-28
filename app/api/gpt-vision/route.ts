import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { base64Image } = await req.json();
  console.log("🔍 Received base64Image (first 100 chars):", base64Image?.slice(0, 100));

  try {
    // For testing purposes, return a mock response with some common ingredients
    // This will allow the UI to work while we fix the API access issue
    const mockIngredients = ["Tomatoes", "Onions", "Garlic", "Bell Peppers", "Olive Oil"];
    
    return NextResponse.json({ ingredients: mockIngredients });
    
    // The actual API call is commented out until we can fix the model access
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a food image recognition expert. Return ONLY a JSON array of ingredient names you detect in the image. No code block formatting, no explanation. Just output JSON like this: ["carrots", "lettuce", "tomatoes"].`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                  detail: "low"
                },
              },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log("🔍 OpenAI API Response:", JSON.stringify(data, null, 2));
    
    if (data.error) {
      console.error("❌ OpenAI API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const text = data?.choices?.[0]?.message?.content ?? '';
    console.log("🔍 GPT Response Text:", text);

    try {
      const ingredients = JSON.parse(text);
      return NextResponse.json({ ingredients });
    } catch (e) {
      console.error("❌ JSON Parse Error:", e);
      return NextResponse.json({ error: 'Could not parse response', raw: text }, { status: 500 });
    }
    */
  } catch (error) {
    console.error("❌ General Error:", error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}