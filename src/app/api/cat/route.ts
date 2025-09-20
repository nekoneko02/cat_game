import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, createDefaultCatState, SessionData } from '@/lib/session';

const catMasters = [
  { id: 'tanuki_cat', name: 'たぬきねこ' }
];

export async function POST(request: NextRequest) {
  try {
    const { catMasterId, catName } = await request.json();

    if (!catMasterId || typeof catMasterId !== 'string') {
      return NextResponse.json(
        { error: 'ねこマスタが選択されていません' },
        { status: 400 }
      );
    }

    if (!catName || typeof catName !== 'string' || catName.trim().length === 0) {
      return NextResponse.json(
        { error: 'ねこちゃんの名前を入力してください' },
        { status: 400 }
      );
    }

    if (catName.length > 10) {
      return NextResponse.json(
        { error: 'ねこちゃんの名前は10文字以内で入力してください' },
        { status: 400 }
      );
    }

    const validCatMaster = catMasters.find(master => master.id === catMasterId);
    if (!validCatMaster) {
      return NextResponse.json(
        { error: '選択されたねこマスタが見つかりません' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.username) {
      return NextResponse.json(
        { error: 'ユーザーがログインしていません' },
        { status: 401 }
      );
    }

    session.catName = catName.trim();
    session.catState = createDefaultCatState();

    await session.save();

    return response;
  } catch (error) {
    console.error('Cat save error:', error);
    return NextResponse.json(
      { error: 'ねこの保存に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}