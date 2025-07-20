"use client";

import localFont from "@next/font/local";
import { Pixelify_Sans } from "next/font/google";
import Link from "next/link";
import CloudsAnimation from "./CloudsAnimation";

const bhavuka = localFont({
  src: [
    {
      path: "../../public/fonts/Bhavuka-Regular.ttf",
    },
  ],
  variable: "--font-bhavuka",
});

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixelify",
});

export default function HeroSection() {
  return (
    <div className="bg-gray-900">
      <div
        className={`relative isolate overflow-hidden ${bhavuka.variable} ${pixelifySans.variable} font-lead `}
      >
        {/* GSAP-powered Cloud Animation System */}
        <CloudsAnimation />
        
        <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 relative z-10">
          <div className="text-center">
            <h1 className="font-pixelify lg:text-7xl md:text-6xl sm:text-3xl text-3xl tracking-[.2em] font-bold text-neutral-150 ">
              Yousra Elhour
            </h1>
            <p className="font-pixelify lg:mt-4 md:mt-4 lg:text-3xl md:text-2xl sm:text-lg text-lg leading-8 tracking-[.2em] text-gray-300">
              Software Engineer - Designer - Illustrator
            </p>
            <div className="lg:mt-9 mt-5 flex items-center justify-center lg:gap-x-12 md:gap-x-6 sm:gap-x-4 gap-x-4 font-sans font-light lg:tracking-[.4em] md:tracking-[.3em] tracking-[.2em] ">
              <Link
                href="/about"
                className="lg:text-lg md:text-md text-xs font-bold  hover:text-gray-300  text-white "
              >
                ABOUT ME
              </Link>
              <Link
                href="/works"
                className="lg:text-lg md:text-md text-xs font-bold  hover:text-gray-300 text-white "
              >
                WORKS
              </Link>

              <Link
                href="/contact"
                className="  lg:text-lg md:text-md text-xs font-bold hover:text-gray-300 text-white  "
              >
                CONTACT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
