"use client";

import Loading from "@/app/components/Loading";
import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";
import { useEffect, useState } from "react";
import Previous from "@/app/components/Previous";

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
  const projects = [
    {
      img: "/images/universityProjects/shoeproject.png",
      techStack: "Java, SpringBoot, ThymeLeaf, Bootstrap",
      title: "Fast Shoe Store WebApp",
      code: "https://github.com/cirrusyk/e-shop-project",
      design:
        "https://www.behance.net/gallery/147408103/E-commerce-website-for-shoes",
    },

    {
      img: "/images/universityProjects/sist-connect.png",
      techStack: "Flutter, Firebase",
      title: "Sist Connect - Social Media For University",
      code: "https://github.com/cirrusyk/SistConnect",
      design:
        "https://www.behance.net/gallery/147408235/University-social-media-app-concept",
    },
    {
      img: "/images/universityProjects/tictactoe.jpg",
      techStack: "Python, Pygame, Agile, UML Diagrams, ",
      title: "Tic Tic Tac using AI algorithms ",
      code: "https://github.com/yousra-elhour/tic-tac-toe/tree/master",
    },

    {
      img: "/images/universityProjects/hr-manager.png",
      techStack: "Flutter, Firebase ",
      title: "Human Resources App ",
      code: "https://github.com/cirrusyk/HumanResourceApp/tree/master",
    },
  ];
  return (
    <>
      <PageWrapper>
        <Project
          banner={"/images/cmu-blue-logo.gif"}
          title={"University Projects"}
          techStack={
            "Web & App Development, Object Oriented Programming, Software Design"
          }
          description={`
          Throughout my Bachelor of Software Engineering at Cardiff Metropolitan University, 
          I worked on a variety of projects, Object Oriented programming, web development, database work, and software engineering principles. 
          `}
          imagesTitle={projects}
        />
      </PageWrapper>

      <Previous />
    </>
  );
}
