import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { logWithRequest } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    logWithRequest(request, 'info', 'Session check request', {
      url: '/api/auth/session',
      method: 'GET',
    });

    const response = NextResponse.json({ authenticated: false });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (session.username) {
      logWithRequest(request, 'info', 'Session check: authenticated', {
        username: session.username,
        hasCatName: !!session.catName,
      });
      return NextResponse.json({
        authenticated: true,
        username: session.username,
        catName: session.catName || null
      });
    }

    logWithRequest(request, 'info', 'Session check: not authenticated');
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    logWithRequest(request, 'error', 'Session check error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ authenticated: false });
  }
}