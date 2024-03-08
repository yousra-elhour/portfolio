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
      </PageWrapper>
      <Previous />
    </>
  );
}
