"use client";

import { useState, useEffect } from "react";
import { gsap } from "gsap";

const navItems = [
  { id: "home", label: "HOME" },
  { id: "about", label: "ABOUT" },
  { id: "works", label: "WORKS" },
  { id: "contact", label: "CONTACT" },
];

export default function ScrollNav() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = navItems
        .map((item) => document.getElementById(item.id))
        .filter(Boolean);
      const scrollY = window.scrollY + window.innerHeight / 2;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollY) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-1/2 right-8 transform -translate-y-1/2 z-50 hidden lg:block">
        <div className="flex flex-col space-y-6">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                relative group text-xs tracking-[.4em] font-light transition-all duration-300
                ${
                  activeSection === item.id
                    ? "text-white"
                    : "text-white/60 hover:text-white/80"
                }
              `}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {item.label}

              {/* Active indicator */}
              <div
                className={`
                  absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-white transition-all duration-300
                  ${activeSection === item.id ? "h-8 -top-10" : "h-0 -top-5"}
                `}
              />
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <div className="flex space-x-6 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`
                text-xs tracking-wider font-light transition-all duration-300 px-3 py-1 rounded-full
                ${
                  activeSection === item.id
                    ? "text-white bg-white/20"
                    : "text-white/60 hover:text-white/80"
                }
              `}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
