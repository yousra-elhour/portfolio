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
    return document.fonts.ready;
  }
  
  // Fallback for browsers without font loading API
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 1000);
  });
};
