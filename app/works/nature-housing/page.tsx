"use client";

import Project from "../../components/Project";
import Previous from "@/app/components/Previous";
import natureBanner from "../../../public/images/nature-banner.png";
import natureMain from "../../../public/images/nature-housing/main.png";
import natureHomepage from "../../../public/images/nature-housing/homepage.png";
import natureHouse from "../../../public/images/nature-housing/house.png";
import natureAdmin from "../../../public/images/nature-housing/admin.png";

export default function WorksPage() {
  return (
    <>
      <Project
        images={[natureMain, natureHomepage, natureHouse, natureAdmin]}
        captions={[
          "Landing — find housing in the heart of the wilderness",
          "Homepage — property listings and filters",
          "Property page — calendar reservation and booking",
          "Owner view — manage your own properties",
        ]}
        next={{ title: "AdmissionPedia", href: "/works/admissionPedia" }}
        banner={natureBanner}
        live="https://nature-housing.netlify.app/"
        title={"Nature Housing"}
        techStack={"Next.js 13, Tailwind,  Prisma, MongoDB"}
        description={`
        Nature Housing is a specialized web app designed to connect nature enthusiasts with unique 
        houses in nature. 
        Features: property listings, calendar reservation, advanced search filters, CRUD operations 
        Google and Github login implemented.
        `}
      />
      <Previous />
    </>
  );
}
