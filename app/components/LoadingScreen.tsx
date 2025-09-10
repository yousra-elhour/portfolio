"use client";

import { useEffect, useState } from "react";
import { preloadCriticalImages, waitForFonts } from "../utils/preload";

interface LoadingScreenProps {
  children: React.ReactNode;
}

export default function LoadingScreen({ children }: LoadingScreenProps) {
  const [loadingState, setLoadingState] = useState({
    fonts: false,
    images: false,
    ready: false
  });

  useEffect(() => {
    const loadResources = async () => {
      try {
        // Load fonts first
        waitForFonts().then(() => {
          setLoadingState(prev => ({ ...prev, fonts: true }));
        });

        // Load images
        preloadCriticalImages().then(() => {
          setLoadingState(prev => ({ ...prev, images: true }));
        });

        // Mark as fully ready after a brief moment
        setTimeout(() => {
          setLoadingState(prev => ({ ...prev, ready: true }));
        }, 500);
      } catch (error) {
        console.warn('Some resources failed to load:', error);
        // Still mark as ready even if some resources fail
        setTimeout(() => {
          setLoadingState(prev => ({ 
            fonts: true, 
            images: true, 
            ready: true 
          }));
        }, 1000);
      }
    };

    loadResources();
  }, []);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: `
          linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
          url('/clouds/bg.png') center/cover no-repeat,
          #1f2937
        `
      }}
    >
      {/* Always render content but control visibility */}
      <div 
        className={`transition-opacity duration-1000 ease-out ${
          loadingState.fonts 
            ? 'opacity-100' 
            : 'opacity-0'
        }`}
        style={{
          filter: loadingState.images 
            ? 'none' 
            : 'blur(1px)',
          transition: 'opacity 1000ms ease-out, filter 800ms ease-out 300ms'
        }}
      >
        {children}
      </div>
    </div>
  );
}
