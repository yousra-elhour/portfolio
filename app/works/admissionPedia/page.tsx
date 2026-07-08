"use client";
import Project from "../../components/Project";

import Previous from "@/app/components/Previous";
import apBanner from "../../../public/images/admissionPedia/banner.jpg";
import apMain from "../../../public/images/admissionPedia/main.png";
import apSearch from "../../../public/images/admissionPedia/Search.png";
import apAddSchool from "../../../public/images/admissionPedia/Addschool.png";
import apUserDashboard from "../../../public/images/admissionPedia/User dashboard.png";
import apSignUp from "../../../public/images/admissionPedia/Sign up.png";
import apSchoolPage from "../../../public/images/admissionPedia/School page.png";
import apAddSchoolForm from "../../../public/images/admissionPedia/add-school.png";
import apBusiness from "../../../public/images/admissionPedia/business.png";
import apEmail from "../../../public/images/admissionPedia/email.png";
import apBrochure from "../../../public/images/admissionPedia/brochure-1.png";

export default function WorksPage() {
  return (
    <>
      <Project
        images={[
          apMain,
          apSearch,
          apAddSchool,
          apUserDashboard,
          apSignUp,
          apSchoolPage,
          apAddSchoolForm,
        ]}
        banner={apBanner}
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
        additionalImages={[apBanner, apBusiness, apEmail, apBrochure]}
      />
      <Previous />
    </>
  );
}
