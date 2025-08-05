"use client";

import localFont from "next/font/local";
import { Pixelify_Sans } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ForegroundClouds from "./ForegroundClouds";
import TransitionLink from "./TransitionLink";
import FloatingStars from "./FloatingStars";

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  const linkVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="bg-gray-900">
      <div
        className={`relative isolate overflow-hidden ${bhavuka.variable} ${pixelifySans.variable} font-lead `}
      >
          <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
        {""}
      </div>
        <Image
          src="/clouds/bg.png"
          alt="Background"
          fill
          priority
          className="absolute inset-0 -z-30 h-full w-full object-cover"
        />

        {/* Floating Interactive Stars */}
        <FloatingStars />

        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-2xl sm:-top-80"
          aria-hidden="true"
        ></div>

        <motion.div
          className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="text-center relative z-50">
            <motion.h1
              className="font-pixelify lg:text-7xl md:text-6xl sm:text-3xl text-3xl tracking-[.2em] font-bold text-white"
              variants={itemVariants}
              style={{ textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.3)" }}
            >
              Yousra Elhour
            </motion.h1>
            <motion.p
              className="font-pixelify lg:mt-4 md:mt-4 lg:text-3xl md:text-2xl sm:text-lg text-lg leading-8 tracking-[.2em] text-gray-200"
              variants={itemVariants}
              style={{ textShadow: "0.5px 0.5px 1px rgba(0,0,0,0.3)" }}
            >
              Software Engineer - Designer - Illustrator
            </motion.p>
            <motion.div
              className="lg:mt-9 mt-5 flex items-center justify-center lg:gap-x-12 md:gap-x-6 sm:gap-x-4 gap-x-4 font-sans font-light lg:tracking-[.4em] md:tracking-[.3em] tracking-[.2em]"
              variants={containerVariants}
            >
              <motion.div variants={linkVariants} whileHover="hover">
                <TransitionLink
                  href="/about"
                  className="lg:text-lg md:text-md text-xs font-bold hover:text-gray-300 text-white transition-colors duration-200"
                >
                  ABOUT ME
                </TransitionLink>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover">
                <TransitionLink
                  href="/works"
                  className="lg:text-lg md:text-md text-xs font-bold hover:text-gray-300 text-white transition-colors duration-200"
                >
                  WORKS
                </TransitionLink>
              </motion.div>
              <motion.div variants={linkVariants} whileHover="hover">
                <TransitionLink
                  href="/contact"
                  className="lg:text-lg md:text-md text-xs font-bold hover:text-gray-300 text-white transition-colors duration-200"
                >
                  CONTACT
                </TransitionLink>
              </motion.div>
              
            </motion.div>
          </div>
        </motion.div>

        {/* Foreground Clouds (rendered OUTSIDE the -z-20 container) */}
        <ForegroundClouds />

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        ></div>
      </div>
    </div>
  );
}
