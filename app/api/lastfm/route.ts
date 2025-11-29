import { NextResponse } from 'next/server';
import { getCurrentTrack } from '@/app/utils/lastfm';

export async function GET() {
  const username = process.env.NEXT_PUBLIC_LASTFM_USERNAME || 'cirrusk';
  
  try {
    const track = await getCurrentTrack(username);
    
    if (!track) {
      return NextResponse.json(
        { error: 'No track found' },
        { status: 404 }
      );
    }

    return NextResponse.json(track, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch track data' },
      { status: 500 }
    );
  }
}
