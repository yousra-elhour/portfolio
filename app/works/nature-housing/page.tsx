import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";

export default function WorksPage() {
  return (
    <>
      <PageWrapper>
        <Project
          images={[
            "/images/nature-housing/main.png",
            "/images/nature-housing/homepage.png",
            "/images/nature-housing/house.png",
            "/images/nature-housing/admin.png",
          ]}
          banner={"/images/nature-banner.png"}
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
      </PageWrapper>
    </>
  );
}
