import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({ authenticated: false });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (session.username) {
      return NextResponse.json({
        authenticated: true,
        username: session.username,
        catName: session.catName || null
      });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}