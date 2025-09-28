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
        // Add class to body to indicate fonts are loading
        document.body.classList.add('fonts-loading');
        
        // Load fonts first
        waitForFonts().then(() => {
          setLoadingState(prev => ({ ...prev, fonts: true }));
          // Remove loading class and add loaded class
          document.body.classList.remove('fonts-loading');
          document.body.classList.add('fonts-loaded');
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
        document.body.classList.remove('fonts-loading');
        document.body.classList.add('fonts-loaded');
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
   
  );
}
