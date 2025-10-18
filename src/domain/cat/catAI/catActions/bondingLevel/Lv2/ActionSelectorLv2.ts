
import { IActionSelector } from '../IActionSelector';
import { ActionContext } from '../../ActionContext';
import { CatActionExecutor } from '../../CatActionExecutor';
import { RunAwayAction } from '../../RunAwayAction';
import { RunAwayShortAction } from '../../RunAwayShortAction';
import { WatchCautiouslyAction } from '../../WatchCautiouslyAction';
import actionConfig from '../../../../../global/config/actionConfig.json';

/**
 * なつき度Lv.2用のアクション選択クラス
 * Lv.2: 少し近づく素振りを見せる。こちらの動きに敏感で、すぐ逃げる
 * - 隅っこに逃げる: 50% × 5秒
 * - 少し離れたところに逃げる: 40% × 5秒
 * - 警戒しながら様子を見る: 10% × 2秒
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly runAwayAction: CatActionExecutor;
  private readonly runAwayShortAction: CatActionExecutor;
  private readonly watchCautiouslyAction: CatActionExecutor;
  private actionConfigs: Record<string, { duration: number }>;

  constructor() {
    this.runAwayAction = new RunAwayAction();
    this.runAwayShortAction = new RunAwayShortAction();
    this.watchCautiouslyAction = new WatchCautiouslyAction();
    this.actionConfigs = actionConfig.stepOneActions as Record<string, { duration: number }>;
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   */
  select(_context: ActionContext): CatActionExecutor {
    const random = Math.random();

    if (random < 0.5) {
      return this.runAwayAction;
    } else if (random < 0.9) {
      return this.runAwayShortAction;
    } else {
      return this.watchCautiouslyAction;
    }
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.actionConfigs[actionName];
  }
}
