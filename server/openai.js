import OpenAI from 'openai';
import { config } from 'dotenv';
import path from 'path';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';

config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const FEATURES = {
  tts: false,  // Text-to-speech generation
  images: false // DALL-E image generation
};

export async function generateFinalStory(sentences) {
  async function attemptStoryGeneration(content) {
    return await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative storyteller. Take the following sentences and create a cohesive, engaging story in Persian (Farsi). Maintain the core narrative but enhance the flow and add descriptive elements. At the end of the story, add one or more sentences that conclude the entire story."
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });
  }

  try {
    // First attempt with original content
    const response = await attemptStoryGeneration(sentences.join("\n"));
    return response.choices[0].message.content;
  } catch (error) {
    // If content policy violation, try sanitizing and regenerating
    if (error?.error?.code === 'content_policy_violation') {
      console.log('Content policy violation detected, attempting to sanitize...');

      // Sanitize the content
      const sanitizeResponse = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `
              این داستان را به شکلی بازنویسی کن که مناسب همه‌ی سنین باشد و محتوای نامناسب نداشته باشد:
              ${sentences.join("\n")}
              
              قوانین:
              - محتوای اصلی داستان را حفظ کن
              - هر نوع محتوای نامناسب را با عبارات مناسب جایگزین کن
              - طول داستان را حفظ کن
            `
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Try generating the final story again with sanitized content
      const finalResponse = await attemptStoryGeneration(sanitizeResponse.choices[0].message.content);
      return finalResponse.choices[0].message.content;
    }

    // If other error, fallback to original sentences
    console.error('OpenAI API error:', error);
    return sentences.join("\n");
  }
}

export async function generateOpeningSentence(theme) {
  const prompt = `یک جمله‌ی فارسی برای شروع یک داستان ${theme} بنویس.
  قوانین:
  - فقط یک جمله‌ی کامل بنویس
  - جمله باید حداکثر در ۱۲۰ کاراکتر تمام شود
  - جمله باید جذاب و گیرا باشد
  - جمله باید در یک نقطه‌ی طبیعی تمام شود`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI API Error:', error.message, error.status);
    throw error;
  }
}

export async function generateContinuationSentence(sentences) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a creative storyteller. Based on the previous sentences, generate a single engaging sentence in Persian (Farsi) that continues the story naturally. 
          
          Rules:
          - The sentence must be complete and end with a proper punctuation mark
          - Maximum length: 120 characters
          - Must maintain narrative coherence
          - If approaching character limit, wrap up the thought naturally
          - Never cut sentences mid-word or mid-thought`
        },
        {
          role: "user",
          content: `Previous sentences:\n${sentences.join("\n")}\n\nGenerate one sentence to continue this story:`
        }
      ],
      temperature: 0.8,
      max_tokens: 100,
      presence_penalty: 0.6
    });

    // Verify the response ends with a punctuation mark
    let sentence = response.choices[0].message.content.trim();
    if (!/[.!?؟،]$/.test(sentence)) {
      sentence += '.';
    }

    return sentence;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'و داستان ادامه یافت...';
  }
}

export async function generateStoryImage(story, features) {
  if (!features.images) {
    return null;
  }

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a safe, family-friendly black and white artistic illustration inspired by this story. Use symbolic and abstract elements to represent the narrative: ${story}. The style should be gentle and atmospheric, suitable for all ages.`,
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

export async function generateStoryAudio(story, features) {
  if (!features.tts) {
    return null;
  }

  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "onyx",
      input: story,
      speed: 1.0,
    });

    // Create audio directory if it doesn't exist
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    await fs.mkdir(audioDir, { recursive: true });

    // Generate unique filename
    const filename = `${uuidv4()}.mp3`;
    const filepath = path.join(audioDir, filename);

    // Save the audio file
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filepath, buffer);

    // Debug logging
    console.log('Audio file saved:', filepath);
    console.log('Audio URL path:', `/audio/${filename}`);

    // Return the URL path to the audio file
    return `/audio/${filename}`;
  } catch (error) {
    console.error('TTS API error:', error);
    return null;
  }
}

export async function generateNextSentence(story, theme) {
  const prompt = `این داستان ${theme} را با یک جمله‌ی فارسی ادامه بده.
  داستان قبلی: ${story}
  قوانین:
  - فقط یک جمله‌ی کامل بنویس
  - جمله باید حداکثر در ۱۲۰ کاراکتر تمام شود
  - جمله باید به‌طور طبیعی با متن قبلی مرتبط باشد
  - جمله باید داستان را در جهت جذاب‌تری پیش ببرد`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 100,
  });

  return response.choices[0].message.content.trim();
}