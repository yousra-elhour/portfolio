"use client";

import localFont from "@next/font/local";
import Link from "next/link";
import { useEffect, useState } from "react";
import Loading from "./Loading";
const bhavuka = localFont({
  src: [
    {
      path: "../../public/fonts/Bhavuka-Regular.ttf",
    },
  ],
  variable: "--font-bhavuka",
});

export default function HeroSection() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercentage, setLoadingPercentage] = useState(0);
  useEffect(() => {
    const preloadVideos = async () => {
      const videoUrls = ["/videos/animation.mp4"];

      try {
        let loadedVideos = 0;
        const totalVideos = videoUrls.length;

        const videoPromises = videoUrls.map((url) => {
          return new Promise<void>((resolve, reject) => {
            const video = document.createElement("video");
            video.src = url;
            video.load();
            video.onloadedmetadata = () => {
              loadedVideos++;
              setLoadingPercentage((loadedVideos / totalVideos) * 100);
              resolve();
            };
            video.onerror = reject;
          });
        });

        await Promise.all(videoPromises);
        setIsLoading(false);
      } catch (error) {
        console.error("Error preloading videos:", error);
      }
    };

    preloadVideos();
  }, []);

  if (isLoading) {
    // Render a loading state while images are preloading
    return <Loading loadingPercentage={loadingPercentage} />;
  }

  return (
    <div className="bg-gray-900">
      <div
        className={`relative isolate overflow-hidden ${bhavuka.variable} font-lead `}
      >
        <video
          controls={false}
          loop
          autoPlay
          muted
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        >
          <source src="/videos/animation.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
        <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 ">
          <div className="text-center">
            <h1 className=" lg:text-7xl md:text-6xl sm:text-3xl text-3xl tracking-[.3em] font-bold  text-white pb-4 ">
              Yousra Elhour
            </h1>
            <p className="lg:mt-6 md:mt-4 lg:text-3xl md:text-2xl sm:text-lg text-lg leading-8 tracking-[.2em] text-gray-300 ">
              Software Engineer - Designer - Illustrator
            </p>
            <div className="lg:mt-9 mt-5 flex items-center justify-center lg:gap-x-12 md:gap-x-6 sm:gap-x-4 gap-x-4 font-sans font-light lg:tracking-[.4em] md:tracking-[.3em] tracking-[.2em] ">
              <Link
                href="/about"
                className=" border-b-2 lg:text-lg md:text-md text-xs   lg:py-2.5  py-2 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
              >
                ABOUT ME
              </Link>
              <Link
                href="/works"
                className=" border-b-2 lg:text-lg md:text-md text-xs    lg:py-2.5  py-2   text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
              >
                WORKS
              </Link>

              <Link
                href="/contact"
                className=" border-b-2 lg:text-lg md:text-md text-xs    lg:py-2.5  py-2   text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
              >
                CONTACT
              </Link>
            </div>
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
