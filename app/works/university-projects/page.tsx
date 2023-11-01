import { PageWrapper } from "../../components/PageWrapper";
import Project from "../../components/Project";

export default function WorksPage() {
  const projects = [
    {
      img: "/images/universityProjects/shoeproject.png",
      techStack: "Java, SpringBoot, ThymeLeaf, Bootstrap",
      title: "Fast Shoe Store WebApp",
      code: "https://github.com/cirrusyk/e-shop-project",
      design:
        "https://www.behance.net/gallery/147408103/E-commerce-website-for-shoes",
    },

    {
      img: "/images/universityProjects/sist-connect.png",
      techStack: "Flutter, Firebase",
      title: "Sist Connect - Social Media For University",
      code: "https://github.com/cirrusyk/SistConnect",
      design:
        "https://www.behance.net/gallery/147408235/University-social-media-app-concept",
    },
    {
      img: "/images/universityProjects/tictactoe.jpg",
      techStack: "Python, Pygame, Agile, UML Diagrams, ",
      title: "Tic Tic Tac using AI algorithms ",
      code: "https://github.com/yousra-elhour/tic-tac-toe/tree/master",
    },

    {
      img: "/images/universityProjects/hr-manager.png",
      techStack: "Flutter, Firebase ",
      title: "Human Resources App ",
      code: "https://github.com/cirrusyk/HumanResourceApp/tree/master",
    },
  ];
  return (
    <>
      <PageWrapper>
        <Project
          banner={"/images/cmu-blue-logo.gif"}
          title={"University Projects"}
          techStack={
            "Web & App Development, Object Oriented Programming, Software Design"
          }
          description={`
          Throughout my Bachelor of Software Engineering at Cardiff Metropolitan University, 
          I worked on a variety of projects, Object Oriented programming, web development, database work, and software engineering principles. 
          `}
          imagesTitle={projects}
        />
      </PageWrapper>
    </>
  );
}
