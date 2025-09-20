import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, createDefaultCatState, SessionData } from '@/lib/session';
import { logWithRequest } from '@/lib/log';

const catMasters = [
  { id: 'tanuki_cat', name: 'たぬきねこ' }
];

export async function POST(request: NextRequest) {
  try {
    const { catMasterId, catName } = await request.json();

    logWithRequest(request, 'info', 'Cat creation request', {
      url: '/api/cat',
      method: 'POST',
      catMasterId,
      catNameLength: catName?.length,
    });

    if (!catMasterId || typeof catMasterId !== 'string') {
      logWithRequest(request, 'warn', 'Cat creation failed: missing catMasterId');
      return NextResponse.json(
        { error: 'ねこマスタが選択されていません' },
        { status: 400 }
      );
    }

    if (!catName || typeof catName !== 'string' || catName.trim().length === 0) {
      logWithRequest(request, 'warn', 'Cat creation failed: empty catName');
      return NextResponse.json(
        { error: 'ねこちゃんの名前を入力してください' },
        { status: 400 }
      );
    }

    if (catName.length > 10) {
      logWithRequest(request, 'warn', 'Cat creation failed: catName too long', {
        catNameLength: catName.length,
      });
      return NextResponse.json(
        { error: 'ねこちゃんの名前は10文字以内で入力してください' },
        { status: 400 }
      );
    }

    const validCatMaster = catMasters.find(master => master.id === catMasterId);
    if (!validCatMaster) {
      logWithRequest(request, 'warn', 'Cat creation failed: invalid catMasterId', {
        catMasterId,
      });
      return NextResponse.json(
        { error: '選択されたねこマスタが見つかりません' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(request, response, sessionOptions);

    if (!session.username) {
      logWithRequest(request, 'warn', 'Cat creation failed: not authenticated');
      return NextResponse.json(
        { error: 'ユーザーがログインしていません' },
        { status: 401 }
      );
    }

    session.catName = catName.trim();
    session.catState = createDefaultCatState();

    await session.save();

    logWithRequest(request, 'info', 'Cat creation successful', {
      catName: catName.trim(),
      catMasterId,
      username: session.username,
    });

    return response;
  } catch (error) {
    logWithRequest(request, 'error', 'Cat creation error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'ねこの保存に失敗しました。もう一度お試しください。' },
      { status: 500 }
    );
  }
}