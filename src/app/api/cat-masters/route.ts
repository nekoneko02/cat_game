import { NextResponse } from 'next/server';
import { CatMaster } from '@/types/CatMaster';

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

export async function GET() {
  try {
    return NextResponse.json({ catMasters });
  } catch (error) {
    console.error('Cat masters fetch error:', error);
    return NextResponse.json(
      { error: 'ねこマスタの取得に失敗しました' },
      { status: 500 }
    );
  }
}