import OpenAI from 'openai';
import { config } from 'dotenv';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateFinalStory(sentences) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller. Take the following sentences and create a cohesive, engaging story in Persian (Farsi). Maintain the core narrative but enhance the flow and add descriptive elements. At the end of the story, add one or more sentences that conclude the entire story."
        },
        {
          role: "user",
          content: sentences.join("\n")
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return sentences.join("\n");
  }
}

export async function generateOpeningSentence(theme) {
  try {
    const prompts = {
      'دلنشین': 'یک جمله‌ی کوتاه و دلنشین به فارسی بنویس که شروع یک داستان گرم و صمیمی باشد',
      'ماجراجویی': 'یک جمله‌ی کوتاه و هیجان‌انگیز به فارسی بنویس که شروع یک داستان ماجراجویی باشد',
      'رازآلود': 'یک جمله‌ی کوتاه و مرموز به فارسی بنویس که شروع یک داستان رازآلود باشد',
      'ترسناک': 'یک جمله‌ی کوتاه و دلهره‌آور به فارسی بنویس که شروع یک داستان ترسناک باشد'
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller. Write a single opening sentence in Persian (Farsi) based on the given theme."
        },
        {
          role: "user",
          content: prompts[theme]
        }
      ],
      temperature: 0.8,
      max_tokens: 100
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'یک روز صبح...';
  }
}

export async function generateContinuationSentence(sentences) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller. Based on the previous sentences, generate a single engaging sentence in Persian (Farsi) that continues the story naturally. Match the tone and style of the previous sentences. Keep the sentence concise but meaningful."
        },
        {
          role: "user",
          content: `Previous sentences:\n${sentences.join("\n")}\n\nGenerate one sentence to continue this story:`
        }
      ],
      temperature: 0.8,
      max_tokens: 100
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'و داستان ادامه یافت...';
  }
}