// Font preload component - Server Component
export default function FontPreloader() {
  return (
    <>
      <link
        rel="preload"
        href="/fonts/Bhavuka-Regular.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
      <style dangerouslySetInnerHTML={{
        __html: `
          @font-face {
            font-family: "Bhavuka";
            src: url("/fonts/Bhavuka-Regular.ttf") format("truetype");
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `
      }} />
    </>
  );
}
