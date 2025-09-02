/**
 * CatAction.executeメソッドの入力パラメータを管理するクラス
 */
export class ActionContext {
  public readonly currentX: number;
  public readonly currentY: number;
  public readonly toyX?: number;
  public readonly toyY?: number;

  constructor(currentX: number, currentY: number, toyX?: number, toyY?: number) {
    this.currentX = currentX;
    this.currentY = currentY;
    this.toyX = toyX;
    this.toyY = toyY;
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
   * 特定の座標への移動差分を計算
   */
  getMovementDeltaTo(targetX: number, targetY: number): { deltaX: number; deltaY: number } {
    return {
      deltaX: targetX - this.currentX,
      deltaY: targetY - this.currentY
    };
  }

  /**
   * 静的ファクトリーメソッド: おもちゃなしのコンテキスト
   */
  static withoutToy(currentX: number, currentY: number): ActionContext {
    return new ActionContext(currentX, currentY);
  }

  /**
   * 静的ファクトリーメソッド: おもちゃありのコンテキスト
   */
  static withToy(currentX: number, currentY: number, toyX: number, toyY: number): ActionContext {
    return new ActionContext(currentX, currentY, toyX, toyY);
  }
}