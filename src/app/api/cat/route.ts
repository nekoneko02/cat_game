import { NextRequest, NextResponse } from 'next/server';
import { createDefaultCatState } from '@/lib/session';
import { withAuthApi, ApiContext } from '@/lib/apiCommon';

const catMasters = [
  { id: 'tanuki_cat', name: 'たぬきねこ' }
];

async function createCatHandler(request: NextRequest, context: ApiContext) {
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

  context.session.catName = catName.trim();
  context.session.catState = createDefaultCatState();

  await context.session.save();

  return NextResponse.json({ success: true });
}

export const POST = withAuthApi(createCatHandler);