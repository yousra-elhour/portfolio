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
            "/images/admissionPedia/main.png",
            "/images/admissionPedia/Search.png",
            "/images/admissionPedia/Add School.png",
            "/images/admissionPedia/User dashboard.png",
            "/images/admissionPedia/Sign up.png",
            "/images/admissionPedia/School Page.png",
            "/images/admissionPedia/add-school.png",
          ]}
          banner={"/images/admissionPedia/banner.jpg"}
          live="https://admissionpedia.dev/"
          design="https://www.behance.net/gallery/183533805/AdmissionPedia-Design"
          title={"AdmissionPedia"}
          techStack={"React, NodeJS, Tailwind, SQL"}
          description={`
          Worked as the Lead Front End Engineer and Designer at AdmissionPedia Startup, a school admission company for schools and parents,
           I took the lead in creating user-friendly web interfaces. Additionally, 
           I managed graphic design tasks, such as creating business cards, email template and brochures to support our branding.
          `}
          additionalTitle="Branding"
          additionalDescription="Branding Graphics that I did for the company"
          additionalImages={[
            "/images/admissionPedia/banner.jpg",
            "/images/admissionPedia/business.png",
            "/images/admissionPedia/email.png",
            "/images/admissionPedia/brochure-1.png",
          ]}
        />
      </PageWrapper>
    </>
  );
}
