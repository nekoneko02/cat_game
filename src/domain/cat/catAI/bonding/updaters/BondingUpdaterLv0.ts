import { BondingUpdater } from '../BondingUpdater';

/**
 * なつき度更新レベル0
 *
 * 初期状態、時間経過による更新なし
 *
 * @package ねこ.ねこAI.なつき.なつき度更新.なつき度更新毎
 */
export class BondingUpdaterLv0 extends BondingUpdater {
  /**
   * @package コンストラクタは外部非公開（package private）
   * @internal BondingUpdaterFactoryからのみ生成されるべき
   */
  constructor() {
    super();
  }

  // デフォルト実装を使用（何もしない）
}
