"use client";
import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";
import Previous from "@/app/components/Previous";

export default function IllustrationsPage() {
  return (
    <>
      <PageWrapper>
        <Project
          images={[
            "/images/illustrator/cirrus-yk-black-hole-low.jpg",
            "/images/illustrator/cirrus-yk-render-targafter7-recogvered.jpg",
            "/images/illustrator/cirrus-yk-studie2-low-nb.jpg",
            "/images/illustrator/cirrus-yk-untitled-13.jpg",
            "/images/illustrator/cirrus-yk-untitled-14-1.jpg",
            "/images/illustrator/cirrus-yk-untitled-16.jpg",
            "/images/illustrator/cirrus-yk-untitled-29-1.jpg",
          ]}
          banner={"/images/illustrator/cirrus-yk-cyberpunk-final-fullres.jpg"}
          title={"Digital Illustrations"}
          techStack={"Photoshop, Blender, Illustrator"}
          live="https://www.artstation.com/cirrusyk"
          description={`
            Before I did my bachelor's and became a software engineer, I worked as a 
            freelance illustrator for various clients. music, games, etc. I enjoyed 
            every part of it. This collection shows some of my work from that time.
          `}
        />
      </PageWrapper>
      <Previous />
    </>
  );
}
