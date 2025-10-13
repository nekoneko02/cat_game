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
   * なつき度レベル (0~10の整数)
   */
  private readonly level: number;

  /**
   * なつきゲージ値 (0~1の実数)
   * 次のレベルまでの進捗を表す
   */
  private readonly gauge: number;

  /**
   * コンストラクタ
   * @param level なつき度レベル (0~10)
   * @param gauge なつきゲージ値 (0~1)
   * @throws {Error} レベルまたはゲージ値が範囲外の場合
   */
  constructor(level: number, gauge: number) {
    if (level < 0 || level > 10) {
      throw new Error(`Bonding level must be between 0 and 10, got ${level}`);
    }
    if (gauge < 0 || gauge > 1) {
      throw new Error(`Bonding gauge must be between 0 and 1, got ${gauge}`);
    }
    this.level = Math.floor(level);
    this.gauge = gauge;
  }

  /**
   * なつきレベルを取得
   * @returns なつきレベル (0~10)
   */
  getLevel(): number {
    return this.level;
  }

  /**
   * なつきゲージ値を取得
   * @returns なつきゲージ値 (0~1)
   */
  getGauge(): number {
    return this.gauge;
  }

  /**
   * なつき度を更新
   *
   * 現在のなつき度に変化量を適用した新しいインスタンスを返す。
   * ゲージが1以上になるとレベルアップし、ゲージは0にリセットされる。
   * ゲージが0未満になるとレベルダウンし、ゲージは1からの相対値になる。
   *
   * @param change ゲージの変化量（1秒あたりの変化量として設計）
   * @returns 更新後の新しいなつき度インスタンス
   */
  updateBonding(change: number): Bonding {
    let newGauge = this.gauge + change;
    let newLevel = this.level;

    // レベルアップ処理
    while (newGauge >= 1.0 && newLevel < 10) {
      newGauge -= 1.0;
      newLevel += 1;
    }

    // レベルダウン処理
    while (newGauge < 0 && newLevel > 0) {
      newGauge += 1.0;
      newLevel -= 1;
    }

    // 範囲クランプ
    newGauge = Math.max(0, Math.min(1, newGauge));
    newLevel = Math.max(0, Math.min(10, newLevel));

    return new Bonding(newLevel, newGauge);
  }

  /**
   * デフォルトのなつき度を作成
   *
   * 初期状態（レベル0、ゲージ0）のなつき度を生成する。
   *
   * @returns レベル0、ゲージ0のなつき度インスタンス
   */
  static createDefault(): Bonding {
    return new Bonding(0, 0);
  }
}
