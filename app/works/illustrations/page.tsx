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
            "/images/illustrations/cirrus-yk-black-hole-low.jpg",
            "/images/illustrations/cirrus-yk-studie2-low-nb.jpg",
            "/images/illustrations/cirrus-yk-render-targafter7-recogvered.jpg",
            "/images/illustrations/cirrus-yk-untitled-13.jpg",
            "/images/illustrations/cirrus-yk-untitled-14-1.jpg",
            "/images/illustrations/cirrus-yk-untitled-16.jpg",
            "/images/illustrations/cirrus-yk-untitled-29-1.jpg",
          ]}
          banner={"/images/illustrations/cirrus-yk-cyberpunk-final-fullres.jpg"}
          title={"Digital Illustrations"}
          live="https://www.artstation.com/cirrusyk"
          techStack={"Photoshop, Blender, Illustrator"}
          description={`
              Before I became a software engineer, I was a digital artist with a passion for visual storytelling. 
             I loved creating immersive environments from natural landscapes to imaginative worlds. 
            Some of my work was  personal, while others were commissioned works for clients.
          `}
        />
      </PageWrapper>
      <Previous />
    </>
  );
}
