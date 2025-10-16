import { Bonding } from './Bonding';
import { BondingLv0 } from './levels/BondingLv0';
import { BondingLv1 } from './levels/BondingLv1';
import { BondingLv2 } from './levels/BondingLv2';
import { BondingLv3 } from './levels/BondingLv3';
import { BondingLv4 } from './levels/BondingLv4';
import { BondingLv5 } from './levels/BondingLv5';
import { BondingLv6 } from './levels/BondingLv6';
import { BondingLv7 } from './levels/BondingLv7';
import { BondingLv8 } from './levels/BondingLv8';
import { BondingLv9 } from './levels/BondingLv9';
import { BondingLv10 } from './levels/BondingLv10';

/**
 * なつき度Factory
 *
 * なつき度レベルに応じた具象Bondingクラスを生成するFactoryクラス。
 * シーケンス図の設計に基づき、レベル別の具象クラスをインスタンス化する。
 *
 * @package ねこ.ねこAI.なつき
 */
export class BondingFactory {
  /**
   * なつき度コンテキストからなつき度インスタンスを生成
   *
   * @param context なつき度の初期化情報 {level: 0~10, gauge: 0~1}
   * @returns なつき度レベルに応じた具象Bondingインスタンス
   * @throws {Error} レベルまたはゲージ値が範囲外の場合
   */
  static getBonding(context: { level: number; gauge: number }): Bonding {
    const { level, gauge } = context;

    switch (level) {
      case 0:
        return new BondingLv0(gauge);
      case 1:
        return new BondingLv1(gauge);
      case 2:
        return new BondingLv2(gauge);
      case 3:
        return new BondingLv3(gauge);
      case 4:
        return new BondingLv4(gauge);
      case 5:
        return new BondingLv5(gauge);
      case 6:
        return new BondingLv6(gauge);
      case 7:
        return new BondingLv7(gauge);
      case 8:
        return new BondingLv8(gauge);
      case 9:
        return new BondingLv9(gauge);
      case 10:
        return new BondingLv10(gauge);
      default:
        throw new Error(`Invalid bonding level: ${level}. Level must be between 0 and 10.`);
    }
  }

  /**
   * デフォルトのなつき度を作成
   *
   * 初期状態（レベル0、ゲージ0）のなつき度を生成する。
   *
   * @returns レベル0、ゲージ0のなつき度インスタンス
   */
  static createDefault(): Bonding {
    return new BondingLv0(0);
  }
}
