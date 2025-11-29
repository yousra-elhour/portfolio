"use client";

import { useEffect, useState } from "react";
import { Music } from "lucide-react";
import Image from "next/image";

interface Album {
  name: string;
  artist: string;
  image: string;
  playcount: string;
  url: string;
}

export default function TopAlbums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/lastfm/top-albums');
        if (response.ok) {
          const data = await response.json();
          setAlbums(data);
        }
      } catch (error) {
        // Error silently handled
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-white/60 text-sm">
        <Music className="w-4 h-4 animate-pulse" />
        <span>Loading albums...</span>
      </div>
    );
  }

  if (!albums.length) {
    return null;
  }

  return (
    <div className="w-full">
      {/* Horizontal Scrollable Albums */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide hover:scrollbar-show scroll-smooth -mx-2 px-2">
        {albums.map((album, index) => (
          <a
            key={`${album.name}-${index}`}
            href={album.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-shrink-0"
          >
            <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 shadow-lg">
              {album.image ? (
                <Image
                  src={album.image}
                  alt={`${album.name} by ${album.artist}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Music className="w-5 h-5 text-white/40" />
                </div>
              )}
              
              {/* Album rank badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-sm rounded-full w-5 h-5 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">
                  {index + 1}
                </span>
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-1.5">
                <div className="text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-[9px] font-bold line-clamp-2 mb-0.5">
                    {album.name}
                  </p>
                  <p className="text-white/70 text-[8px] line-clamp-1">
                    {album.artist}
                  </p>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hover\\:scrollbar-show:hover::-webkit-scrollbar {
          display: block;
          height: 4px;
        }
        .hover\\:scrollbar-show:hover::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .hover\\:scrollbar-show:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .hover\\:scrollbar-show:hover::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
