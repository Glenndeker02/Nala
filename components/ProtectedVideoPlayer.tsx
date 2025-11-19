'use client';

import { useEffect, useRef, useState } from 'react';

interface ProtectedVideoPlayerProps {
  videoId: string;
  onLoad?: () => void;
}

export function ProtectedVideoPlayer({ videoId, onLoad }: ProtectedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [isWatermarked, setIsWatermarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStreamUrl() {
      try {
        const response = await fetch(`/api/videos/stream/${videoId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to load video');
        }

        const data = await response.json();
        setStreamUrl(data.streamUrl);
        setIsWatermarked(data.isWatermarked);
        setLoading(false);
        onLoad?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load video');
        setLoading(false);
      }
    }

    fetchStreamUrl();
  }, [videoId, onLoad]);

  // Disable right-click on video
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Disable download attribute
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.controlsList.add('nodownload');
    }
  }, [streamUrl]);

  if (loading) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center text-red-600">
          <svg
            className="w-12 h-12 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isWatermarked && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium">
          Preview Only - Watermarked
        </div>
      )}

      <video
        ref={videoRef}
        src={streamUrl}
        controls
        controlsList="nodownload"
        onContextMenu={handleContextMenu}
        className="w-full aspect-video bg-black rounded-lg"
        playsInline
      />

      {/* Overlay to prevent right-click */}
      <div
        className="absolute inset-0 pointer-events-none"
        onContextMenu={handleContextMenu}
      />

      {isWatermarked && (
        <p className="mt-2 text-sm text-gray-600 text-center">
          This video is watermarked. The watermark will be removed after approval and payment.
        </p>
      )}
    </div>
  );
}
