import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, CatState } from '@/lib/session';
import { logWithRequest } from '@/lib/log';

export async function GET(request: NextRequest) {
  try {
    logWithRequest(request, 'info', 'Get cat state request', {
      url: '/api/cat-state',
      method: 'GET',
    });

    const response = NextResponse.json({});
    const session = await getIronSession(request, response, sessionOptions);

    if (!(session as unknown as { username?: string }).username) {
      logWithRequest(request, 'warn', 'Get cat state failed: not authenticated');
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const sessionData = session as unknown as { catState?: CatState; catName?: string };
    logWithRequest(request, 'info', 'Get cat state successful', {
      hasCatState: !!sessionData.catState,
      hasCatName: !!sessionData.catName,
    });
    return NextResponse.json({
      catState: sessionData.catState || null,
      catName: sessionData.catName || null
    });
  } catch (error) {
    logWithRequest(request, 'error', 'Get cat state error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '状態の取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.text();
    if (!requestBody.trim()) {
      logWithRequest(request, 'info', 'Empty request body, skipping cat state save');
      return NextResponse.json({ success: true, message: 'No data to save' });
    }

    const { catState } = JSON.parse(requestBody);
    
    if (!catState || typeof catState !== 'object') {
      return NextResponse.json(
        { error: '不正な猫の状態データです' },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    const session = await getIronSession(request, response, sessionOptions);

    if (!(session as unknown as { username?: string }).username) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const validatedCatState: CatState = {
      bonding: Math.max(-1, Math.min(1, catState.bonding || 0)),
      playfulness: Math.max(-1, Math.min(1, catState.playfulness || 0)),
      fear: Math.max(-1, Math.min(1, catState.fear || 0)),
      personality: catState.personality || (session as unknown as { catState?: CatState }).catState?.personality || {},
      preferences: catState.preferences || (session as unknown as { catState?: CatState }).catState?.preferences || {}
    };

    (session as unknown as { catState: CatState }).catState = validatedCatState;
    await session.save();

    return response;
  } catch (error) {
    logWithRequest(request, 'error', 'Save cat state error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: '状態の保存に失敗しました' },
      { status: 500 }
    );
  }
}