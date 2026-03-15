import type { IBondingUpdater } from './IBondingUpdater';
import type { BondingLevel } from './BondingLevel';
import type { BondingGauge } from './BondingGauge';
import type { BondingUpdateNotification } from './BondingUpdateNotification';

/**
 * なつき度更新抽象クラス
 *
 * なつき度レベル毎の更新ロジックを実装する基底クラス
 * レベル別の具象クラス（BondingUpdaterLv0~BondingUpdaterLv10）で継承される
 *
 * @package ねこ.ねこAI.なつき.なつき度更新
 */
export abstract class BondingUpdater implements IBondingUpdater {
  /**
   * @package コンストラクタは外部非公開（package private）
   * @internal 具象クラスからのみ呼び出されるべき
   */
  protected constructor() {}

  /**
   * アクション実行によるなつき度ゲージ更新
   *
   * デフォルト実装: ゲージを変更せずそのまま返す
   * 各レベルの具象クラスでオーバーライド可能
   */
  update(
    level: BondingLevel,
    gauge: BondingGauge,
    notification: BondingUpdateNotification
  ): BondingGauge {
    // デフォルト実装: 何もしない
    return gauge;
  }

  /**
   * 時間経過によるなつき度ゲージ更新
   *
   * デフォルト実装: ゲージを変更せずそのまま返す
   * 各レベルの具象クラスでオーバーライド可能
   */
  updateByTime(level: BondingLevel, gauge: BondingGauge): BondingGauge {
    // デフォルト実装: 何もしない
    return gauge;
  }
}
