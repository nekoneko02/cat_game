import { BondingUpdater } from '../BondingUpdater';
import type { BondingLevel } from '../BondingLevel';
import { BondingGauge } from '../BondingGauge';
import type { BondingUpdateNotification } from '../BondingUpdateNotification';
import { GlobalRegistry } from '../../../../global/GlobalRegistry';

/**
 * なつき度更新レベル3
 *
 * 時間経過ロジック: おもちゃを見た回数に応じてゲージ上限が上昇
 * - ゲージ上限 = (watchToyActionCount + 1) / 4
 * - 45秒で0.25増加（180秒で1.0）
 * - ゲージは時間経過で自動上昇、watchToyは上限値のみ変更
 *
 * @package ねこ.ねこAI.なつき.なつき度更新.なつき度更新毎
 */
export class BondingUpdaterLv3 extends BondingUpdater {
  private lastUpdatedAtMs: number;
  private currentGaugeValue: number;
  private watchToyActionCount: number = 0;

  constructor(initialGauge: number, currentTimeMs: number) {
    super();
    this.currentGaugeValue = initialGauge;
    this.lastUpdatedAtMs = currentTimeMs;
  }

  update(
    level: BondingLevel,
    gauge: BondingGauge,
    notification: BondingUpdateNotification
  ): BondingGauge {
    if (notification.getActionName() === 'watchToy') {
      this.watchToyActionCount++;
    }

    return gauge;
  }

  updateByTime(_level: BondingLevel, _gauge: BondingGauge): BondingGauge {
    const currentTimeMs = GlobalRegistry.getInstance()
      .getGameTimeManager()
      .getGameTime();

    const elapsedTimeSec = (currentTimeMs - this.lastUpdatedAtMs) / 1000;

    const gaugeCap = Math.min((this.watchToyActionCount + 1) / 4, 1.0);

    const increment = (elapsedTimeSec / 45) * 0.25;
    const newGaugeValue = Math.min(this.currentGaugeValue + increment, gaugeCap);

    this.currentGaugeValue = newGaugeValue;
    this.lastUpdatedAtMs = currentTimeMs;

    return new BondingGauge(newGaugeValue);
  }
}
