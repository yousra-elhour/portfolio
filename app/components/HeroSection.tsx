"use client";

import localFont from "@next/font/local";
import { Pixelify_Sans } from "next/font/google";
import Link from "next/link";
import Image from "next/image";

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
        <Image
          src="/images/background-day.png"
          alt="Background"
          fill
          priority
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-2xl sm:-top-80"
          aria-hidden="true"
        >
          {/* <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-0 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          /> */}
        </div>
        <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 ">
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
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          {/* <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] opacity-0 to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          /> */}
        </div>
      </div>
    </div>
  );
}
