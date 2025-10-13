import { Bonding } from '../../bonding/Bonding';
import { ExternalState } from '../../../../gameLogic/environment/ExternalState';
import { CatActionExecutor } from '../CatActionExecutor';

/**
 * ねこアクション選択インターフェース
 * なつき度レベル毎のActionSelectorが実装する共通インターフェース
 */
export interface IActionSelector {
  /**
   * なつき度と外部状態に基づいてアクションを選択
   * クラス図: ねこアクション選択LvN --* ねこアクション実行（集約）
   * @param bonding なつき度
   * @param externalState 外部状態
   * @returns 選択されたアクション実行インスタンス
   */
  select(bonding: Bonding, externalState: ExternalState): CatActionExecutor;

  /**
   * アクション設定を取得（実行時間など）
   * @param actionName アクション名
   */
  getActionConfig(actionName: string): { duration?: number } | undefined;
}
