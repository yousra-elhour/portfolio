"use client";

import Image from "next/image";
import cardiff from "../../public/images/cmu-blue-logo.gif";
import TransitionLink from "./TransitionLink"; // Replace Link import
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { MoveUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import Email from "./Email";
import Nav from "./Nav";


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
      title: "University Projects",
      image: "/images/cmu-blue-logo.gif",
      link: "/works/university-projects",
    },
  ];

  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  return (
    <>
      <div className="relative overflow-hidden " ref={parent}>
        {/* <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
          {""}
        </div> */}
        <div className="bg-gray-900">
          <div className={`relative isolate overflow-hidden  font-lead `}>
              <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
        {""}
      </div>

            {/* Fallback background image */}
            <Image
              src="/clouds/bg.png"
              alt="Background"
              fill
              priority
              className="absolute inset-0 -z-30 h-full w-full object-cover"
            />

            <div
              className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
              aria-hidden="true"
            >
              <div
                className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#e2ac88] to-[#8592bf] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                style={{
                  clipPath:
                    "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                }}
              />
            </div>

            <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 "></div>
          </div>
        </div>

        <div className="absolute top-[15%] left-[8%] works z-50">
          {data.map((item, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className=" cursor-pointer"
            >
              <div className="lg:mb-7 mb-4 flex justify-between items-start gap-20">
                <TransitionLink
                  href={item.link}
                  className="lg:pl-4 md:pl-4 pl-2 lg:text-2xl md:text-2xl text-md font-sans tracking-[.4em]  "
                >
                  {item.title}
                </TransitionLink>

                {item.live && (
                  <TransitionLink target="_blank" href={item.live}>
                    <MoveUpRight className="lg:h-7 lg:w-7 md:h-7 md:w-7 h-5 w-5 z-50" />
                  </TransitionLink>
                )}
              </div>

              <hr className="border-0 border-white border-b w-full mb-12" />
            </div>
          ))}
        </div>
        <Email />

        {hoveredItem !== null && (
          <div
            className="absolute bottom-[-3%] right-[-7%] h-[29cqw] aspect-video z-40 lg:block hidden preview "
            style={{ transition: "all 2s" }}
          >
            {data[hoveredItem].image && (
              <Image
                width="750"
                height="500"
                src={data[hoveredItem].image}
                alt={data[hoveredItem].title}
                className="absolute inset-0 z-30 h-full w-full object-cover rounded-xl opacity-70"
              />
            )}

            <div
              className="rounded-xl absolute inset-0 z-40 before:content-[''] before:absolute before:inset-0 before:z-50 opacity-10"
              style={{
                background: "linear-gradient(to bottom, #e2ac88, #8592bf)",
              }}
            />
          </div>
        )}
      </div>
      <Nav />
    </>
  );
}
