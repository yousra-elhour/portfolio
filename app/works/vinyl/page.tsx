"use client";
import { useEffect, useState } from "react";
import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";
import Loading from "@/app/components/Loading";

export default function WorksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    const preloadImages = async () => {
      // Array of image URLs to preload
      const imageUrls = [
        "/images/Desktop - 4.png",
        "/images/product-page.png",
        "/images/buy-vinyl.png",
        "/images/vinyl-banner.png",
        "/images/admin-s1.jpg",
      ];

      try {
        let loadedImages = 0;
        const imagePromises = imageUrls.map((url) => {
          return new Promise<void>((resolve, reject) => {
            const image = new Image();
            image.src = url;
            image.onload = () => {
              loadedImages++;
              setLoadingPercentage((loadedImages / imageUrls.length) * 100);
              resolve(); // No argument needed here
            };
            image.onerror = reject;
          });
        });

        await Promise.all(imagePromises);
        setIsLoading(false); // Set loading state to false once all images are loaded
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    preloadImages();
  }, []);

  if (isLoading) {
    // Render a loading state while images are preloading
    return <Loading loadingPercentage={loadingPercentage} />;
  }

  // Once images are loaded, render the page content
  return (
    <>
      <PageWrapper>
        <Project
          images={[
            "/images/Desktop - 4.png",
            "/images/product-page.png",
            "/images/buy-vinyl.png",
          ]}
          banner={"/images/vinyl-banner.png"}
          title={"Vinyl E-Commerce with CMS"}
          live="https://vinyl-client-omega.vercel.app/"
          techStack={"Next.js 13, Tailwind, Shadcn, Prisma, SQL, Spotify API"}
          description={`
            E-commerce website for vinyl enthusiasts. The webapp offers
            features such as album playback, shortlisting, and cart
            management. Users can also filter and search for their
            favorite albums. The website comes with a content management
            system (CMS) that allows administrators to edit the billboard,
            add new products, and manage various e-commerce-related
            content.
          `}
          additionalImages={["/images/admin-s1.jpg"]}
          additionalTitle="Vinyl E-commerce CMS"
          additionalLink="https://vinyl-admin.vercel.app/"
          additionalDescription="You need the Login credentials to be able to use the admin
          website Contact me if you're interested in testing it."
        />
      </PageWrapper>
    </>
  );
}
