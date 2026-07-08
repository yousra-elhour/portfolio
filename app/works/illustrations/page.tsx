"use client";
import Project from "../../components/Project";
import Previous from "@/app/components/Previous";
import illusBanner from "../../../public/images/illustrations/cirrus-yk-cyberpunk-final-fullres.jpg";
import illusBlackHole from "../../../public/images/illustrations/cirrus-yk-black-hole-low.jpg";
import illusStudie from "../../../public/images/illustrations/cirrus-yk-studie2-low-nb.jpg";
import illusRender from "../../../public/images/illustrations/cirrus-yk-render-targafter7-recogvered.jpg";
import illusUntitled13 from "../../../public/images/illustrations/cirrus-yk-untitled-13.jpg";
import illusUntitled14 from "../../../public/images/illustrations/cirrus-yk-untitled-14-1.jpg";
import illusUntitled16 from "../../../public/images/illustrations/cirrus-yk-untitled-16.jpg";
import illusUntitled29 from "../../../public/images/illustrations/cirrus-yk-untitled-29-1.jpg";

export default function WorksPage() {
  return (
    <>
      <Project
        images={[
          illusBlackHole,
          illusStudie,
          illusRender,
          illusUntitled13,
          illusUntitled14,
          illusUntitled16,
          illusUntitled29,
        ]}
        banner={illusBanner}
        title={"Digital Illustrations"}
        live="https://www.artstation.com/cirrusyk"
        techStack={"Photoshop, Blender, Illustrator"}
        next={{ title: "University Projects", href: "/works/university-projects" }}
        description={`
          Before I became a software engineer, I was a digital artist with a passion for visual storytelling. 
          I loved creating immersive environments from natural landscapes to imaginative worlds. 
          Some of my work was personal, while others were commissioned works for clients.
        `}
      />
      <Previous />
    </>
  );
}
