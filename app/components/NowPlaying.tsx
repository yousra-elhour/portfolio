"use client";

import { useEffect, useState } from "react";
import { Music, Radio } from "lucide-react";
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

export default function NowPlaying() {
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchTrack, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 text-white/60 text-sm">
        <Music className="w-4 h-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!track) {
    return null;
  }

  return (
    <div className="group relative">
      <div className="flex items-center gap-2.5 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-2.5 hover:border-white/30 transition-all duration-300">
        {/* Album Art */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {track.image ? (
            <Image
              src={track.image}
              alt={track.album}
              fill
              className="rounded-lg object-cover shadow-lg ring-2 ring-white/20"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-lg flex items-center justify-center ring-2 ring-white/20">
              <Music className="w-5 h-5 text-white/40" />
            </div>
          )}
          
          {/* Now Playing Indicator */}
          {track.isPlaying && (
            <div className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-orange-500 to-orange-300 rounded-full p-0.5 shadow-lg animate-pulse ring-1 ring-white/30">
              <Radio className="w-2 h-2 text-white" />
            </div>
          )}
        </div>

        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            {track.isPlaying ? (
              <>
                <div className="flex gap-0.5 items-end h-2.5">
                  <span className="w-0.5 bg-gradient-to-t from-orange-500 to-orange-400 rounded-full animate-[equalizer_0.8s_ease-in-out_infinite]" />
                  <span className="w-0.5 bg-gradient-to-t from-orange-500 to-orange-400 rounded-full animate-[equalizer_0.8s_ease-in-out_0.2s_infinite]" />
                  <span className="w-0.5 bg-gradient-to-t from-orange-500 to-orange-400 rounded-full animate-[equalizer_0.8s_ease-in-out_0.4s_infinite]" />
                </div>
                <span className="text-orange-400 text-[8px] font-bold uppercase tracking-widest">
                  Now Playing
                </span>
              </>
            ) : (
              <span className="text-white/40 text-[8px] font-bold uppercase tracking-widest">
                Recently Played
              </span>
            )}
          </div>
          
          <a
            href={track.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group/link"
          >
            <p className="text-white font-bold text-[11px] truncate group-hover/link:text-orange-300 transition-colors">
              {track.name}
            </p>
            <p className="text-white/60 text-[9px] truncate font-medium group-hover/link:text-orange-200/70 transition-colors">
              {track.artist}
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
