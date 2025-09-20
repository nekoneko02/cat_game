export const IMAGE_IDS = {
  // 共通ヘッダー・ナビゲーション
  HEADER_CAT_ICON: 'header-cat-icon',

  // ホーム画面
  HOME_CAT_HAPPY: 'home-cat-happy',
  HOME_CAT_PAW: 'home-cat-paw',
  HOME_FEATURE_TOY: 'home-feature-toy',
  HOME_FEATURE_HEART: 'home-feature-heart',
  HOME_FEATURE_BRAIN: 'home-feature-brain',

  // プレイ画面
  PLAY_EXIT_DOOR: 'play-exit-door',

  // ゲーム内UI
  GAME_HEART_SMALL: 'game-heart-small',

  // 猫選択画面
  CAT_SELECTION_SAD: 'cat-selection-sad',
  CAT_SELECTION_CHECK: 'cat-selection-check',

  // 登録完了画面
  REGISTRATION_CELEBRATION: 'registration-celebration',

  // エラー・警告
  ERROR_WARNING: 'error-warning',

  // ローディング
  LOADING_CAT_ICON: 'loading-cat-icon'
} as const;

export type ImageId = typeof IMAGE_IDS[keyof typeof IMAGE_IDS];

export const IMAGE_PATHS: Record<ImageId, string> = {
  // 共通ヘッダー・ナビゲーション
  [IMAGE_IDS.HEADER_CAT_ICON]: '/assets/icons/cat-icon.png',

  // ホーム画面
  [IMAGE_IDS.HOME_CAT_HAPPY]: '/assets/icons/cat-icon.png',
  [IMAGE_IDS.HOME_CAT_PAW]: '/assets/icons/cat-icon.png',
  [IMAGE_IDS.HOME_FEATURE_TOY]: '/assets/icons/toy-icon.png',
  [IMAGE_IDS.HOME_FEATURE_HEART]: '/assets/icons/cat-icon.png',
  [IMAGE_IDS.HOME_FEATURE_BRAIN]: '/assets/icons/cat-icon.png',

  // プレイ画面
  [IMAGE_IDS.PLAY_EXIT_DOOR]: '/assets/icons/exit-door.png',

  // ゲーム内UI
  [IMAGE_IDS.GAME_HEART_SMALL]: '/assets/icons/heart-small.svg',

  // 猫選択画面
  [IMAGE_IDS.CAT_SELECTION_SAD]: '/assets/icons/cat-icon.png',
  [IMAGE_IDS.CAT_SELECTION_CHECK]: '/assets/icons/cat-icon.png',

  // 登録完了画面
  [IMAGE_IDS.REGISTRATION_CELEBRATION]: '/assets/icons/cat-icon.png',

  // エラー・警告
  [IMAGE_IDS.ERROR_WARNING]: '/assets/icons/warning.png',

  // ローディング
  [IMAGE_IDS.LOADING_CAT_ICON]: '/assets/icons/cat-icon.png'
};

export const getImagePath = (imageId: ImageId): string => {
  return IMAGE_PATHS[imageId];
};

export const getImageAlt = (imageId: ImageId): string => {
  const altTexts: Record<ImageId, string> = {
    // 共通ヘッダー・ナビゲーション
    [IMAGE_IDS.HEADER_CAT_ICON]: '猫',

    // ホーム画面
    [IMAGE_IDS.HOME_CAT_HAPPY]: '嬉しい猫',
    [IMAGE_IDS.HOME_CAT_PAW]: '肉球',
    [IMAGE_IDS.HOME_FEATURE_TOY]: 'おもちゃで遊ぶ',
    [IMAGE_IDS.HOME_FEATURE_HEART]: 'なつき度システム',
    [IMAGE_IDS.HOME_FEATURE_BRAIN]: 'ねこAI学習',

    // プレイ画面
    [IMAGE_IDS.PLAY_EXIT_DOOR]: '終了',

    // ゲーム内UI
    [IMAGE_IDS.GAME_HEART_SMALL]: 'ハート',

    // 猫選択画面
    [IMAGE_IDS.CAT_SELECTION_SAD]: '悲しい猫',
    [IMAGE_IDS.CAT_SELECTION_CHECK]: '選択済み',

    // 登録完了画面
    [IMAGE_IDS.REGISTRATION_CELEBRATION]: 'お祝い',

    // エラー・警告
    [IMAGE_IDS.ERROR_WARNING]: '警告',

    // ローディング
    [IMAGE_IDS.LOADING_CAT_ICON]: '読み込み中'
  };

  return altTexts[imageId];
};