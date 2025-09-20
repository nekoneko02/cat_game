import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { logWithRequest, ensureAnonymousUuidCookie } from '@/lib/log';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  try {
    const { username } = await request.json();

    logWithRequest(request, 'info', 'Signup request received', {
      url: '/api/auth/signup',
      method: 'POST',
      userAgent: request.headers.get('user-agent'),
    });

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      logWithRequest(request, 'warn', 'Signup failed: empty username');
      return NextResponse.json(
        { error: 'ユーザー名を入力してください' },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      logWithRequest(request, 'warn', 'Signup failed: username too long', {
        usernameLength: username.length,
      });
      return NextResponse.json(
        { error: 'ユーザー名は20文字以内で入力してください' },
        { status: 400 }
      );
    }

    const anonymousUuid = ensureAnonymousUuidCookie(request, response);

    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    session.username = username.trim();

    await session.save();

    logWithRequest(request, 'info', 'Signup successful', {
      username: username.trim(),
      anonymousUuid,
    });

    return response;
  } catch (error) {
    logWithRequest(request, 'error', 'Signup error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'サインアップに失敗しました' },
      { status: 500 }
    );
  }
}