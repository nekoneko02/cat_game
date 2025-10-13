import { Bonding } from '../../../bonding/Bonding';
import { ExternalState } from '../../../../../gameLogic/environment/ExternalState';
import { IActionSelector } from '../IActionSelector';
import { CatActionExecutor } from '../../CatActionExecutor';
import { RunAwayShortAction } from '../../RunAwayShortAction';
import { WatchCautiouslyAction } from '../../WatchCautiouslyAction';
import { WatchWithTailWagAction } from '../../WatchWithTailWagAction';
import { WatchToyAction } from '../../WatchToyAction';
import actionConfig from '../../../../../global/config/actionConfig.json';

/**
 * なつき度Lv.3用のアクション選択クラス
 * Lv.3: 近くで休むが触れない。遠くで尾をゆらす。警戒してこちらを観察する。おもちゃに少し興味を示す。
 * - 少し離れたところに逃げる: 45% × 5秒
 * - 警戒しながら様子を見る: 45% × 3秒
 * - しっぽを揺らしながら、様子を見る: 10% × 2秒
 * - おもちゃに興味を持つ（見るだけ）: +10% × 3秒（おもちゃがあるときのみ）
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly runAwayShortAction: CatActionExecutor;
  private readonly watchCautiouslyAction: CatActionExecutor;
  private readonly watchWithTailWagAction: CatActionExecutor;
  private readonly watchToyAction: CatActionExecutor;
  private actionConfigs: Record<string, { duration: number }>;

  constructor() {
    this.runAwayShortAction = new RunAwayShortAction();
    this.watchCautiouslyAction = new WatchCautiouslyAction();
    this.watchWithTailWagAction = new WatchWithTailWagAction();
    this.watchToyAction = new WatchToyAction();
    this.actionConfigs = actionConfig.stepOneActions as Record<string, { duration: number }>;
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   */
  select(_bonding: Bonding, externalState: ExternalState): CatActionExecutor {
    const hasToy = externalState.toyPresence;
    let random = Math.random();

    if (hasToy) {
      if (random < 0.1) {
        return this.watchToyAction;
      }
      random = (random - 0.1) / 0.9;
    }

    if (random < 0.45) {
      return this.runAwayShortAction;
    } else if (random < 0.9) {
      return this.watchCautiouslyAction;
    } else {
      return this.watchWithTailWagAction;
    }
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.actionConfigs[actionName];
  }
}
