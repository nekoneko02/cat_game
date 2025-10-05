import { Bonding } from '../../bonding/Bonding';
import { ExternalState } from '../../../../gameLogic/environment/ExternalState';

/**
 * ねこアクション選択インターフェース
 * なつき度レベル毎のActionSelectorが実装する共通インターフェース
 */
export interface IActionSelector {
  /**
   * なつき度と外部状態に基づいてアクションを選択
   * @param bonding なつき度
   * @param externalState 外部状態
   * @returns 選択されたアクション名
   */
  select(bonding: Bonding, externalState: ExternalState): string;

  /**
   * アクション設定を取得（実行時間など）
   * @param actionName アクション名
   */
  getActionConfig(actionName: string): { duration?: number } | undefined;
}
