export interface LastFmTrack {
  name: string;
  artist: string;
  album: string;
  image: string;
  url: string;
  isPlaying: boolean;
  playedAt?: string;
}

export async function getCurrentTrack(username: string): Promise<LastFmTrack | null> {
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  
  if (!apiKey) {
    console.error('Last.fm API key is not configured');
    return null;
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&format=json&limit=1`,
      { 
        next: { revalidate: 60 }, // Cache for 60 seconds
        cache: 'no-store' // Disable caching for now to see live data
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Last.fm API error:', response.status, errorText);
      throw new Error(`Failed to fetch Last.fm data: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle error response from Last.fm
    if (data.error) {
      console.error('Last.fm API error:', data.message);
      return null;
    }

    const track = data.recenttracks?.track?.[0];

    if (!track) {
      console.log('No track found in response');
      return null;
    }

    const isPlaying = track['@attr']?.nowplaying === 'true';
    const image = track.image?.find((img: any) => img.size === 'large')?.['#text'] || 
                  track.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || 
                  '';

    return {
      name: track.name || 'Unknown Track',
      artist: track.artist?.['#text'] || track.artist || 'Unknown Artist',
      album: track.album?.['#text'] || 'Unknown Album',
      image,
      url: track.url || '',
      isPlaying,
      playedAt: track.date?.['#text'],
    };
  } catch (error) {
    console.error('Error fetching Last.fm data:', error);
    return null;
  }
}
