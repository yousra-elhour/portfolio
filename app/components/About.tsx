"use client";

import Image from "next/image";
import Link from "next/link";
import Email from "./Email";
import Nav from "./Nav";
import NowPlaying from "./NowPlaying";
import TopAlbums from "./TopAlbums";
import PhotoCarousel from "./PhotoCarousel";
import ForegroundClouds from "./ForegroundClouds";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function About() {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Wait for page transition to complete before showing profile card
    // Slightly longer delay to sync with content appearing
    const timer = setTimeout(() => {
      setShowProfileCard(true);
    }, 1100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden ">
        <div className="page-bg-wrapper bg-gray-900" style={{ opacity: 1 }}>
          <div className={`relative isolate overflow-hidden  font-lead `}>
              <div 
                className="page-backdrop absolute bg-black/30 h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md"
                style={{ 
                  opacity: 1, // Force immediate visibility
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
            className="absolute -z-30 h-full w-full object-cover"
            style={{ 
              transform: 'translateZ(0)', // Force hardware acceleration
              backfaceVisibility: 'hidden', // Prevent flickering
              inset: 0,
              minWidth: '100vw',
              minHeight: '100vh'
            }}
          />

          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
            style={{ backfaceVisibility: 'hidden' }} // Prevent flickering
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#87CEEB] to-[#B0E0E6] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
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

        <div className={`about-content absolute top-[15%] left-[8%] right-[8%] z-50 font-sans lg:tracking-[0.2rem] md:tracking-[.2rem] tracking-[.3rem] 1000:max-w-2xl xl:max-w-3xl max-w-xl lg:leading-7  md:leading-7 leading-4 lg:text-lg md:text-md text-sm`}>
       <p className="about-paragraph lg:mb-10 md:mb-10 mb-5">
Hey, I’m Yousra.
I’m a software engineer with a big love for nature, music, and art. Before getting into software engineering, I spent time working as a freelance illustrator, and that creative side still guides the way I build and design my projects.      </p>
      <p className="about-paragraph mb-10">
       I’m currently in Paris doing my master’s in Software Engineering. This portfolio was a really fun project for me, I wanted it to feel like the sky I’ve always loved. I painted the clouds digitally and used them in the background, then brought everything to life with GSAP animations.

<br />
    If you’d like to talk about tech, music, art, or just want to connect, feel free to reach out.
      </p>


        <div className="flex gap-8 ">
          <Link href={"/CV-english.pdf"} download className="pb-2 border-b">
            English CV
          </Link>
          <Link
            href={"/cv-francais (1).pdf"}
            download
            className="pb-2 border-b"
          >
            French CV
          </Link>
          </div>
        </div>

        {/* Foreground Clouds - always visible and animated */}
        <ForegroundClouds />
      </div>
      
      <Email />
      <Nav />
      
      {/* Profile Card - Photo + Music - Rendered via Portal to appear on top of clouds */}
      {mounted && showProfileCard && createPortal(
        <div 
          className={`about-profile-card fixed top-[25%] lg:right-20 md:right-12 w-72 bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-2xl rounded-2xl border border-white/30 p-4 shadow-2xl hidden lg:block animate-fadeIn`} 
          style={{ zIndex: 1000000 }}
        >
          {/* Photo Carousel */}
          <div className="mb-4">
            <PhotoCarousel
              photos={[
             
                { src: "/images/carousel/2.jpeg", alt: "Profile photo 2" },
                { src: "/images/carousel/3.jpeg", alt: "Profile photo 3" },
              ]}
            />
          </div>

          {/* Now Playing */}
          <div className="mb-4">
            <NowPlaying />
          </div>

          {/* Top Albums */}
          <div>
            <h3 className="text-white/80 font-bold mb-2 text-[9px] uppercase tracking-widest">
              Top Albums
            </h3>
            <TopAlbums />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
