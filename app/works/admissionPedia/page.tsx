"use client";
import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";

import Previous from "@/app/components/Previous";

export default function WorksPage() {
  return (
    <>
      <PageWrapper>
        <Project
          images={[
            "/images/admissionPedia/main.png",
            "/images/admissionPedia/Search.png",
            "/images/admissionPedia/Addschool.png",
            "/images/admissionPedia/User dashboard.png",
            "/images/admissionPedia/Sign up.png",
            "/images/admissionPedia/School page.png",
            "/images/admissionPedia/add-school.png",
          ]}
          banner={"/images/admissionPedia/banner.jpg"}
          live="https://admissionpedia.dev/"
          design="https://www.behance.net/gallery/183533805/AdmissionPedia-Design"
          title={"AdmissionPedia"}
          techStack={"React, NodeJS, Tailwind, SQL"}
          description={`
          Worked as the Lead Front End Engineer and Designer at AdmissionPedia Startup, a school admission company for schools and parents,
           I took the lead in creating user-friendly web interfaces. Additionally, 
           I managed graphic design tasks, such as creating business cards, email template and brochures to support our branding.
          `}
          additionalTitle="Branding"
          additionalDescription="Branding Graphics that I did for the company"
          additionalImages={[
            "/images/admissionPedia/banner.jpg",
            "/images/admissionPedia/business.png",
            "/images/admissionPedia/email.png",
            "/images/admissionPedia/brochure-1.png",
          ]}
        />
      </PageWrapper>
      <Previous />
    </>
  );
}
