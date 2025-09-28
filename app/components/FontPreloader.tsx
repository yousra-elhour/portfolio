// Font preload component - Server Component
export default function FontPreloader() {
  return (
    <>
      {/* Additional font optimizations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Prevent font swap flash */
          @font-face {
            font-family: 'font-display-fallback';
            size-adjust: 100%;
            src: local('Arial');
          }
          
          /* Ensure all font variables are properly loaded */
          .font-loading-complete {
            visibility: visible;
            opacity: 1;
          }
        `
      }} />
    </>
  );
}
