import { NextRequest, NextResponse } from 'next/server';
import { CatMaster } from '@/types/CatMaster';
import { withPublicApi, ApiContext } from '@/lib/apiCommon';

const catMasters: CatMaster[] = [
  {
    id: 'tanuki_cat',
    name: 'たぬきねこ',
    description: 'とってもかわいいたぬきねこちゃんです。一緒に遊んで、特別な絆を育みましょう。',
    imageUrl: '/assets/cats/idle.png',
    personality: {
      social: 0.7,
      active: 0.8,
      bold: 0.6,
      dependent: 0.5,
      friendly: 0.8
    },
    preferences: {
      toyTypes: ['ball', 'feather', 'mouse'],
      movementSpeed: 0.7,
      movementDirections: ['horizontal', 'vertical'],
      randomness: 0.6
    }
  }
];

async function getCatMastersHandler(_request: NextRequest, _context: ApiContext) {
  return NextResponse.json({ catMasters });
}

export const GET = withPublicApi(getCatMastersHandler);