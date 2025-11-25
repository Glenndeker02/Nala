# AI Configuration Guide (Google Gemini)

## Overview

Nala uses Google's Gemini AI to provide intelligent features for campaign creation and content optimization. The AI integration includes graceful fallbacks, so the platform works even without an API key (using mock data).

---

## Features Powered by AI

### 1. **Campaign Brief Generation**
- Auto-generate talking points
- Suggest must-haves and don't-wants
- Create relevant hashtags
- **Location**: Campaign creation wizard (Step 3)

### 2. **Content Suggestions**
- Generate video hooks
- Create script outlines
- Suggest visual elements
- **Location**: Creator content creation tools

### 3. **Performance Analysis**
- Analyze video metrics
- Provide actionable insights
- Generate recommendations
- **Location**: Performance dashboard

---

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root (if it doesn't exist)
2. Add your Gemini API key:

```bash
GEMINI_API_KEY="your_actual_api_key_here"
```

3. Save the file

### Step 3: Install Dependencies

The Gemini SDK should already be installed, but if not:

```bash
npm install @google/generative-ai
```

### Step 4: Restart the Development Server

```bash
npm run dev
```

---

## Testing the Integration

### Test 1: Campaign Brief Generation

1. Go to `/founder/campaigns/create`
2. Fill in Steps 1 and 2
3. On Step 3 (Content Requirements), click "Generate with AI"
4. Check if talking points, must-haves, and hashtags are generated

**Expected Result**:
- If API key is configured: AI-generated suggestions
- If API key is missing: Mock data with a warning in console

### Test 2: Check Configuration Status

Run this in the browser console on any page:

```javascript
fetch('/api/ai/status')
  .then(res => res.json())
  .then(data => console.log('AI Status:', data));
```

**Expected Response**:
```json
{
  "configured": true,
  "provider": "Google Gemini",
  "features": ["campaign-brief", "content-suggestions", "performance-analysis"]
}
```

---

## API Endpoints

### Check AI Status
```
GET /api/ai/status
```

### Generate Campaign Brief
```
POST /api/ai/generate-brief
Body: {
  productName: string,
  productDescription: string,
  targetAudience: string,
  campaignGoal: string
}
```

### Generate Content Suggestions
```
POST /api/ai/content-suggestions
Body: {
  campaignName: string,
  productDescription: string,
  platform: string,
  videoLength: string
}
```

### Analyze Performance
```
POST /api/ai/analyze-performance
Body: {
  views: number,
  likes: number,
  comments: number,
  shares: number,
  completionRate: number
}
```

---

## Graceful Fallbacks

The AI integration is designed to work even without an API key:

### Without API Key:
- ✅ Platform functions normally
- ✅ Mock data is used for AI features
- ⚠️ Warning logged to console
- ✅ No errors or crashes

### With API Key:
- ✅ Real AI-generated suggestions
- ✅ Personalized recommendations
- ✅ Better campaign briefs
- ✅ Smarter performance insights

---

## File Structure

```
lib/ai/
  └── gemini.ts          # Main AI utility functions

app/api/ai/
  ├── status/
  │   └── route.ts       # AI status endpoint
  ├── generate-brief/
  │   └── route.ts       # Campaign brief generation
  ├── content-suggestions/
  │   └── route.ts       # Content suggestions
  └── analyze-performance/
      └── route.ts       # Performance analysis
```

---

## Usage Examples

### In Campaign Creation:

```typescript
import { generateCampaignBrief } from '@/lib/ai/gemini';

const handleGenerateWithAI = async () => {
  const suggestions = await generateCampaignBrief({
    productName: "Acme SaaS",
    productDescription: "Project management tool",
    targetAudience: "Small business owners",
    campaignGoal: "Increase signups"
  });

  setTalkingPoints(suggestions.talkingPoints);
  setMustHaves(suggestions.mustHaves);
  setDontWants(suggestions.dontWants);
  setHashtags(suggestions.suggestedHashtags);
};
```

### In Performance Dashboard:

```typescript
import { analyzePerformance } from '@/lib/ai/gemini';

const insights = await analyzePerformance({
  views: 12500,
  likes: 587,
  comments: 43,
  shares: 89,
  completionRate: 68.8
});

console.log('Score:', insights.score);
console.log('Insights:', insights.insights);
console.log('Recommendations:', insights.recommendations);
```

---

## Troubleshooting

### Issue: "AI features not working"

**Solution**:
1. Check if `.env.local` exists
2. Verify `GEMINI_API_KEY` is set correctly
3. Restart the development server
4. Check browser console for errors

### Issue: "Invalid API key"

**Solution**:
1. Verify the API key is correct (no extra spaces)
2. Check if the key is active in Google AI Studio
3. Ensure you're using the correct key format

### Issue: "Rate limit exceeded"

**Solution**:
1. Gemini has generous free tier limits
2. If exceeded, wait a few minutes
3. Consider upgrading your API plan
4. The platform will fallback to mock data automatically

---

## Cost Information

### Gemini API Pricing (as of 2024):

**Free Tier**:
- 60 requests per minute
- 1,500 requests per day
- Sufficient for development and small-scale production

**Paid Tier** (if needed):
- Pay-as-you-go pricing
- Very affordable for typical usage
- See [Google AI Pricing](https://ai.google.dev/pricing)

---

## Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Use environment variables** for API keys
3. ✅ **Rotate keys periodically** for security
4. ✅ **Use different keys** for dev/staging/production
5. ✅ **Monitor API usage** in Google AI Studio

---

## Next Steps

1. ✅ Get your Gemini API key
2. ✅ Add it to `.env.local`
3. ✅ Restart the server
4. ✅ Test the AI features
5. ✅ Monitor usage and performance

---

## Support

If you encounter issues:
1. Check the console for error messages
2. Verify your API key is correct
3. Review the [Gemini documentation](https://ai.google.dev/docs)
4. The platform will work with mock data as a fallback

---

## Summary

The AI integration is **optional but recommended**. The platform works perfectly without it, but AI features provide:
- ✨ Better campaign briefs
- ✨ Smarter content suggestions
- ✨ Deeper performance insights
- ✨ Time-saving automation

Configure it when ready, and enjoy the enhanced experience! 🚀
