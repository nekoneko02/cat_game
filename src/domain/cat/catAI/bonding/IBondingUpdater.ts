import type { BondingLevel } from './BondingLevel';
import type { BondingGauge } from './BondingGauge';
import type { BondingUpdateNotification } from './BondingUpdateNotification';

/**
 * なつき度更新インターフェース
 *
 * なつき度レベル毎の更新ロジックを定義するインターフェース
 * 各レベルの具象クラス（BondingUpdaterLv0~Lv10）で実装される
 *
 * @package ねこ.ねこAI.なつき.なつき度更新
 */
export interface IBondingUpdater {
  /**
   * アクション実行によるなつき度ゲージ更新
   *
   * @param level 現在のなつきLv
   * @param gauge 現在のなつきゲージ
   * @param notification なつき度更新通知（実行されたアクション情報）
   * @returns 更新後のなつきゲージ（最大1.0）
   */
  update(
    level: BondingLevel,
    gauge: BondingGauge,
    notification: BondingUpdateNotification
  ): BondingGauge;

  /**
   * 時間経過によるなつき度ゲージ更新
   *
   * @param level 現在のなつきLv
   * @param gauge 現在のなつきゲージ
   * @returns 更新後のなつきゲージ（最大1.0）
   */
  updateByTime(level: BondingLevel, gauge: BondingGauge): BondingGauge;
}
