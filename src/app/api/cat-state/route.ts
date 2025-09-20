import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, CatState } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({});
    const session = await getIronSession(request, response, sessionOptions);

    if (!(session as unknown as { username?: string }).username) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const sessionData = session as unknown as { catState?: CatState; catName?: string };
    return NextResponse.json({
      catState: sessionData.catState || null,
      catName: sessionData.catName || null
    });
  } catch (error) {
    console.error('Get cat state error:', error);
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
      console.log('Empty request body, skipping cat state save');
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
    console.error('Save cat state error:', error);
    return NextResponse.json(
      { error: '状態の保存に失敗しました' },
      { status: 500 }
    );
  }
}