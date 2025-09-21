import { NextRequest, NextResponse } from 'next/server';
import { CatState } from '@/lib/session';
import { withAuthApi, ApiContext } from '@/lib/apiCommon';

async function getCatStateHandler(request: NextRequest, context: ApiContext) {
  return NextResponse.json({
    catState: context.session.catState || null,
    catName: context.session.catName || null
  });
}

async function saveCatStateHandler(request: NextRequest, context: ApiContext) {
  const requestBody = await request.text();
  if (!requestBody.trim()) {
    return NextResponse.json({ success: true, message: 'No data to save' });
  }

  const { catState } = JSON.parse(requestBody);

  if (!catState || typeof catState !== 'object') {
    return NextResponse.json(
      { error: '不正な猫の状態データです' },
      { status: 400 }
    );
  }

  const validatedCatState: CatState = {
    bonding: Math.max(-1, Math.min(1, catState.bonding || 0)),
    playfulness: Math.max(-1, Math.min(1, catState.playfulness || 0)),
    fear: Math.max(-1, Math.min(1, catState.fear || 0)),
    personality: catState.personality || context.session.catState?.personality || {},
    preferences: catState.preferences || context.session.catState?.preferences || {}
  };

  context.session.catState = validatedCatState;
  await context.session.save();

  return NextResponse.json({ success: true });
}

export const GET = withAuthApi(getCatStateHandler);
export const POST = withAuthApi(saveCatStateHandler);