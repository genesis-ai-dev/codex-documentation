import React from 'react';

interface LoomVideoProps {
  videoId: string;
  timestamp?: number;
  title?: string;
  className?: string;
}

export function LoomVideo({ videoId, timestamp = 0, title = "Loom Video", className = "" }: LoomVideoProps) {
  const embedUrl = `https://www.loom.com/embed/${videoId}?sid=1&t=${timestamp}`;
  
  return (
    <div className={`relative w-full aspect-video rounded-lg overflow-hidden shadow-lg ${className}`}>
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        title={title}
        loading="lazy"
      />
    </div>
  );
} 