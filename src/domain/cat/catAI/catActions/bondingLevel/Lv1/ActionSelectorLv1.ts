
import { IActionSelector } from '../IActionSelector';
import { ActionContext } from '../../ActionContext';
import { CatActionExecutor } from '../../CatActionExecutor';
import { RunAwayAction } from '../../RunAwayAction';
import actionConfig from '../../../../../global/config/actionConfig.json';

/**
 * なつき度Lv.1用のアクション選択クラス
 * Lv.1: 完全に警戒、近づかない、隅で耳を動かす
 * - 隅っこに逃げる: 100% × 5秒
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly runAwayAction: CatActionExecutor;
  private actionConfigs: Record<string, { duration: number }>;

  constructor() {
    this.runAwayAction = new RunAwayAction();
    this.actionConfigs = actionConfig.stepOneActions as Record<string, { duration: number }>;
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   * Lv.1では常にrunAwayActionを返す
   */
  select(_context: ActionContext): CatActionExecutor {
    return this.runAwayAction;
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.actionConfigs[actionName];
  }
}
