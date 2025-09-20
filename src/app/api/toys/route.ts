import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface ToyData {
  id: string; // 'toy_ball' などの完全なアセットキー
  name: string;
  attributes: {
    appearance: string;
    material: string;
    sound: string;
    color: string;
  };
}

interface AssetsConfig {
  toys: Array<{
    key: string;
    url: string;
    type: string;
  }>;
}

// アセットキーから表示名を取得
function getToyDisplayName(key: string): string {
  const names: Record<string, string> = {
    'toy_ball': 'ボール',
    'toy_feather': 'フェザー',
    'toy_mouse': 'ねずみ'
  };
  return names[key] || key.replace('toy_', '');
}

// アセットキーから属性を取得
function getToyAttributes(key: string) {
  const attributes: Record<string, { appearance: string; material: string; sound: string; color: string }> = {
    'toy_ball': { appearance: 'round', material: 'rubber', sound: 'bounce', color: 'red' },
    'toy_feather': { appearance: 'fluffy', material: 'feather', sound: 'rustle', color: 'colorful' },
    'toy_mouse': { appearance: 'small', material: 'fabric', sound: 'squeak', color: 'gray' }
  };
  return attributes[key] || { appearance: 'unknown', material: 'unknown', sound: 'unknown', color: 'unknown' };
}

export async function GET() {
  try {
    // assets.jsonを読み込み
    const configPath = path.join(process.cwd(), 'public', 'config', 'assets.json');
    const configContent = await fs.readFile(configPath, 'utf8');
    const assetsConfig: AssetsConfig = JSON.parse(configContent);

    // assets.jsonからおもちゃ情報を変換
    const toys: ToyData[] = assetsConfig.toys
      .filter(toy => toy.key.startsWith('toy_'))
      .map(toy => ({
        id: toy.key, // 'toy_ball' などの完全なキー
        name: getToyDisplayName(toy.key),
        attributes: getToyAttributes(toy.key)
      }));

    return NextResponse.json({
      toys: toys
    });
  } catch (error) {
    console.error('Error fetching toys from assets.json:', error);

    // フォールバック: 最小限のおもちゃ
    const fallbackToys: ToyData[] = [
      {
        id: 'toy_ball',
        name: 'ボール（組み込み）',
        attributes: {
          appearance: 'round',
          material: 'rubber',
          sound: 'bounce',
          color: 'red',
        },
      }
    ];

    return NextResponse.json({
      toys: fallbackToys
    });
  }
}