import { CatAction } from '../CatAction';
import { ActionContext } from '../ActionContext';
import { CatActionExecutor } from '../CatActionExecutor';
import { IActionSelector } from './IActionSelector';

/**
 * ねこアクション（なつき度毎）
 * クラス図における「ねこアクション（なつき度毎）」に対応
 * なつき度レベル毎にアクションをグルーピング
 */
export class BondingLevelActions implements CatAction {
  private readonly bondingLevel: number;
  private readonly actionSelector: IActionSelector;

  constructor(bondingLevel: number, actionSelector: IActionSelector) {
    this.bondingLevel = bondingLevel;
    this.actionSelector = actionSelector;
  }

  /**
   * アクションを実行
   * @param context アクション実行コンテキスト
   * @returns 選択されたアクション実行インスタンス
   */
  action(context: ActionContext): CatActionExecutor {
    return this.actionSelector.select(context);
  }

  /**
   * なつき度レベルを取得
   */
  getBondingLevel(): number {
    return this.bondingLevel;
  }

  /**
   * アクション選択器を取得
   * Package Private: CatAIから使用される
   */
  getActionSelector(): IActionSelector {
    return this.actionSelector;
  }
}
