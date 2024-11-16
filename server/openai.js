import OpenAI from 'openai';
import { config } from 'dotenv';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const FEATURES = {
  tts: false,  // Text-to-speech generation
  images: false // DALL-E image generation
};

export async function generateFinalStory(sentences) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      'دلنشین': 'یک جمله‌ی کوتاه و دلنشین به فرسی بنویس که شروع یک داستان گرم و صمیمی باشد',
      'ماجراجویی': 'یک جمله‌ی کوتاه و هیجان‌انگیز به فارسی بنویس که شروع یک داستان ماجراجویی باشد',
      'رازآلود': 'یک جمله‌ی کوتاه و مرموز به فارسی بنویس که شروع یک داستان رازآلود باشد',
      'ترسناک': 'یک جمله‌ی کوتاه و دلهره‌آور به فارسی بنویس که شروع یک داستان ترسناک باشد'
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
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
      model: "gpt-4",
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

export async function generateStoryImage(story) {
  if (!FEATURES.images) {
    return null;
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a black and white artistic illustration that captures the essence of this Persian story: ${story}. The style should be dramatic and atmospheric.`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
      style: "vivid"
    });

    return response.data[0].url;
  } catch (error) {
    console.error('DALL-E API error:', error);
    return null;
  }
}

export async function generateStoryAudio(story) {
  if (!FEATURES.tts) {
    return null;
  }

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: story,
      speed: 1.0,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (error) {
    console.error('TTS API error:', error);
    return null;
  }
}