export interface GameConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface GameAction {
  type: 'MOVE_TOY' | 'SELECT_TOY' | 'PET_CAT' | 'FEED_CAT' | 'CALL_CAT';
  payload: any;
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