"use client";
import Project from "../../components/Project";
import Previous from "@/app/components/Previous";
import { useRouter } from "next/navigation";

export default function WorksPage() {
  const router = useRouter();

  return (
    <>
      {/* Mobile Back Button */}
      <button
        onClick={() => router.back()}
        className="fixed top-6 left-6 z-[60] lg:hidden flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
        <span className="text-sm font-sans tracking-wider">BACK</span>
      </button>

      <Project
        images={[
          "/images/Desktop - 4.png",
          "/images/product-page.png",
          "/images/buy-vinyl.png",
        ]}
        banner={"/images/vinyl-banner.png"}
        title={"Vinyl E-Commerce with CMS"}
        live="https://vinyl-client-omega.vercel.app/"
        techStack={"Next.js 13, Tailwind, Shadcn, Prisma, SQL, Spotify API"}
        description={`
          E-commerce website for vinyl enthusiasts. The webapp offers
          features such as album playback, shortlisting, and cart
          management. Users can also filter and search for their
          favorite albums. The website comes with a content management
          system (CMS) that allows administrators to edit the billboard,
          add new products, and manage various e-commerce-related
          content.
        `}
        additionalImages={["/images/admin-s1.jpg"]}
        additionalTitle="Vinyl E-commerce CMS"
        additionalLink="https://vinyl-admin.vercel.app/"
        additionalDescription="You need the Login credentials to be able to use the admin
        website Contact me if you're interested in testing it."
      />
      <Previous />
    </>
  );
}
