"use client";

import Image from "next/image";
import cardiff from "../../public/images/cmu-blue-logo.gif";
import TransitionLink from "./TransitionLink"; // Replace Link import
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MoveUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Email from "./Email";
import Nav from "./Nav";
import ForegroundClouds from "./ForegroundClouds";


export default function Works() {
  const [parent] = useAutoAnimate();
  const data = [
    {
      title: "Vinyl E-commerce & CMS",
      image: "/images/vinyl-banner.png",
      link: "/works/vinyl",
      live: "https://vinyl-client-omega.vercel.app",
    },

    {
      title: "Nature Housing",
      image: "/images/nature-banner.png",
      link: "/works/nature-housing",
      live: "https://nature-housing.netlify.app",
    },

    {
      title: "AdmissionPedia",
      image: "/images/admissionPedia/banner.jpg",
      link: "/works/admissionPedia",
      live: "https://admissionpedia.dev",
    },

    {
      title: "Digital Illustrations",
      image: "/images/illustrations/cirrus-yk-cyberpunk-final-fullres.jpg",
      link: "/works/illustrations",
      live: "https://www.artstation.com/cirrusyk",
    },

    {
      title: "University Projects",
      image: "/images/cmu-blue-logo.gif",
      link: "/works/university-projects",
    },
  ];

  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Enable hover after animation completes (500ms animation + small buffer)
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden ">
        {/* <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
          {""}
        </div> */}
        <div className="bg-gray-900">
          <div className={`relative isolate overflow-hidden  font-lead `}>
              <div 
                className="absolute bg-black/30 h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md"
                style={{ 
                  backfaceVisibility: 'hidden', // Prevent flickering
                  transform: 'translateZ(0)' // Force hardware acceleration
                }}
              >
                {""}
              </div>

            {/* Optimized background image with hardware acceleration */}
            <Image
              src="/clouds/bg.png"
              alt="Background"
              fill
              priority
              className="absolute inset-0 -z-30 h-full w-full object-cover"
              style={{ 
                transform: 'translateZ(0)', // Force hardware acceleration
                backfaceVisibility: 'hidden' // Prevent flickering
              }}
            />

            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
              style={{ backfaceVisibility: 'hidden' }} // Prevent flickering
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e2ac88] to-[#8592bf] opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                  backfaceVisibility: 'hidden', // Prevent flickering
                  transform: 'translateZ(0)' // Force hardware acceleration
                }}
              />
            </div>

            <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 "></div>
          </div>
        </div>

        <div className={`absolute top-[15%] left-[8%] works z-50 ${!animationComplete ? 'pointer-events-none' : ''}`} ref={parent}>
          {data.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => animationComplete && setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className="works-item cursor-pointer"
            >
              <div className="works-item-container lg:mb-5 mb-3 flex justify-between items-start gap-20">
                <TransitionLink
                  href={item.link}
                  className="works-title lg:pl-4 md:pl-4 pl-2 lg:text-xl md:text-xl text-base font-sans tracking-[.4em]"
                >
                  {item.title}
                </TransitionLink>

                {item.live && (
                  <TransitionLink target="_blank" href={item.live}>
                    <MoveUpRight className="works-icon lg:h-7 lg:w-7 md:h-7 md:w-7 h-5 w-5 z-50" />
                  </TransitionLink>
                )}
              </div>

              <hr className="works-divider border-0 border-white border-b w-full mb-8" />
            </div>
          ))}
        </div>

        {/* Foreground Clouds - always visible and animated */}
        <ForegroundClouds />
      </div>
      
      <Email />
      <Nav />
      
      {/* Preview Image - Rendered as portal to escape stacking context */}
      {typeof window !== 'undefined' && hoveredItem !== null && (
        <>
          {createPortal(
            <div
              className="h-[29cqw] aspect-video lg:block hidden preview animate-in fade-in duration-300"
              style={{ 
                zIndex: 99999, 
                bottom: "-3%",
                right: "-7%",
                position: "fixed",
                animation: "fadeIn 0.3s ease-out",
                pointerEvents: "none"
              }}
            >
              {data[hoveredItem].image && (
                <Image
                  width="750"
                  height="500"
                  src={data[hoveredItem].image}
                  alt={data[hoveredItem].title}
                  className="h-full w-full object-cover rounded-xl opacity-70"
                />
              )}

              <div
                className="rounded-xl absolute inset-0 before:content-[''] before:absolute before:inset-0 opacity-10"
                style={{
                  background: "linear-gradient(to bottom, #e2ac88, #8592bf)",
                }}
              />
            </div>,
            document.body
          )}
        </>
      )}
    </>
  );
}
