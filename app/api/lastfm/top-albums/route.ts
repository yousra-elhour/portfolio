import { NextResponse } from 'next/server';

export interface TopAlbum {
  name: string;
  artist: string;
  image: string;
  playcount: string;
  url: string;
}

export async function GET() {
  const username = process.env.NEXT_PUBLIC_LASTFM_USERNAME || 'cirrusyk';
  const apiKey = process.env.NEXT_PUBLIC_LASTFM_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=${username}&api_key=${apiKey}&format=json&limit=8&period=overall`,
      { 
        next: { revalidate: 3600 }, // Cache for 1 hour
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch top albums: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: data.message },
        { status: 400 }
      );
    }

    const albums: TopAlbum[] = data.topalbums?.album?.map((album: any) => ({
      name: album.name || 'Unknown Album',
      artist: album.artist?.name || album.artist || 'Unknown Artist',
      image: album.image?.find((img: any) => img.size === 'large')?.['#text'] || 
             album.image?.find((img: any) => img.size === 'extralarge')?.['#text'] || '',
      playcount: album.playcount || '0',
      url: album.url || '',
    })) || [];

    return NextResponse.json(albums, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    );
  }
}
