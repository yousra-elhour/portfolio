"use client";

import SimpleCloudLink from "../../components/SimpleCloudLink";
import CloudsAnimation from "../../components/CloudsAnimation";
import Image from "next/image";
import { useState } from "react";
import { MoveUpRight } from "lucide-react";

export default function TestingWorks() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  const data = [
    {
      title: "Vinyl E-commerce & CMS",
      image: "/images/vinyl-banner.png",
      link: "/testing",
      live: "https://vinyl-client-omega.vercel.app",
    },
    {
      title: "Nature Housing",
      image: "/images/nature-banner.png",
      link: "/testing",
      live: "https://nature-housing.netlify.app",
    },
    {
      title: "AdmissionPedia",
      image: "/images/admissionPedia/banner.jpg",
      link: "/testing",
      live: "https://admissionpedia.dev",
    },
    {
      title: "University Projects",
      image: "/images/cmu-blue-logo.gif",
      link: "/testing",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fallback background image - only for when clouds aren't loaded */}
      <Image
        src="/images/background-day.png"
        alt="Background"
        fill
        priority
        className="absolute inset-0 -z-40 h-full w-full object-cover"
      />

      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/20 -z-10 backdrop-blur-[0.5px]"></div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Works List */}
        <div className="absolute top-[15%] left-[8%] works z-50">
          {data.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className="cursor-pointer"
            >
              <div className="lg:mb-7 mb-4 flex justify-between items-start gap-20">
                <SimpleCloudLink
                  href={item.link}
                  className="lg:pl-4 md:pl-4 pl-2 lg:text-2xl md:text-2xl text-md font-sans tracking-[.4em] text-white hover:text-blue-300 transition-colors duration-300"
                >
                  {item.title}
                </SimpleCloudLink>

                {item.live && (
                  <a target="_blank" href={item.live} rel="noopener noreferrer">
                    <MoveUpRight className="lg:h-7 lg:w-7 md:h-7 md:w-7 h-5 w-5 z-50 text-white hover:text-blue-300 transition-colors duration-300" />
                  </a>
                )}
              </div>

              <hr className="border-0 border-white border-b w-full mb-12" />
            </div>
          ))}
        </div>

        {/* Preview Image on Hover */}
        {hoveredItem !== null && (
          <div
            className="absolute bottom-[-3%] right-[-7%] h-[29cqw] aspect-video z-40 lg:block hidden preview"
            style={{ transition: "all 0.5s ease-in-out" }}
          >
            {data[hoveredItem].image && (
              <Image
                width="750"
                height="500"
                src={data[hoveredItem].image}
                alt={data[hoveredItem].title}
                className="absolute inset-0 z-30 h-full w-full object-cover rounded-xl opacity-80"
              />
            )}

            <div
              className="rounded-xl absolute inset-0 z-40 opacity-20"
              style={{
                background: "linear-gradient(to bottom, #e2ac88, #8592bf)",
              }}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="absolute top-8 left-8 z-50">
          <SimpleCloudLink
            href="/testing"
            className="text-white hover:text-blue-300 transition-colors duration-300 text-lg font-light tracking-wider"
          >
            ← Back to Testing
          </SimpleCloudLink>
        </div>

        {/* Page Title */}
        <div className="absolute top-8 right-8 z-50">
          <h1 className="text-white text-2xl font-light tracking-[0.3em]">
            TESTING WORKS
          </h1>
        </div>
      </div>
    </div>
  );
}
