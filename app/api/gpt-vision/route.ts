import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { base64Image } = await req.json();
  console.log("🔍 Received base64Image (first 100 chars):", base64Image?.slice(0, 100));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
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
              },
            },
          ],
        },
      ],
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  // console.log("🧠 Full OpenAI response:", JSON.stringify(data, null, 2));
  const text = data?.choices?.[0]?.message?.content ?? '';

  try {
    // console.log("🧠 GPT Raw response:", text);
    const ingredients = JSON.parse(text);
    return NextResponse.json({ ingredients });
  } catch (e) {
    return NextResponse.json({ error: 'Could not parse response', raw: text }, { status: 500 });
  }
}