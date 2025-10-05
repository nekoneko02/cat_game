import type { IBondingView } from './IBondingView';

/**
 * なつき度クラス
 *
 * 猫とユーザーの親密度を表す値オブジェクト。
 * 不変オブジェクトとして実装され、更新時は新しいインスタンスを返す。
 *
 * @package ねこ.ねこAI.なつき
 */
export class Bonding implements IBondingView {
  /**
   * なつきゲージ値 (-1~1)
   * - -1: 完全に警戒している状態
   * -  0: 中立
   * -  1: 完全になついている状態
   */
  private readonly gauge: number;

  /**
   * コンストラクタ
   * @param gauge なつきゲージ値 (-1~1)
   * @throws {Error} ゲージ値が範囲外の場合
   */
  constructor(gauge: number) {
    if (gauge < -1 || gauge > 1) {
      throw new Error(`Bonding gauge must be between -1 and 1, got ${gauge}`);
    }
    this.gauge = gauge;
  }

  /**
   * なつきレベルを取得
   *
   * ゲージ値 (-1~1) を 0~10 のレベルに変換する。
   * - ゲージ -1.0 → レベル 0
   * - ゲージ  0.0 → レベル 5
   * - ゲージ  1.0 → レベル 10
   *
   * @returns なつきレベル (0~10)
   */
  getLevel(): number {
    const scaledValue = (this.gauge + 1) * 5;
    return Math.floor(Math.max(0, Math.min(10, scaledValue)));
  }

  /**
   * なつきゲージ値を取得
   * @returns なつきゲージ値 (-1~1)
   */
  getGauge(): number {
    return this.gauge;
  }

  /**
   * なつき度を更新
   *
   * 現在のなつき度に変化量を適用した新しいインスタンスを返す。
   * 値は -1~1 の範囲にクランプされる。
   *
   * @param change 変化量（1秒あたりの変化量として設計）
   * @returns 更新後の新しいなつき度インスタンス
   */
  updateBonding(change: number): Bonding {
    const newGauge = Math.max(-1, Math.min(1, this.gauge + change));
    return new Bonding(newGauge);
  }

  /**
   * デフォルトのなつき度を作成
   *
   * 初期状態（完全に警戒している）のなつき度を生成する。
   *
   * @returns ゲージ値 -1 のなつき度インスタンス
   */
  static createDefault(): Bonding {
    return new Bonding(-1);
  }
}
