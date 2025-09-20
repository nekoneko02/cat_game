import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { logWithRequest } from '@/lib/log';

export async function POST(request: NextRequest) {
  try {
    logWithRequest(request, 'info', 'Logout request', {
      url: '/api/auth/logout',
      method: 'POST',
    });

    const response = NextResponse.json({ success: true });
    const session = await getIronSession(request, response, sessionOptions);

    session.destroy();

    logWithRequest(request, 'info', 'Logout successful');
    return response;
  } catch (error) {
    logWithRequest(request, 'error', 'Logout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
}