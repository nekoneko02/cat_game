import { ActionContext } from './ActionContext';
import { CatActionExecutor } from './CatActionExecutor';

/**
 * ねこアクションインターフェース
 * クラス図における「ねこアクション」に対応
 * なつき度毎にアクションをグルーピングするための基本インターフェース
 */
export interface CatAction {
  /**
   * アクションを実行
   * @param context アクション実行コンテキスト
   * @returns アクション実行インスタンス（CatActionExecutor）
   */
  action(context: ActionContext): CatActionExecutor;
}
