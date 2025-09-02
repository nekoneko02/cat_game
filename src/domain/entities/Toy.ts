
/**
 * おもちゃの種類
 */
export type ToyType = 'ball' | 'feather' | 'mouse' | 'laser';

/**
 * おもちゃの状態
 */
export interface ToyState {
  isMoving: boolean;
  lastMoveTime: number;
  speed: number;
}

/**
 * おもちゃエンティティ
 * ゲーム内のおもちゃオブジェクトを表現するドメインエンティティ
 */
export class Toy {
  private state: ToyState;

  constructor(
    public readonly type: ToyType,
    public readonly x: number,
    public readonly y: number,
    public readonly attractiveness: number = 1.0 // ねこにとっての魅力度
  ) {
    this.state = {
      isMoving: false,
      lastMoveTime: Date.now(),
      speed: this.calculateDefaultSpeed()
    };
  }

  /**
   * おもちゃの現在状態を取得
   */
  getState(): ToyState {
    return { ...this.state };
  }

  /**
   * おもちゃの魅力度を取得
   */
  getAttractiveness(): number {
    return this.attractiveness;
  }

  /**
   * おもちゃの種類に基づく基本特性を取得
   */
  getCharacteristics() {
    switch (this.type) {
      case 'ball':
        return {
          movementType: 'bounce',
          preferredSpeed: 0.5,
          attractiveness: 0.7,
          color: 0xff6b6b
        };
      case 'feather':
        return {
          movementType: 'flutter',
          preferredSpeed: 0.3,
          attractiveness: 0.9,
          color: 0x4ecdc4
        };
      case 'mouse':
        return {
          movementType: 'scurry',
          preferredSpeed: 0.8,
          attractiveness: 1.0,
          color: 0x45b7d1
        };
      case 'laser':
        return {
          movementType: 'dart',
          preferredSpeed: 1.0,
          attractiveness: 1.2,
          color: 0xff4757
        };
      default:
        return {
          movementType: 'static',
          preferredSpeed: 0,
          attractiveness: 0.5,
          color: 0x999999
        };
    }
  }

  /**
   * おもちゃを移動開始
   */
  startMoving(speed?: number): Toy {
    const newState: ToyState = {
      ...this.state,
      isMoving: true,
      speed: speed || this.state.speed,
      lastMoveTime: Date.now()
    };

    return new Toy(
      this.type,
      this.x,
      this.y,
      this.attractiveness
    ).withState(newState);
  }

  /**
   * おもちゃを停止
   */
  stopMoving(): Toy {
    const newState: ToyState = {
      ...this.state,
      isMoving: false,
      lastMoveTime: Date.now()
    };

    return new Toy(
      this.type,
      this.x,
      this.y,
      this.attractiveness
    ).withState(newState);
  }

  /**
   * おもちゃを新しい位置に移動
   */
  moveTo(newX: number, newY: number): Toy {
    const newState: ToyState = {
      ...this.state,
      lastMoveTime: Date.now()
    };

    return new Toy(
      this.type,
      newX,
      newY,
      this.attractiveness
    ).withState(newState);
  }

  /**
   * ねこにとっての興味度を計算
   * ねこの好みと距離を考慮
   */
  calculateInterestLevel(
    catX: number,
    catY: number,
    catPreferences: {
      toyTypes: string[];
      movementSpeed: number;
      randomness: number;
    }
  ): number {
    // 距離による減衰
    const distance = Math.sqrt((this.x - catX) ** 2 + (this.y - catY) ** 2);
    const distanceFactor = Math.max(0, 1 - (distance / 300)); // 300px以内で有効

    // ねこの好みによる補正
    const typePreference = catPreferences.toyTypes.includes(this.type) ? 1.2 : 0.8;
    
    // 動きによる補正
    const movementBonus = this.state.isMoving ? 1.3 : 1.0;
    
    // 種類による基本魅力度
    const baseAttractiveness = this.getCharacteristics().attractiveness;

    return baseAttractiveness * typePreference * movementBonus * distanceFactor;
  }

  /**
   * おもちゃがねこの注意を引くかどうか
   */
  shouldAttractCat(
    catX: number,
    catY: number,
    catPreferences: { toyTypes: string[]; movementSpeed: number; randomness: number },
    threshold: number = 0.5
  ): boolean {
    return this.calculateInterestLevel(catX, catY, catPreferences) > threshold;
  }

  /**
   * デフォルト速度を計算
   */
  private calculateDefaultSpeed(): number {
    return this.getCharacteristics().preferredSpeed;
  }

  /**
   * 状態を設定した新しいインスタンスを作成
   */
  private withState(newState: ToyState): Toy {
    const toy = new Toy(this.type, this.x, this.y, this.attractiveness);
    toy.state = newState;
    return toy;
  }

  /**
   * おもちゃファクトリメソッド
   */
  static createBall(x: number, y: number): Toy {
    return new Toy('ball', x, y, 0.7);
  }

  static createFeather(x: number, y: number): Toy {
    return new Toy('feather', x, y, 0.9);
  }

  static createMouse(x: number, y: number): Toy {
    return new Toy('mouse', x, y, 1.0);
  }

  static createLaser(x: number, y: number): Toy {
    return new Toy('laser', x, y, 1.2);
  }

  /**
   * おもちゃの種類からファクトリメソッドを呼び出し
   */
  static create(type: ToyType, x: number, y: number): Toy {
    switch (type) {
      case 'ball':
        return Toy.createBall(x, y);
      case 'feather':
        return Toy.createFeather(x, y);
      case 'mouse':
        return Toy.createMouse(x, y);
      case 'laser':
        return Toy.createLaser(x, y);
      default:
        return new Toy(type, x, y);
    }
  }
}