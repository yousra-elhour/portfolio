"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

interface PhotoAlbumProps {
  photos: Photo[];
}

export default function PhotoAlbum({ photos }: PhotoAlbumProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openLightbox = (index: number) => {
    setSelectedPhoto(index);
    setIsOpen(true);
  };

  const closeLightbox = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedPhoto(null), 300);
  };

  const nextPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto + 1) % photos.length);
    }
  };

  const prevPhoto = () => {
    if (selectedPhoto !== null) {
      setSelectedPhoto((selectedPhoto - 1 + photos.length) % photos.length);
    }
  };

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              {photo.caption && (
                <p className="text-white text-xs font-medium">
                  {photo.caption}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto !== null && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevPhoto();
              }}
              className="absolute left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next Button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextPhoto();
              }}
              className="absolute right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Photo Display */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl max-h-[85vh] mx-auto px-4"
          >
            <div className="relative w-full h-full">
              <Image
                src={photos[selectedPhoto].src}
                alt={photos[selectedPhoto].alt}
                width={1200}
                height={800}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Caption */}
            {photos[selectedPhoto].caption && (
              <div className="mt-4 text-center">
                <p className="text-white text-sm font-medium">
                  {photos[selectedPhoto].caption}
                </p>
              </div>
            )}

            {/* Photo Counter */}
            <div className="mt-4 text-center">
              <span className="text-white/60 text-xs">
                {selectedPhoto + 1} / {photos.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
