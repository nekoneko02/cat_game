import { CatActionExecutor } from '../CatActionExecutor';
import { ActionContext } from '../ActionContext';

/**
 * ねこアクション選択インターフェース
 * なつき度レベル毎のActionSelectorが実装する共通インターフェース
 */
export interface IActionSelector {
  /**
   * アクションコンテキストに基づいてアクションを選択
   * クラス図: ねこアクション選択LvN --* ねこアクション実行（集約）
   *
   * 注: なつき度は不要。ActionSelectorは既にBondingLevel毎に分離されている
   * @param context アクションコンテキスト（座標・外部状態を統合）
   * @returns 選択されたアクション実行インスタンス
   */
  select(context: ActionContext): CatActionExecutor;

  /**
   * アクション設定を取得（実行時間など）
   * @param actionName アクション名
   */
  getActionConfig(actionName: string): { duration?: number } | undefined;
}
