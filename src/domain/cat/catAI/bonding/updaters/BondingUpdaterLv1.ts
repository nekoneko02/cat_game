import { BondingUpdater } from '../BondingUpdater';
import type { BondingLevel } from '../BondingLevel';
import { BondingGauge } from '../BondingGauge';
import { GlobalRegistry } from '../../../../global/GlobalRegistry';

/**
 * なつき度更新レベル1
 *
 * 時間経過ロジック: 60秒でゲージ0→1（Lv2へ移行可能）
 *
 * @package ねこ.ねこAI.なつき.なつき度更新.なつき度更新毎
 */
export class BondingUpdaterLv1 extends BondingUpdater {
  private lastUpdatedAtMs: number;
  private currentGaugeValue: number;

  constructor(initialGauge: number, currentTimeMs: number) {
    super();
    this.currentGaugeValue = initialGauge;
    this.lastUpdatedAtMs = currentTimeMs;
  }

  updateByTime(_level: BondingLevel, _gauge: BondingGauge): BondingGauge {
    const currentTimeMs = GlobalRegistry.getInstance()
      .getGameTimeManager()
      .getGameTime();

    const elapsedTimeSec = (currentTimeMs - this.lastUpdatedAtMs) / 1000;

    const increment = elapsedTimeSec / 60;
    const newGaugeValue = Math.min(this.currentGaugeValue + increment, 1);

    this.currentGaugeValue = newGaugeValue;
    this.lastUpdatedAtMs = currentTimeMs;

    return new BondingGauge(newGaugeValue);
  }
}
