import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImageWithRetry(recipeName: string, retries = 3, delay = 1000) {
  try {
    const imageResponse = await openai.images.generate({
      model: "dall-e-2",
      prompt: `A simple, colorful illustration of ${recipeName}. The dish should be shown in a fun, animated style with a clean background.`,
      n: 1,
      size: "512x512",
    });

    return imageResponse.data[0].url;
  } catch (error: any) {
    if (error.status === 429 && retries > 0) {
      // Wait with exponential backoff
      await sleep(delay);
      return generateImageWithRetry(recipeName, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { recipeName } = await req.json();
    
    if (!recipeName) {
      return NextResponse.json({ error: 'Recipe name is required' }, { status: 400 });
    }

    const imageUrl = await generateImageWithRetry(recipeName);
    return NextResponse.json({ imageUrl });
  } catch (error: any) {
    console.error('Error generating image:', error);
    
    if (error.status === 429) {
      return NextResponse.json({ 
        error: 'Rate limit reached. Please try again in a few minutes.',
        retryAfter: 60 // Suggest retrying after 1 minute
      }, { status: 429 });
    }
    
    return NextResponse.json({ 
      error: 'An error occurred while generating the image. Please try again later.' 
    }, { status: 500 });
  }
} 