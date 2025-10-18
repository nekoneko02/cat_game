import type { IBondingUpdater } from './IBondingUpdater';
import { BondingUpdaterLv0 } from './updaters/BondingUpdaterLv0';
import { BondingUpdaterLv1 } from './updaters/BondingUpdaterLv1';
import { BondingUpdaterLv2 } from './updaters/BondingUpdaterLv2';
import { BondingUpdaterLv3 } from './updaters/BondingUpdaterLv3';
import { BondingUpdaterLv4 } from './updaters/BondingUpdaterLv4';
import { GlobalRegistry } from '../../../global/GlobalRegistry';

/**
 * なつき度更新Factory
 *
 * なつき度レベルに応じた適切なBondingUpdater具象クラスを生成する
 *
 * @package ねこ.ねこAI.なつき
 */
export class BondingUpdaterFactory {
  /**
   * 指定されたレベルに対応するBondingUpdaterを取得
   *
   * @param level なつき度レベル (0~10)
   * @returns レベルに対応するBondingUpdater
   */
  static getUpdater(level: number, initialGauge: number = 0): IBondingUpdater {
    const currentTimeMs = GlobalRegistry.getInstance()
      .getGameTimeManager()
      .getGameTime();

    switch (level) {
      case 0:
        return new BondingUpdaterLv0();
      case 1:
        return new BondingUpdaterLv1(initialGauge, currentTimeMs);
      case 2:
        return new BondingUpdaterLv2(initialGauge, currentTimeMs);
      case 3:
        return new BondingUpdaterLv3(initialGauge, currentTimeMs);
      case 4:
        return new BondingUpdaterLv4(initialGauge, currentTimeMs);
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        // TODO: Lv5以降の具象クラスを実装
        return new BondingUpdaterLv0();
      default:
        throw new Error(
          `Invalid bonding level: ${level}. Must be between 0 and 10.`
        );
    }
  }
}
