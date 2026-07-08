"use client";
import Project from "../../components/Project";
import Previous from "@/app/components/Previous";
import vinylBanner from "../../../public/images/vinyl-banner.png";
import desktopShot from "../../../public/images/Desktop - 4.png";
import productPage from "../../../public/images/product-page.png";
import buyVinyl from "../../../public/images/buy-vinyl.png";
import adminShot from "../../../public/images/admin-s1.jpg";

export default function WorksPage() {
  return (
    <>
      <Project
        images={[desktopShot, productPage, buyVinyl]}
        captions={[
          "Storefront — browse albums with playback and search",
          "Product page — details, playback and shortlisting",
          "Buy Vinyl — cart and checkout flow",
        ]}
        next={{ title: "Nature Housing", href: "/works/nature-housing" }}
        banner={vinylBanner}
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
        additionalImages={[adminShot]}
        additionalTitle="Vinyl E-commerce CMS"
        additionalLink="https://vinyl-admin.vercel.app/"
        additionalDescription="You need the Login credentials to be able to use the admin
        website Contact me if you're interested in testing it."
      />
      <Previous />
    </>
  );
}
