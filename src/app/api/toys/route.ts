import { NextResponse } from 'next/server';
import { getToysForApiClient } from '@/constants/toys';

export async function GET() {
  try {
    // toys.tsから一元管理されたおもちゃ情報を取得
    const toys = getToysForApiClient();

    return NextResponse.json({
      toys: toys
    });
  } catch (error) {
    console.error('Error fetching toys from toys.ts:', error);

    // フォールバック: エラー時は空配列を返す
    return NextResponse.json({
      toys: []
    }, { status: 500 });
  }
}