"use client";

import Image from "next/image";
import image from "../../public/images/aaaaUntitled-1 1.jpg";
import Link from "next/link";
import Email from "./Email";
import Nav from "./Nav";
import { MoveUpRight } from "lucide-react";
import ForegroundClouds from "./ForegroundClouds";
import { useState, useEffect } from "react";

export default function Works() {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Enable content visibility after animation completes (600ms delay like Works)
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden ">
        <div className="page-bg-wrapper bg-gray-900" style={{ opacity: 1 }}>
          <div className={`relative isolate overflow-hidden  font-lead `}>
              <div 
                className="page-backdrop absolute bg-black/30 h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md pointer-events-none"
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
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e0aa88] to-[#8592bd] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
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

        <div className={`contact-content absolute top-[28%] left-[8%] right-[7%] works z-50 font-sans tracking-[.4rem] leading-9 text-lg max-w-full ${!animationComplete ? 'pointer-events-none' : ''}`}>
        <h1 className="contact-title lg:mb-8 md:mb-6 mb-4 font-extrabold lg:text-4xl md:text-3xl text-2xl">
          CONTACT
        </h1>
        <hr className="contact-divider border-0 border-white border-b w-full mb-5" />

        <div className="lg:flex justify-between px-2">
          <div className="mb-5  gap-4 items-baseline lg:flex md:flex hidden">
            <p className="contact-label font-bold lg:text-md md:text-md text-sm">Email:</p>
            <span>
              {" "}
              <Link
                className="contact-text lg:text-md md:text-md text-sm"
                href={"mailto:elhour.yousra1910@gmail.com"}
              >
                elhour.yousra1910@gmail.com
              </Link>
            </span>
          </div>

          <div className="mb-5 flex gap-4">
            <p className="contact-label font-bold lg:text-md md:text-md text-sm">
              Social Media:
            </p>
            <ul className="contact-list flex flex-col gap-3 lg:text-md md:text-md text-sm">
              <li className="flex items-baseline gap-2">
                <Link
                  target="_blank"
                  href={"https://www.linkedin.com/in/yousra-elhour-978952220/"}
                >
                  <MoveUpRight className="contact-icon h-4 w-4 " />
                </Link>
                <Link
                  target="_blank"
                  href={"https://www.linkedin.com/in/yousra-elhour-978952220/"}
                >
                  LinkedIn
                </Link>
              </li>
              <li className="flex items-baseline gap-2">
                <Link
                  target="_blank"
                  href={"https://www.behance.net/kuroonekoob1fa"}
                >
                  <MoveUpRight className="contact-icon h-4 w-4 " />
                </Link>
                <Link
                  target="_blank"
                  href={"https://www.behance.net/kuroonekoob1fa"}
                >
                  Behance
                </Link>
              </li>
              <li className="flex items-baseline gap-2">
                <Link
                  target="_blank"
                  href={"https://www.artstation.com/cirrusyk"}
                >
                  <MoveUpRight className="contact-icon h-4 w-4 " />
                </Link>
                <Link
                  target="_blank"
                  href={"https://www.artstation.com/cirrusyk"}
                >
                  Artstation
                </Link>
              </li>
            </ul>
            </div>
          </div>
        </div>

        {/* Foreground Clouds - always visible and animated */}
        <ForegroundClouds />
      </div>
      
      <Email />
      <Nav />
    </>
  );
}
