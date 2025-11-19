import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface BriefGenerationInput {
  productName: string;
  productDescription: string;
  targetAudience: string;
  videoStyle?: 'tutorial' | 'testimonial' | 'unboxing' | 'comparison' | 'review';
  keyFeatures: string[];
  tone?: 'professional' | 'casual' | 'energetic' | 'friendly' | 'educational';
  videoLength?: number; // in seconds
}

export interface GeneratedBrief {
  generatedScript: string;
  talkingPoints: string[];
  hookIdeas: string[];
  hashtagSuggestions: string[];
  callToAction: string;
  tokensUsed: number;
}

/**
 * Generate a UGC video brief using AI
 */
export async function generateUGCBrief(
  input: BriefGenerationInput
): Promise<GeneratedBrief> {
  const {
    productName,
    productDescription,
    targetAudience,
    videoStyle = 'review',
    keyFeatures,
    tone = 'friendly',
    videoLength = 60,
  } = input;

  const prompt = `You are an expert UGC (User-Generated Content) video script writer for social media platforms like TikTok and Instagram Reels.

Create a compelling video brief for a content creator based on the following information:

**Product:** ${productName}
**Description:** ${productDescription}
**Target Audience:** ${targetAudience}
**Video Style:** ${videoStyle}
**Tone:** ${tone}
**Key Features to Highlight:**
${keyFeatures.map((f, i) => `${i + 1}. ${f}`).join('\n')}
**Video Length:** ${videoLength} seconds

Generate the following:

1. **Full Script:** A complete ${videoLength}-second video script that a creator can follow. Include timing cues (e.g., "0-5s:", "5-15s:"). Make it natural, conversational, and authentic - not salesy.

2. **Talking Points:** 5-7 key points the creator must cover in the video.

3. **Hook Ideas:** 3 attention-grabbing opening lines (first 3 seconds) that will make viewers stop scrolling.

4. **Hashtags:** 8-10 relevant hashtags for maximum reach on TikTok/Instagram.

5. **Call-to-Action:** A clear, compelling CTA for the end of the video.

Format your response as JSON:
{
  "script": "Full script with timing...",
  "talkingPoints": ["point 1", "point 2", ...],
  "hookIdeas": ["hook 1", "hook 2", "hook 3"],
  "hashtags": ["#hashtag1", "#hashtag2", ...],
  "callToAction": "Clear CTA..."
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert UGC video script writer. Generate authentic, engaging scripts that convert viewers into customers. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response || '{}');

    return {
      generatedScript: parsed.script || '',
      talkingPoints: parsed.talkingPoints || [],
      hookIdeas: parsed.hookIdeas || [],
      hashtagSuggestions: parsed.hashtags || [],
      callToAction: parsed.callToAction || '',
      tokensUsed: completion.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error('AI brief generation error:', error);
    throw new Error('Failed to generate brief with AI');
  }
}

/**
 * Improve an existing brief with AI suggestions
 */
export async function improveBrief(existingBrief: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at improving UGC video briefs. Make them more engaging, clear, and actionable.',
      },
      {
        role: 'user',
        content: `Improve this video brief to make it more compelling and easier for a content creator to execute:\n\n${existingBrief}`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1500,
  });

  return completion.choices[0].message.content || existingBrief;
}

/**
 * Generate hook variations
 */
export async function generateHookVariations(
  productName: string,
  mainBenefit: string,
  count: number = 5
): Promise<string[]> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert at writing viral TikTok/Instagram Reels hooks that make people stop scrolling.',
      },
      {
        role: 'user',
        content: `Generate ${count} different attention-grabbing opening hooks for a video about ${productName}. Main benefit: ${mainBenefit}. Make them short (max 10 words), punchy, and scroll-stopping. Format as JSON array.`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.9,
    max_tokens: 500,
  });

  const response = JSON.parse(completion.choices[0].message.content || '{}');
  return response.hooks || [];
}
