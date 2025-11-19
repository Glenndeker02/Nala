'use client';

import { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';

interface AIBriefGeneratorProps {
  campaignId?: string;
  onGenerated?: (brief: any) => void;
}

export function AIBriefGenerator({ campaignId, onGenerated }: AIBriefGeneratorProps) {
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keyFeatures, setKeyFeatures] = useState<string[]>(['']);
  const [videoStyle, setVideoStyle] = useState<string>('review');
  const [tone, setTone] = useState<string>('friendly');
  const [loading, setLoading] = useState(false);
  const [generatedBrief, setGeneratedBrief] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addFeature = () => {
    setKeyFeatures([...keyFeatures, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...keyFeatures];
    updated[index] = value;
    setKeyFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-brief', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          productName,
          productDescription,
          targetAudience,
          keyFeatures: keyFeatures.filter((f) => f.trim() !== ''),
          videoStyle,
          tone,
          campaignId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate brief');
      }

      const data = await response.json();
      setGeneratedBrief(data.data);
      onGenerated?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate brief');
    } finally {
      setLoading(false);
    }
  };

  if (generatedBrief) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>✨ AI-Generated UGC Brief</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Script */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📝 Video Script</h4>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {generatedBrief.script}
            </div>
          </div>

          {/* Talking Points */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 Key Talking Points</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {generatedBrief.talkingPoints.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          </div>

          {/* Hook Ideas */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">🎣 Hook Ideas</h4>
            <div className="space-y-2">
              {generatedBrief.hookIdeas.map((hook: string, i: number) => (
                <div key={i} className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-sm">
                  {hook}
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2"># Suggested Hashtags</h4>
            <div className="flex flex-wrap gap-2">
              {generatedBrief.hashtags.map((tag: string, i: number) => (
                <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">📢 Call-to-Action</h4>
            <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-sm">
              {generatedBrief.callToAction}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setGeneratedBrief(null)} variant="ghost">
              Generate New Brief
            </Button>
            <Button
              onClick={() => {
                // Copy to clipboard
                const text = `
VIDEO SCRIPT:
${generatedBrief.script}

TALKING POINTS:
${generatedBrief.talkingPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')}

HOOK IDEAS:
${generatedBrief.hookIdeas.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}

HASHTAGS:
${generatedBrief.hashtags.join(' ')}

CALL-TO-ACTION:
${generatedBrief.callToAction}
                `.trim();
                navigator.clipboard.writeText(text);
                alert('Brief copied to clipboard!');
              }}
              variant="primary"
            >
              Copy Brief
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>✨ AI Brief Generator</CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Let AI help you craft the perfect UGC video brief for creators
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Name */}
        <div>
          <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <input
            type="text"
            id="productName"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., ProductivityPro"
          />
        </div>

        {/* Product Description */}
        <div>
          <label htmlFor="productDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Product Description *
          </label>
          <textarea
            id="productDescription"
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Describe what your product does and its main benefits..."
          />
        </div>

        {/* Target Audience */}
        <div>
          <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-1">
            Target Audience *
          </label>
          <input
            type="text"
            id="targetAudience"
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Busy professionals aged 25-40"
          />
        </div>

        {/* Key Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Features *
          </label>
          {keyFeatures.map((feature, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => updateFeature(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder={`Feature ${index + 1}`}
              />
              {keyFeatures.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <Button type="button" onClick={addFeature} variant="ghost" size="sm">
            + Add Feature
          </Button>
        </div>

        {/* Video Style and Tone */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="videoStyle" className="block text-sm font-medium text-gray-700 mb-1">
              Video Style
            </label>
            <select
              id="videoStyle"
              value={videoStyle}
              onChange={(e) => setVideoStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="review">Review</option>
              <option value="tutorial">Tutorial</option>
              <option value="testimonial">Testimonial</option>
              <option value="unboxing">Unboxing</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
              Tone
            </label>
            <select
              id="tone"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="energetic">Energetic</option>
              <option value="educational">Educational</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={handleGenerate}
          variant="primary"
          className="w-full"
          disabled={
            loading ||
            !productName ||
            !productDescription ||
            !targetAudience ||
            keyFeatures.filter((f) => f.trim()).length === 0
          }
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Generating with AI...
            </>
          ) : (
            '✨ Generate Brief with AI'
          )}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Powered by GPT-4. Results may take 10-20 seconds.
        </p>
      </CardContent>
    </Card>
  );
}
