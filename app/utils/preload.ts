// Utility to preload critical cloud animation images (not the background)
export const preloadCriticalImages = () => {
  if (typeof window === 'undefined') return Promise.resolve();

  const criticalImages = [
    // Only preload the cloud animation images, not the background
    '/clouds/lowCloud1.png', 
    '/clouds/lowCloud2.png',
    '/clouds/highCloud1.png',
    // Also preload the main background to prevent flash
    '/clouds/bg.png',
  ];

  const preloadPromises = criticalImages.map((src) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve even on error to prevent blocking
      img.src = src;
      
      // Add timeout to prevent indefinite loading
      setTimeout(() => resolve(), 5000); // Increased timeout for better reliability
    });
  });

  return Promise.all(preloadPromises);
};

// Check if fonts are ready
export const waitForFonts = () => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  if (document.fonts && document.fonts.ready) {
    // Wait for both document fonts and specific font families
    return Promise.all([
      document.fonts.ready,
      // Additional check for specific fonts
      document.fonts.load('400 16px var(--font-title)').catch(() => {}),
      document.fonts.load('300 16px var(--font-sans)').catch(() => {}),
      document.fonts.load('400 16px var(--font-pixelify)').catch(() => {}),
      document.fonts.load('400 16px var(--font-bhavuka)').catch(() => {}),
    ]).then(() => {
      // Additional safety delay to ensure fonts are fully applied
      return new Promise<void>(resolve => setTimeout(resolve, 100));
    });
  }
  
  // Fallback for browsers without font loading API
  return new Promise<void>((resolve) => {
    // Longer timeout to ensure fonts are loaded
    setTimeout(resolve, 1500);
  });
};
