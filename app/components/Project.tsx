"use client";

import Image from "next/image";
import image from "../../public/images/aaaaUntitled-1 1.jpg";

import Nav from "./Nav";
import Link from "next/link";

interface ProjectProps {
  images?: string[];
  additionalImages?: string[];
  banner: string;
  title: string;
  techStack: string;
  description: string;
  additionalTitle?: string;
  additionalLink?: string;
  additionalDescription?: string;
  live?: string;
  design?: string;
  imagesTitle?: {
    img: string;
    live?: string;
    title?: string;
    techStack?: string;
    code?: string;
    design?: string;
  }[];
}

export default function Project({
  images,
  title,
  techStack,
  description,
  additionalImages,
  banner,
  additionalDescription,
  additionalLink,
  additionalTitle,
  imagesTitle,
  live,
  design,
}: ProjectProps) {
  return (
    <>
      <div className="relative overflow-hidden">
        <div className=" absolute bg-black/30  h-[100vh] top-0 right-0 left-0 bottom-0 z-10 backdrop-blur-md">
          {""}
        </div>
        <div className="bg-gray-900">
          <div className={`relative isolate overflow-hidden  font-lead `}>
            <Image
              src={image}
              placeholder="blur"
              quality={30}
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

        <div className="absolute top-[15%] left-[8%] works z-50"></div>

        <Nav />
      </div>
      <div className="absolute top-0 right-0 left-0 bottom-0 overflow-auto projects z-40">
        <div className="relative h-auto mt-[-6%] lg:px-[26%] md:px-[10%] px-[6%] ">
          <div className=" h-full">
            <div>
              <Image
                width={800}
                height={800}
                priority={true}
                src={banner}
                alt="preview"
                className=" mb-10 object-cover rounded-3xl  lg:w-[50cqw] md:w-[80cqw] w-[90cqw]"
              />
              <div className="w-full ">
                <div className="flex justify-between items-baseline">
                  <div>
                    <h1 className="lg:text-2xl md:text-2xl text-lg font-extrabold font-sans lg:tracking-[.3rem] md:tracking-[.3rem] tracking-[.2rem]">
                      {title}
                    </h1>
                    <h3 className="lg:text-sm md:text-sm text-xs  font-sans font-bold lg:tracking-[.3rem] md:tracking-[.3rem] tracking-[.2rem] pt-3 max-w-3xl">
                      {techStack}
                    </h3>
                  </div>

                  <div className="flex gap-5 font-sans  tracking-[.3rem]">
                    {live && (
                      <Link
                        className="text-sm  border-b-2 "
                        href={live}
                        target="_blank"
                      >
                        LIVE
                      </Link>
                    )}

                    {design && (
                      <Link
                        className=" text-sm  border-b-2 "
                        href={design}
                        target="_blank"
                      >
                        DESIGN{" "}
                      </Link>
                    )}
                  </div>
                </div>

                <p className="lg:text-md md:text-md text-xs  font-sans lg:tracking-[.2rem]  md:tracking-[.2rem] tracking-[.15rem] pt-6 max-w-3xl lg:leading-6 text-justify mb-10">
                  {description}
                </p>
              </div>

              {images?.map((image, index) => (
                <Image
                  width={800}
                  height={800}
                  priority={true}
                  key={index}
                  src={image}
                  alt={`preview-${index}`}
                  className=" mb-10 object-cover rounded-3xl  lg:w-[50cqw] md:w-[80cqw] w-[90cqw]"
                />
              ))}

              {imagesTitle?.map((item, index) => (
                <>
                  <div className="w-full pt-2 flex gap-6  font-sans tracking-[.2rem] mb-6 justify-between items-baseline">
                    <div>
                      <h1 className="lg:text-2xl md:text-2xl text-lg font-extrabold font-sans lg:tracking-[.3rem] md:tracking-[.3rem] tracking-[.2rem] pt-2">
                        {item.title}
                      </h1>

                      <h3 className="lg:text-sm md:text-sm text-xs  font-sans font-bold lg:tracking-[.3rem] md:tracking-[.3rem] tracking-[.2rem] pt-3 max-w-3xl">
                        {item.techStack}
                      </h3>
                    </div>

                    <div className="flex gap-5 font-sans tracking-[.3rem] ">
                      {item.live && (
                        <Link
                          className="   text-sm  border-b-2 "
                          href={item.live}
                          target="_blank"
                        >
                          LIVE
                        </Link>
                      )}

                      {item.code && (
                        <Link
                          className="   text-sm  border-b-2 "
                          href={item.code}
                          target="_blank"
                        >
                          CODE{" "}
                        </Link>
                      )}

                      {item.design && (
                        <Link
                          className="   text-sm  border-b-2 "
                          href={item.design}
                          target="_blank"
                        >
                          DESIGN{" "}
                        </Link>
                      )}
                    </div>
                  </div>
                  <Image
                    width={800}
                    height={800}
                    key={index}
                    src={item.img}
                    priority={true}
                    alt={`preview-${index}`}
                    className=" mb-10 object-cover rounded-3xl  lg:w-[50cqw] md:w-[80cqw] w-[90cqw]"
                  />
                </>
              ))}

              <div className="w-full pt-2 flex gap-6 items-end font-sans tracking-[.2rem] ">
                <h1 className="lg:text-2xl md:text-2xl text-lg font-extrabold font-sans lg:tracking-[.3rem] md:tracking-[.3rem] tracking-[.2rem] pt-2">
                  {additionalTitle}
                </h1>
                {additionalLink && (
                  <Link
                    className=" font-bold lg:text-xl text-sm  border-b-2 "
                    href={additionalLink}
                  >
                    LIVE
                  </Link>
                )}
              </div>

              <p className="lg:text-md text-sm w-full  font-sans lg:tracking-[.2rem] md:tracking-[.2rem] tracking-[.15rem] pt-6 max-w-3xl leading-6 text-justify">
                {additionalDescription}
              </p>
              <div className="pb-10 lg:w-[50cqw] md:w-[80cqw] w-[90cqw]">
                {additionalImages?.map((image, index) => (
                  <Image
                    width={800}
                    height={800}
                    priority={true}
                    key={index}
                    src={image}
                    alt={`preview-${index}`}
                    className=" mt-10 object-cover rounded-3xl "
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
