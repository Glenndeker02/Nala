import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
} else {
    console.warn("⚠️ GEMINI_API_KEY not found. AI features will use mock responses.");
}

/**
 * Generate campaign brief suggestions using Gemini AI
 */
export async function generateCampaignBrief(params: {
    productName: string;
    productDescription: string;
    targetAudience: string;
    campaignGoal: string;
}): Promise<{
    talkingPoints: string[];
    mustHaves: string[];
    dontWants: string[];
    suggestedHashtags: string;
}> {
    if (!genAI) {
        // Return mock data if AI is not configured
        return {
            talkingPoints: [
                `Showcase the key features of ${params.productName}`,
                "Demonstrate how it solves a real problem",
                "Share your personal experience with the product",
                "Include a clear call-to-action"
            ],
            mustHaves: [
                "Clear product demonstration",
                "Authentic enthusiasm",
                "Mention the brand name at least twice",
                "Include pricing or trial information"
            ],
            dontWants: [
                "Don't compare to competitors by name",
                "Avoid overly technical jargon",
                "Don't make unrealistic claims",
                "No negative language"
            ],
            suggestedHashtags: `#${params.productName.replace(/\s+/g, '')} #ProductReview #Sponsored`
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a marketing expert helping create a campaign brief for influencer marketing.

Product Name: ${params.productName}
Product Description: ${params.productDescription}
Target Audience: ${params.targetAudience}
Campaign Goal: ${params.campaignGoal}

Generate a comprehensive campaign brief with the following sections:

1. Key Talking Points (4-5 points): What should creators emphasize in their videos?
2. Must-Haves (4-5 points): Essential elements that MUST be included
3. Don't-Wants (4-5 points): Things to avoid
4. Suggested Hashtags: 3-5 relevant hashtags

Format your response as JSON with these exact keys: talkingPoints, mustHaves, dontWants, suggestedHashtags.
Each array should contain strings. suggestedHashtags should be a single string with hashtags separated by spaces.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Try to parse JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                talkingPoints: parsed.talkingPoints || [],
                mustHaves: parsed.mustHaves || [],
                dontWants: parsed.dontWants || [],
                suggestedHashtags: parsed.suggestedHashtags || ""
            };
        }

        throw new Error("Failed to parse AI response");
    } catch (error) {
        console.error("Error generating campaign brief:", error);
        // Fallback to mock data on error
        return {
            talkingPoints: [
                `Showcase the key features of ${params.productName}`,
                "Demonstrate how it solves a real problem",
                "Share your personal experience with the product",
                "Include a clear call-to-action"
            ],
            mustHaves: [
                "Clear product demonstration",
                "Authentic enthusiasm",
                "Mention the brand name at least twice",
                "Include pricing or trial information"
            ],
            dontWants: [
                "Don't compare to competitors by name",
                "Avoid overly technical jargon",
                "Don't make unrealistic claims",
                "No negative language"
            ],
            suggestedHashtags: `#${params.productName.replace(/\s+/g, '')} #ProductReview #Sponsored`
        };
    }
}

/**
 * Generate content suggestions for creators
 */
export async function generateContentSuggestions(params: {
    campaignName: string;
    productDescription: string;
    platform: string;
    videoLength: string;
}): Promise<{
    hooks: string[];
    scriptOutline: string[];
    visualSuggestions: string[];
}> {
    if (!genAI) {
        return {
            hooks: [
                "Start with a surprising fact or statistic",
                "Ask a relatable question",
                "Show the problem before the solution"
            ],
            scriptOutline: [
                "Hook (0-3s): Grab attention",
                "Problem (3-10s): Identify the pain point",
                "Solution (10-25s): Introduce the product",
                "Demo (25-45s): Show it in action",
                "CTA (45-60s): Call to action"
            ],
            visualSuggestions: [
                "Use dynamic transitions",
                "Show before/after comparisons",
                "Include text overlays for key points"
            ]
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `You are a content creation expert specializing in ${params.platform} videos.

Campaign: ${params.campaignName}
Product: ${params.productDescription}
Platform: ${params.platform}
Video Length: ${params.videoLength}

Generate creative suggestions for this video:

1. Hooks (3-4 options): Attention-grabbing opening lines
2. Script Outline (5-6 sections): Suggested structure with timing
3. Visual Suggestions (4-5 ideas): Creative visual elements to include

Format as JSON with keys: hooks, scriptOutline, visualSuggestions. All values should be arrays of strings.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                hooks: parsed.hooks || [],
                scriptOutline: parsed.scriptOutline || [],
                visualSuggestions: parsed.visualSuggestions || []
            };
        }

        throw new Error("Failed to parse AI response");
    } catch (error) {
        console.error("Error generating content suggestions:", error);
        return {
            hooks: [
                "Start with a surprising fact or statistic",
                "Ask a relatable question",
                "Show the problem before the solution"
            ],
            scriptOutline: [
                "Hook (0-3s): Grab attention",
                "Problem (3-10s): Identify the pain point",
                "Solution (10-25s): Introduce the product",
                "Demo (25-45s): Show it in action",
                "CTA (45-60s): Call to action"
            ],
            visualSuggestions: [
                "Use dynamic transitions",
                "Show before/after comparisons",
                "Include text overlays for key points"
            ]
        };
    }
}

/**
 * Analyze video performance and provide insights
 */
export async function analyzePerformance(params: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    completionRate: number;
}): Promise<{
    insights: string[];
    recommendations: string[];
    score: number;
}> {
    if (!genAI) {
        const score = Math.min(100, (params.views / 1000) * 10 + params.completionRate);
        return {
            insights: [
                `Your video has ${params.views.toLocaleString()} views with a ${params.completionRate.toFixed(1)}% completion rate`,
                `Engagement rate is ${(((params.likes + params.comments + params.shares) / params.views) * 100).toFixed(2)}%`
            ],
            recommendations: [
                "Continue creating similar content",
                "Engage with comments to boost visibility",
                "Share to your story for extra reach"
            ],
            score: Math.round(score)
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const engagementRate = ((params.likes + params.comments + params.shares) / params.views) * 100;

        const prompt = `Analyze this video performance and provide insights:

Views: ${params.views}
Likes: ${params.likes}
Comments: ${params.comments}
Shares: ${params.shares}
Completion Rate: ${params.completionRate}%
Engagement Rate: ${engagementRate.toFixed(2)}%

Provide:
1. Insights (2-3 key observations)
2. Recommendations (3-4 actionable tips)
3. Score (0-100 based on overall performance)

Format as JSON with keys: insights (array), recommendations (array), score (number).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
                insights: parsed.insights || [],
                recommendations: parsed.recommendations || [],
                score: parsed.score || 0
            };
        }

        throw new Error("Failed to parse AI response");
    } catch (error) {
        console.error("Error analyzing performance:", error);
        const score = Math.min(100, (params.views / 1000) * 10 + params.completionRate);
        return {
            insights: [
                `Your video has ${params.views.toLocaleString()} views with a ${params.completionRate.toFixed(1)}% completion rate`,
                `Engagement rate is ${(((params.likes + params.comments + params.shares) / params.views) * 100).toFixed(2)}%`
            ],
            recommendations: [
                "Continue creating similar content",
                "Engage with comments to boost visibility",
                "Share to your story for extra reach"
            ],
            score: Math.round(score)
        };
    }
}

/**
 * Check if AI is configured and available
 */
export function isAIConfigured(): boolean {
    return genAI !== null;
}
