"use client";

import Image from "next/image";
import image from "../../public/images/aaaaUntitled-1 1.jpg";
import Link from "next/link";
import Email from "./Email";
import Nav from "./Nav";

export default function Works() {
  return (
    <div className="relative overflow-hidden">
      <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
        {""}
      </div>
      <div className="bg-gray-900">
        <div className={`relative isolate overflow-hidden  font-lead `}>
          <Image
            src={image}
            alt="background"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />

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

          <div className="mx-auto max-w-3xl h-screen flex flex-col justify-center items-center lg:px-6 md:px-4 sm:px-2 px-2 "></div>
        </div>
      </div>

      <div className="absolute top-[15%] left-[8%] right-[8%] z-50 font-sans lg:tracking-[.4rem] md:tracking-[.25rem] tracking-[.2rem] max-w-3xl lg:leading-9 md:leading-9 leading-5 lg:text-lg md:text-md text-sm">
        <p className="lg:mb-10 md:mb-10 mb-5">
          Hello, I&apos;m a software and front-end engineer with a deep passion
          for design and illustration. I have experience working in various
          roles, including front-end engineering, design, and illustration.
        </p>
        <p className="mb-10">
          I recently graduated with a bachelor&apos;s degree from Cardiff
          Metropolitan University, and I&apos;m constantly eager to expand my
          knowledge and explore new opportunities.
        </p>

        <Link
          href={"/Yousra-Elhour-Resume.pdf"}
          download
          className="pb-2 border-b"
        >
          Curriculum vitae
        </Link>
      </div>
      <Email />
      <Nav />
    </div>
  );
}
