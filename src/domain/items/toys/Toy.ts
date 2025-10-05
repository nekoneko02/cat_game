
// ToyType removed - using asset keys directly

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
    public readonly key: string, // アセットキー (例: 'toy_ball')
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
    return {
      movementType: 'normal',
      preferredSpeed: 0.5,
      attractiveness: this.attractiveness, // コンストラクタの値を使用
      color: 0xff6b6b // デフォルト色
    };
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
      this.key,
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
      this.key,
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
      this.key,
      newX,
      newY,
      this.attractiveness
    ).withState(newState);
  }

  /**
   * ねこにとっての興味度を計算
   * 距離と動きを考慮（好み判定は削除）
   */
  calculateInterestLevel(catX: number, catY: number): number {
    // 距離による減衰
    const distance = Math.sqrt((this.x - catX) ** 2 + (this.y - catY) ** 2);
    const distanceFactor = Math.max(0, 1 - (distance / 300)); // 300px以内で有効

    // 動きによる補正
    const movementBonus = this.state.isMoving ? 1.3 : 1.0;

    // 基本魅力度
    const baseAttractiveness = this.getCharacteristics().attractiveness;

    return baseAttractiveness * movementBonus * distanceFactor;
  }

  /**
   * おもちゃがねこの注意を引くかどうか
   */
  shouldAttractCat(catX: number, catY: number, threshold: number = 0.5): boolean {
    return this.calculateInterestLevel(catX, catY) > threshold;
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
    const toy = new Toy(this.key, this.x, this.y, this.attractiveness);
    toy.state = newState;
    return toy;
  }

  /**
   * アセットキーからおもちゃを作成
   */
  static create(key: string, x: number, y: number): Toy {
    // デフォルトの魅力度（将来的にはアセット設定から取得可能）
    const attractiveness = 1.0;
    return new Toy(key, x, y, attractiveness);
  }
}