// おもちゃアセット情報の一元管理

export interface ToyAsset {
  id: string;
  key: string; // Phaserで使用するキー
  name: string;
  url: string;
  emoji: string;
  attributes?: {
    color: string;
    material: string;
    sound: string;
  };
}

export const TOYS: ToyAsset[] = [
  {
    id: 'toy_ball',
    key: 'toy_ball',
    name: 'ボール',
    url: '/assets/toys/ball.png',
    emoji: '🎾',
    attributes: {
      color: '黄緑',
      material: 'ゴム',
      sound: 'ポンポン'
    }
  },
];

// おもちゃIDでアセット情報を取得
export const getToyAsset = (toyId: string): ToyAsset | undefined => {
  return TOYS.find(toy => toy.id === toyId);
};

// おもちゃキーでアセット情報を取得
export const getToyAssetByKey = (key: string): ToyAsset | undefined => {
  return TOYS.find(toy => toy.key === key);
};

// 全おもちゃのキー一覧を取得
export const getAllToyKeys = (): string[] => {
  return TOYS.map(toy => toy.key);
};

// Phaser用のアセット読み込み情報を取得
export const getToyAssetsForPhaser = () => {
  return TOYS.map(toy => ({
    key: toy.key,
    url: toy.url,
    type: 'image' as const
  }));
};

// API Client用のToyData形式で取得
export const getToysForApiClient = () => {
  return TOYS.map(toy => ({
    id: toy.id,
    name: toy.name,
    attributes: {
      appearance: '可愛い',
      material: toy.attributes?.material || '不明',
      sound: toy.attributes?.sound || '不明',
      color: toy.attributes?.color || '不明'
    }
  }));
};

// React用のおもちゃ画像コンポーネントプロップスを生成
export interface ToyImageProps {
  src: string;
  alt: string;
  emoji: string;
  className?: string;
}

export const getToyImageProps = (toyId: string, className?: string): ToyImageProps => {
  const toy = getToyAsset(toyId);
  return {
    src: toy?.url || '/assets/toys/ball.png',
    alt: toy?.name || 'おもちゃ',
    emoji: toy?.emoji || '🎾',
    className: className || 'w-12 h-12 object-contain'
  };
};