"use client";

import Loading from "@/app/components/Loading";
import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";
import { useEffect, useState } from "react";

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
  return (
    <>
      <PageWrapper>
        <Project
          images={[
            "/images/nature-housing/main.png",
            "/images/nature-housing/homepage.png",
            "/images/nature-housing/house.png",
            "/images/nature-housing/admin.png",
          ]}
          banner={"/images/nature-banner.png"}
          live="https://nature-housing.netlify.app/"
          title={"Nature Housing"}
          techStack={"Next.js 13, Tailwind,  Prisma, MongoDB"}
          description={`
          Nature Housing is a specialized web app designed to connect nature enthusiasts with unique 
          houses in nature. 
          Features: property listings, calendar reservation, advanced search filters, CRUD operations 
          Google and Github login implemented.
          `}
        />
      </PageWrapper>
    </>
  );
}
