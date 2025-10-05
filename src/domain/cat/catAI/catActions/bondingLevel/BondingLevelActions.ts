import { CatAction } from '../CatAction';
import { ActionContext } from '../ActionContext';
import { CatActionExecutor } from '../CatActionExecutor';
import { IActionSelector } from './IActionSelector';
import { Bonding } from '../../bonding/Bonding';
import { ExternalState } from '../../../../gameLogic/environment/ExternalState';
import { ShowBellyAction } from '../ShowBellyAction';
import { PlayWithToyAction } from '../PlayWithToyAction';
import { SitAction } from '../SitAction';
import { RunAwayAction } from '../RunAwayAction';

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
    const gauge = this.levelToGauge(this.bondingLevel);
    const bonding = new Bonding(gauge);

    const externalState = context.hasToy()
      ? new ExternalState(true, 0, true, false)
      : ExternalState.createDefault();

    const actionName = this.actionSelector.select(bonding, externalState);

    const ActionClass = this.getActionClass(actionName);
    return new ActionClass();
  }

  /**
   * なつき度レベルを取得
   */
  getBondingLevel(): number {
    return this.bondingLevel;
  }

  /**
   * なつき度レベルをゲージ値に変換
   * レベル 0 → ゲージ -1.0
   * レベル 5 → ゲージ  0.0
   * レベル10 → ゲージ  1.0
   */
  private levelToGauge(level: number): number {
    return (level / 5) - 1;
  }

  /**
   * アクション名から対応するクラスを取得
   */
  private getActionClass(actionName: string): new () => CatActionExecutor {
    const actionMap: Record<string, new () => CatActionExecutor> = {
      showBelly: ShowBellyAction,
      playWithToy: PlayWithToyAction,
      sit: SitAction,
      runAway: RunAwayAction,
    };

    return actionMap[actionName] || SitAction;
  }
}
