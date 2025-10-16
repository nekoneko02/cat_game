import type { IBondingView } from './IBondingView';

/**
 * なつき度インターフェース
 *
 * なつき度の更新可能な操作を定義するインターフェース。
 * IBondingViewを拡張し、読み取り専用操作に加えて更新操作を提供する。
 *
 * @package ねこ.ねこAI.なつき
 */
export interface IBonding extends IBondingView {
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
  updateBonding(change: number): IBonding;

  /**
   * 時間経過によるなつき度の自動更新
   *
   * ゲーム内時間の経過に応じてなつき度を更新する。
   *
   * @returns 更新後の新しいなつき度インスタンス
   */
  updateByTime?(): IBonding;
}
