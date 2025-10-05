import { Bonding } from '../../../bonding/Bonding';
import { ExternalState } from '../../../../../gameLogic/environment/ExternalState';
import { ActionProbabilityCalculator } from '../../../../../global/config/ActionProbabilityCalculator';
import { IActionSelector } from '../IActionSelector';

/**
 * ねこアクション選択 (クラス図の「ねこアクション選択」に対応)
 * なつき度に基づいて適切なアクションを選択する
 *
 * @package ねこ.ねこAI.ねこアクション
 */
export class ActionSelector implements IActionSelector {
  private readonly calculator: ActionProbabilityCalculator;

  constructor() {
    this.calculator = new ActionProbabilityCalculator();
  }

  /**
   * なつき度と外部状態に基づいてアクションを選択
   * @param bonding なつき度
   * @param externalState 外部状態
   * @returns 選択されたアクション名
   */
  select(bonding: Bonding, externalState: ExternalState): string {
    const probabilities = this.calculator.calculateActionProbabilities(
      bonding,
      externalState
    );
    return this.calculator.selectAction(probabilities);
  }

  /**
   * アクション設定を取得（実行時間など）
   */
  getActionConfig(actionName: string) {
    return this.calculator.getActionConfig(actionName);
  }
}
