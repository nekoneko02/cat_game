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
   */
  move(deltaX: number, deltaY: number): CatPosition {
    return new CatPosition(this.x + deltaX, this.y + deltaY);
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
