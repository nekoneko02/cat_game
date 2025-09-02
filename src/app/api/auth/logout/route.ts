import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true });
    const session = await getIronSession(request, response, sessionOptions);

    session.destroy();

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
}