import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, createDefaultCatState, CatState } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { username, catName } = await request.json();
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'ユーザー名を入力してください' },
        { status: 400 }
      );
    }

    if (!catName || typeof catName !== 'string' || catName.trim().length === 0) {
      return NextResponse.json(
        { error: 'ねこちゃんの名前を入力してください' },
        { status: 400 }
      );
    }

    if (username.length > 20) {
      return NextResponse.json(
        { error: 'ユーザー名は20文字以内で入力してください' },
        { status: 400 }
      );
    }

    if (catName.length > 15) {
      return NextResponse.json(
        { error: 'ねこちゃんの名前は15文字以内で入力してください' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    const session = await getIronSession(request, response, sessionOptions);

    (session as unknown as { username: string; catName: string; catState: CatState }).username = username.trim();
    (session as unknown as { username: string; catName: string; catState: CatState }).catName = catName.trim();
    (session as unknown as { username: string; catName: string; catState: CatState }).catState = createDefaultCatState();
    
    await session.save();

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'サインアップに失敗しました' },
      { status: 500 }
    );
  }
}