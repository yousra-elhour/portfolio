"use client";

import Project from "../../components/Project";
import Previous from "@/app/components/Previous";
import cardiff from "../../../public/images/cmu-blue-logo.gif";
import upShoe from "../../../public/images/universityProjects/shoeproject.png";
import upSist from "../../../public/images/universityProjects/sist-connect.png";
import upTictactoe from "../../../public/images/universityProjects/tictactoe.jpg";
import upHr from "../../../public/images/universityProjects/hr-manager.png";

export default function WorksPage() {
  const projects = [
    {
      img: upShoe,
      techStack: "Java, SpringBoot, ThymeLeaf, Bootstrap",
      title: "Fast Shoe Store WebApp",
      code: "https://github.com/cirrusyk/e-shop-project",
      design:
        "https://www.behance.net/gallery/147408103/E-commerce-website-for-shoes",
    },

    {
      img: upSist,
      techStack: "Flutter, Firebase",
      title: "Sist Connect - Social Media For University",
      code: "https://github.com/cirrusyk/SistConnect",
      design:
        "https://www.behance.net/gallery/147408235/University-social-media-app-concept",
    },
    {
      img: upTictactoe,
      techStack: "Python, Pygame, Agile, UML Diagrams",
      title: "Tic Tac Toe using AI algorithms",
      code: "https://github.com/yousra-elhour/tic-tac-toe/tree/master",
    },

    {
      img: upHr,
      techStack: "Flutter, Firebase",
      title: "Human Resources App ",
      code: "https://github.com/cirrusyk/HumanResourceApp/tree/master",
    },
  ];
  return (
    <>
      <Project
        banner={cardiff}
        title={"University Projects"}
        techStack={
          "Web & App Development, Object Oriented Programming, Software Design"
        }
        description={`
        Throughout my Bachelor of Software Engineering at Cardiff Metropolitan University, 
        I worked on a variety of projects, Object Oriented programming, web development, database work, and software engineering principles. 
        `}
        imagesTitle={projects}
        next={{ title: "Vinyl E-Commerce", href: "/works/vinyl" }}
      />

      <Previous />
    </>
  );
}
