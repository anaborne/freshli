'use server'

import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.FRESHLI_OPENAI_API_KEY
});

export const getResponse = async (prompt: string) => {
    var output: string = "";

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [{ role: 'user', content: prompt }],
        });
        console.log(response.choices[0].message);

        if (response.choices[0].message.content)
        {
            output = response.choices[0].message.content?.toString();
        }
    } catch (error) {
        console.error("Error fetching recipe responses:", error);

        output = "Error fetching recipe responses."
    }

    return output;
}
