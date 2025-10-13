/**
 * ねこの位置を表すValue Object
 * クラス図の「ねこ外部状態.ねこ位置」に対応
 */
export class CatPosition {
  constructor(
    public readonly x: number,
    public readonly y: number
  ) {}

  /**
   * 位置を移動した新しいインスタンスを返す
   * @param deltaX X軸の移動量
   * @param deltaY Y軸の移動量
   * @param gameWidth ゲーム画面の幅（省略時は境界制御なし）
   * @param gameHeight ゲーム画面の高さ（省略時は境界制御なし）
   * @param margin 画面端からのマージン（省略時は境界制御なし）
   */
  move(
    deltaX: number,
    deltaY: number,
    gameWidth?: number,
    gameHeight?: number,
    margin?: number
  ): CatPosition {
    let newX = this.x + deltaX;
    let newY = this.y + deltaY;

    // 境界制御が有効な場合のみクランプ
    if (gameWidth !== undefined && gameHeight !== undefined && margin !== undefined) {
      const minX = margin;
      const maxX = gameWidth - margin;
      const minY = margin;
      const maxY = gameHeight - margin;

      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
    }

    return new CatPosition(newX, newY);
  }

  /**
   * デフォルト位置を作成（画面中央想定）
   */
  static createDefault(): CatPosition {
    return new CatPosition(400, 300);
  }

  /**
   * 指定座標の位置を作成
   */
  static create(x: number, y: number): CatPosition {
    return new CatPosition(x, y);
  }
}
