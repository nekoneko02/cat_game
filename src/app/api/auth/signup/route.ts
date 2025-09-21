import { NextRequest, NextResponse } from 'next/server';
import { withAuthEndpoint, ApiContext } from '@/lib/apiCommon';

async function signupHandler(request: NextRequest, context: ApiContext) {
  const { username } = await request.json();

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return NextResponse.json(
      { error: 'ユーザー名を入力してください' },
      { status: 400 }
    );
  }

  if (username.length > 20) {
    return NextResponse.json(
      { error: 'ユーザー名は20文字以内で入力してください' },
      { status: 400 }
    );
  }

  // セッションに保存
  context.session.username = username.trim();
  await context.session.save();

  // デバッグログ追加
  console.log('Signup completed - session state:', {
    username: context.session.username,
    sessionExists: !!context.session,
    isAuthenticated: !!context.session.username
  });

  return NextResponse.json({ success: true });
}

export const POST = withAuthEndpoint(signupHandler);