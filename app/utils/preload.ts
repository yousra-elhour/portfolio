// Utility to preload critical cloud animation images (not the background)

// Every <Image> on the site renders through the next/image optimizer, so the
// URLs the browser actually requests look like /_next/image?url=...&w=...&q=75.
// Preloading the raw /clouds/*.png files warmed nothing and cost ~5.8MB of
// never-rendered downloads on every cold load — warm the optimized variant
// the components will really use instead.
const OPTIMIZER_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export const optimizedImageUrl = (src: string) => {
  const target = window.innerWidth * (window.devicePixelRatio || 1);
  const width =
    OPTIMIZER_WIDTHS.find((w) => w >= target) ??
    OPTIMIZER_WIDTHS[OPTIMIZER_WIDTHS.length - 1];
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
};

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
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Resolve even on error to prevent blocking
      img.src = optimizedImageUrl(src);

      // Add timeout to prevent indefinite loading
      setTimeout(() => resolve(), 5000);
    });
  });

  return Promise.all(preloadPromises);
};

// Check if fonts are ready
export const waitForFonts = () => {
  if (typeof window === 'undefined') return Promise.resolve();

  if (document.fonts && document.fonts.ready) {
    // document.fonts.load('... var(--font-x)') never resolved to real fonts —
    // CSS variables aren't valid in font shorthand — so those checks only
    // added failed lookups. fonts.ready alone is the accurate signal; the
    // race caps a pathological hang so the page can never stay hidden.
    return Promise.race([
      document.fonts.ready.then(() => undefined),
      new Promise<void>((resolve) => setTimeout(resolve, 2500)),
    ]).then(() => {
      // Additional safety delay to ensure fonts are fully applied
      return new Promise<void>((resolve) => setTimeout(resolve, 100));
    });
  }

  // Fallback for browsers without font loading API
  return new Promise<void>((resolve) => {
    // Longer timeout to ensure fonts are loaded
    setTimeout(resolve, 1500);
  });
};
