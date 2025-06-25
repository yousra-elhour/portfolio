"use client";

import Link from "next/link";

export default function HeroSection() {
  return (
    <div className="bg-gray-900">
      <div className="relative isolate overflow-hidden">
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
        ></div>
        <div className="mx-auto max-w-4xl h-screen flex flex-col justify-center items-center lg:px-8 md:px-6 sm:px-4 px-4">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="lg:text-8xl md:text-7xl sm:text-5xl text-4xl font-light tracking-widest  text-white opacity-80 ">
                Yousra Elhour
              </h1>

              <p className="lg:text-xl md:text-lg text-base font-light tracking-[0.35rem] text-gray-200 max-w-2xl mx-auto leading-relaxed pt-4">
                Software Engineer • Designer • Illustrator
              </p>
            </div>

            <div className="flex items-center justify-center lg:gap-x-8 md:gap-x-6 gap-x-4 pt-2">
              <Link
                href="/about"
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 lg:text-sm md:text-sm text-xs font-medium tracking-widest text-white">
                  ABOUT ME
                </span>
              </Link>
              <Link
                href="/works"
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 lg:text-sm md:text-sm text-xs font-medium tracking-widest text-white">
                  WORKS
                </span>
              </Link>
              <Link
                href="/contact"
                className="group relative overflow-hidden bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-8 py-3 transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10 lg:text-sm md:text-sm text-xs font-medium tracking-widest text-white">
                  CONTACT
                </span>
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
