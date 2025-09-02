export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface GameAction {
  type: 'MOVE_TOY' | 'SELECT_TOY' | 'PET_CAT' | 'FEED_CAT' | 'CALL_CAT';
  payload: Record<string, unknown>;
}

export interface Position {
  x: number;
  y: number;
}

export interface Animation {
  key: string;
  frames: number;
  frameRate: number;
  repeat: number;
}

/**
 * Phaser Game関連の型定義
 */
export interface CatGameScene {
  addToy: (toyType: string) => void;
  removeToy: () => void;
  setBondingCallback: (callback: (bonding: number) => void) => void;
  endGame: () => void;
  getCat: () => unknown;
  getToy: () => unknown;
}

export interface PhaserGame {
  scene: {
    getScene: (key: string) => CatGameScene | null;
  };
  destroy: (removeCanvas?: boolean) => void;
}