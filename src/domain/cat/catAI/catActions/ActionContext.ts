/**
 * CatAction.executeメソッドの入力パラメータを管理するクラス
 */
export class ActionContext {
  public readonly currentX: number;
  public readonly currentY: number;
  public readonly toyX?: number;
  public readonly toyY?: number;
  public readonly flipX: boolean;

  constructor(currentX: number, currentY: number, toyX?: number, toyY?: number, flipX: boolean = false) {
    this.currentX = currentX;
    this.currentY = currentY;
    this.toyX = toyX;
    this.toyY = toyY;
    this.flipX = flipX;
  }

  /**
   * おもちゃが存在するかチェック
   */
  hasToy(): boolean {
    return this.toyX !== undefined && this.toyY !== undefined;
  }

  /**
   * おもちゃとの距離を計算
   */
  getToyDistance(): number {
    if (!this.hasToy()) {
      return Number.MAX_VALUE;
    }
    const dx = this.toyX! - this.currentX;
    const dy = this.toyY! - this.currentY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * おもちゃへの移動差分を取得
   */
  getToyMovementDelta(): { deltaX: number; deltaY: number } | null {
    if (!this.hasToy()) {
      return null;
    }
    return {
      deltaX: this.toyX! - this.currentX,
      deltaY: this.toyY! - this.currentY
    };
  }

  /**
   * おもちゃへの正規化された方向ベクトルを取得
   * 移動速度の計算に使用する（1秒あたりの移動量を定義するため）
   *
   * @returns 正規化された方向ベクトル { x: -1~1, y: -1~1 } または null
   */
  getToyDirection(): { x: number; y: number } | null {
    if (!this.hasToy()) {
      return null;
    }
    const dx = this.toyX! - this.currentX;
    const dy = this.toyY! - this.currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      return { x: 0, y: 0 };
    }

    return {
      x: dx / distance,
      y: dy / distance
    };
  }

  /**
   * 特定の座標への移動差分を計算
   */
  getMovementDeltaTo(targetX: number, targetY: number): { deltaX: number; deltaY: number } {
    return {
      deltaX: targetX - this.currentX,
      deltaY: targetY - this.currentY
    };
  }

  /**
   * おもちゃが画面上側にあるか（ねこより上にあるか）
   */
  isToyAboveCatOnScreen(): boolean {
    if (!this.hasToy()) {
      return false;
    }
    return this.toyY! < this.currentY;
  }

  /**
   * おもちゃが画面下側にあるか（ねこより下にあるか）
   */
  isToyBelowCatOnScreen(): boolean {
    if (!this.hasToy()) {
      return false;
    }
    return this.toyY! > this.currentY;
  }

  /**
   * おもちゃが画面右側にあるか（ねこより右にあるか）
   */
  isToyRightOfCatOnScreen(): boolean {
    if (!this.hasToy()) {
      return false;
    }
    return this.toyX! > this.currentX;
  }

  /**
   * おもちゃが画面左側にあるか（ねこより左にあるか）
   */
  isToyLeftOfCatOnScreen(): boolean {
    if (!this.hasToy()) {
      return false;
    }
    return this.toyX! < this.currentX;
  }

  /**
   * 静的ファクトリーメソッド: おもちゃなしのコンテキスト
   */
  static withoutToy(currentX: number, currentY: number, flipX: boolean = false): ActionContext {
    return new ActionContext(currentX, currentY, undefined, undefined, flipX);
  }

  /**
   * 静的ファクトリーメソッド: おもちゃありのコンテキスト
   */
  static withToy(currentX: number, currentY: number, toyX: number, toyY: number, flipX: boolean = false): ActionContext {
    return new ActionContext(currentX, currentY, toyX, toyY, flipX);
  }
}