/**
 * 移動速度クラス（ゲームロジックpackage）
 *
 * 1秒あたりの移動速度を管理し、1フレームあたりの移動量を計算する。
 * DEVELOPMENT_GUIDELINES.mdの「ステップ数の考え方」に基づき、
 * FPS非依存の設計を実現する。
 */
export class MovementSpeed {
  private readonly speedPerSecond: number;

  /**
   * @param speedPerSecond 1秒あたりの移動速度（ピクセル/秒）
   */
  constructor(speedPerSecond: number) {
    this.speedPerSecond = speedPerSecond;
  }

  /**
   * 1フレームあたりの移動量を計算
   *
   * @param fps フレームレート（例: 60）
   * @returns 1フレームあたりの移動量（ピクセル）
   */
  getSpeedPerFrame(fps: number): number {
    if (fps <= 0) {
      throw new Error('FPS must be greater than 0');
    }
    return this.speedPerSecond / fps;
  }

  /**
   * 1秒あたりの移動速度を取得
   */
  getSpeedPerSecond(): number {
    return this.speedPerSecond;
  }
}
