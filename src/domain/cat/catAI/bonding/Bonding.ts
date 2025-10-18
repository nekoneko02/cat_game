import type { IBondingView } from './IBondingView';
import { BondingLevel } from './BondingLevel';
import { BondingGauge } from './BondingGauge';
import type { IBondingUpdater } from './IBondingUpdater';
import type { BondingUpdateNotification } from './BondingUpdateNotification';
import { BondingUpdaterFactory } from './BondingUpdaterFactory';

/**
 * なつき度（境界オブジェクト）
 *
 * 猫とユーザーの親密度を表すドメインオブジェクト
 * なつきLv、なつきゲージ、なつき度更新を保持し、
 * 外部からのなつき度更新リクエストを受け付ける
 *
 * @package ねこ.ねこAI.なつき
 */
export class Bonding implements IBondingView {
  private level: BondingLevel;
  private gauge: BondingGauge;
  private updater: IBondingUpdater;

  /**
   * @package コンストラクタは外部非公開（package private）
   * @internal ファクトリメソッドまたはリポジトリからのみ生成されるべき
   */
  constructor(level: number, gauge: number) {
    this.level = new BondingLevel(level);
    this.gauge = new BondingGauge(gauge);
    this.updater = BondingUpdaterFactory.getUpdater(level, gauge);
  }

  /**
   * なつきレベルを取得
   */
  getLevel(): number {
    return this.level.getValue();
  }

  /**
   * なつきゲージ値を取得
   */
  getGauge(): number {
    return this.gauge.getValue();
  }

  /**
   * アクション実行によるなつき度更新
   *
   * @param notification なつき度更新通知
   */
  update(notification: BondingUpdateNotification): void {
    this.gauge = this.updater.update(this.level, this.gauge, notification);
  }

  /**
   * 時間経過によるなつき度更新（ゲージのみ更新）
   *
   * CatAIから呼び出され、ゲージが1.0に達した場合は
   * CatAIがlevelUp()を呼び出す
   */
  updateByTime(): void {
    this.gauge = this.updater.updateByTime(this.level, this.gauge);
  }

  /**
   * レベルアップ処理
   *
   * レベルを1つ上げ、ゲージを0にリセットし、
   * 新しいレベルに対応するBondingUpdaterを取得する
   */
  levelUp(): void {
    this.level = this.level.levelUp();
    this.gauge = BondingGauge.reset();
    this.updater = BondingUpdaterFactory.getUpdater(this.level.getValue(), 0);
  }

  /**
   * ゲージが満タンか判定
   *
   * CatAIがレベルアップ判定に使用
   */
  isGaugeFull(): boolean {
    return this.gauge.isFull();
  }

  /**
   * デバッグ用: なつき度レベルを直接設定
   * @internal デバッグ専用
   * @param targetLevel - 設定するなつき度レベル（0-10）
   */
  debugSetLevel(targetLevel: number): void {
    this.level = new BondingLevel(targetLevel);
    this.gauge = BondingGauge.reset();
    this.updater = BondingUpdaterFactory.getUpdater(targetLevel, 0);
  }
}
