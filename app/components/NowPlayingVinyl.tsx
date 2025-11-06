"use client";

import { useEffect, useState } from "react";
import { Music, Disc3 } from "lucide-react";
import Image from "next/image";

interface Track {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  isPlaying: boolean;
  playedAt?: string;
}

export default function NowPlayingVinyl() {
  const [track, setTrack] = useState<Track | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const response = await fetch('/api/lastfm');
        if (response.ok) {
          const data = await response.json();
          setTrack(data);
        }
      } catch (error) {
        console.error('Error fetching track:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrack();
    const interval = setInterval(fetchTrack, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || !track) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Vinyl Record Effect */}
      <div className="relative">
        <div className="flex items-center gap-6">
          {/* Spinning Vinyl/Album Art */}
          <div className="relative">
            {/* Vinyl record behind */}
            <div className={`absolute inset-0 -z-10 ${track.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
              <Disc3 className="w-20 h-20 text-white/20" />
            </div>
            
            {/* Album art */}
            <div className="relative w-20 h-20 flex-shrink-0">
              {track.image ? (
                <div className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl border-2 border-white/20 ${track.isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }}>
                  <Image
                    src={track.image}
                    alt={track.album}
                    fill
                    className="object-cover"
                  />
                  {/* Center hole */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 bg-black rounded-full border-2 border-white/30" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border-2 border-white/10">
                  <Music className="w-8 h-8 text-white/40" />
                </div>
              )}
            </div>
          </div>

          {/* Track Info with Retro Style */}
          <div className="flex-1 min-w-0 space-y-1">
            {track.isPlaying && (
              <div className="flex items-center gap-2 text-xs">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-bold uppercase tracking-widest">
                  Live
                </span>
              </div>
            )}
            
            <a
              href={track.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group/link"
            >
              <p className="text-white font-bold text-lg leading-tight truncate group-hover/link:text-blue-400 transition-colors">
                {track.name}
              </p>
              <p className="text-white/70 text-sm truncate font-medium">
                {track.artist}
              </p>
              <p className="text-white/40 text-xs truncate">
                {track.album}
              </p>
            </a>
          </div>
        </div>

        {/* Retro sound wave visualization */}
        {track.isPlaying && (
          <div className="mt-4 flex justify-center gap-1 opacity-50">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                style={{
                  height: `${Math.random() * 20 + 10}px`,
                  animation: `equalizer ${Math.random() * 0.5 + 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
