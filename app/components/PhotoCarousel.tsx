"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
}

export default function PhotoCarousel({ photos }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  if (photos.length === 0) return null;

  const handleClick = () => {
    if (photos.length <= 1) return;
    
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
      setIsFlipping(false);
    }, 300);
  };

  return (
    <div className="relative w-full">
      {/* Stacked Cards Effect - Background Cards */}
      {photos.length > 1 && (
        <>
          {/* Second card */}
          <div className="absolute inset-0 bg-white/3 rounded-xl border border-white/10 transform translate-y-1.5 translate-x-0.5 scale-[0.98] z-0"></div>
          {/* Third card */}
          {photos.length > 2 && (
            <div className="absolute inset-0 bg-white/3 rounded-xl border border-white/10 transform translate-y-3 translate-x-1 scale-[0.96] -z-10"></div>
          )}
        </>
      )}

      {/* Main Photo Container - Clickable */}
      <button
        onClick={handleClick}
        className="relative w-full aspect-square rounded-xl overflow-hidden border border-white/30 shadow-xl cursor-pointer group z-10 hover:border-white/50 hover:shadow-2xl transition-all duration-300"
      >
        <div
          className={`relative w-full h-full transition-transform duration-600 ${
            isFlipping ? "scale-95" : "scale-100"
          }`}
          style={{
            transform: isFlipping ? "rotateY(90deg)" : "rotateY(0deg)",
            transition: "transform 0.6s ease-in-out",
          }}
        >
          <Image
            src={photos[currentIndex].src}
            alt={photos[currentIndex].alt}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Click hint - only shows on hover if multiple photos */}
        {photos.length > 1 && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            
          </div>
        )}
      </button>

      {/* Manual Navigation Dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsFlipping(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsFlipping(false);
                }, 300);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-white w-5"
                  : "bg-white/30 hover:bg-white/50 w-1"
              }`}
              aria-label={`Go to photo ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
