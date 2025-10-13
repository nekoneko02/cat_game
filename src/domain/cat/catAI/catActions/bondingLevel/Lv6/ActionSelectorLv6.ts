import { Bonding } from '../../../bonding/Bonding';
import { ExternalState } from '../../../../../gameLogic/environment/ExternalState';
import { ActionProbabilityCalculator } from '../../../../../global/config/ActionProbabilityCalculator';
import { IActionSelector } from '../IActionSelector';
import { CatActionExecutor } from '../../CatActionExecutor';
import { RunAwayAction } from '../../RunAwayAction';
import { SitAction } from '../../SitAction';
import { ShowBellyAction } from '../../ShowBellyAction';
import { PlayWithToyAction } from '../../PlayWithToyAction';

/**
 * ねこアクション選択 (クラス図の「ねこアクション選択」に対応)
 * なつき度に基づいて適切なアクションを選択する
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly calculator: ActionProbabilityCalculator;
  private readonly runAwayAction: CatActionExecutor;
  private readonly sitAction: CatActionExecutor;
  private readonly showBellyAction: CatActionExecutor;
  private readonly playWithToyAction: CatActionExecutor;
  private readonly actionMap: Map<string, CatActionExecutor>;

  constructor() {
    this.calculator = new ActionProbabilityCalculator();
    this.runAwayAction = new RunAwayAction();
    this.sitAction = new SitAction();
    this.showBellyAction = new ShowBellyAction();
    this.playWithToyAction = new PlayWithToyAction();

    this.actionMap = new Map([
      ['runAway', this.runAwayAction],
      ['sit', this.sitAction],
      ['showBelly', this.showBellyAction],
      ['playWithToy', this.playWithToyAction]
    ]);
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   * @param bonding なつき度
   * @param externalState 外部状態
   * @returns 選択されたアクション実行インスタンス
   */
  select(bonding: Bonding, externalState: ExternalState): CatActionExecutor {
    const probabilities = this.calculator.calculateActionProbabilities(
      bonding,
      externalState
    );
    const actionName = this.calculator.selectAction(probabilities);
    return this.actionMap.get(actionName) || this.sitAction;
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.calculator.getActionConfig(actionName);
  }
}
