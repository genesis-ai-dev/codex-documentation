"use client";

import React, { useEffect, useRef } from 'react';

interface LoomVideoProps {
  videoId: string;
  timestamp?: number;
  title?: string;
  className?: string;
}

export function LoomVideo({ videoId, timestamp = 0, title = "Loom Video", className = "" }: LoomVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const embedUrl = `https://www.loom.com/embed/${videoId}?sid=1&t=${timestamp}`;
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleVideoClick = (event: Event) => {
      // Check if this click is on our video container
      const clickedContainer = (event.target as Element).closest('[data-loom-video]');
      if (clickedContainer === container) {
        // This video was clicked - pause all others and ensure this one is active
        pauseOtherVideos(container);
        ensureVideoActive(container);
      }
    };

    // Listen for clicks on any video container in the document
    document.addEventListener('click', handleVideoClick);

    return () => {
      document.removeEventListener('click', handleVideoClick);
    };
  }, []);

  const pauseOtherVideos = (activeContainer: HTMLDivElement) => {
    // Find all other video containers and replace them with placeholders
    const allVideoContainers = document.querySelectorAll('[data-loom-video]');
    
    allVideoContainers.forEach((container) => {
      if (container !== activeContainer && !container.hasAttribute('data-is-placeholder')) {
        const iframe = container.querySelector('iframe');
        if (iframe) {
          replaceWithPlaceholder(container as HTMLDivElement, iframe);
        }
      }
    });
  };

  const ensureVideoActive = (container: HTMLDivElement) => {
    // If this container is a placeholder, restore the iframe
    if (container.hasAttribute('data-is-placeholder')) {
      restoreIframe(container);
    }
  };

  const replaceWithPlaceholder = (container: HTMLDivElement, iframe: HTMLIFrameElement) => {
    // Store the iframe data for restoration
    container.setAttribute('data-iframe-src', iframe.src);
    container.setAttribute('data-iframe-title', iframe.title || '');
    container.setAttribute('data-is-placeholder', 'true');
    
    // Create placeholder content
    const placeholder = document.createElement('div');
    placeholder.className = 'absolute inset-0 bg-gray-900 flex flex-col items-center justify-center cursor-pointer group transition-all hover:bg-gray-800';
    placeholder.innerHTML = `
      <div class="w-20 h-20 bg-white bg-opacity-90 rounded-full flex items-center justify-center mb-4 group-hover:bg-opacity-100 transition-all transform group-hover:scale-110 shadow-lg">
        <svg class="w-8 h-8 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 5v10l8-5-8-5z"/>
        </svg>
      </div>
      <p class="text-white text-sm font-medium opacity-90">${iframe.title || 'Click to play video'}</p>
    `;
    
    // Replace iframe with placeholderhttps://classy-clafoutis-ff4fd0.netlify.app/docs/translation/back-translations
    iframe.remove();
    container.appendChild(placeholder);
  };

  const restoreIframe = (container: HTMLDivElement) => {
    const src = container.getAttribute('data-iframe-src');
    const title = container.getAttribute('data-iframe-title');
    
    if (src) {
      // Remove placeholder
      const placeholder = container.querySelector('div');
      if (placeholder) {
        placeholder.remove();
      }
      
      // Create new iframe
      const iframe = document.createElement('iframe');
      iframe.src = src;
      iframe.title = title || '';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      iframe.className = 'absolute inset-0 w-full h-full';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      
      // Add iframe to container
      container.appendChild(iframe);
      
      // Remove placeholder attributes
      container.removeAttribute('data-iframe-src');
      container.removeAttribute('data-iframe-title');
      container.removeAttribute('data-is-placeholder');
    }
  };

  return (
    <div 
      ref={containerRef}
      data-loom-video
      className={`relative w-full aspect-video rounded-lg overflow-hidden shadow-lg ${className}`}
    >
      <iframe
        src={embedUrl}
        frameBorder="0"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      />
    </div>
  );
} 