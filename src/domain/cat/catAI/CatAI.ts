import { Bonding } from './bonding/Bonding';
import { ExternalState } from '../../gameLogic/environment/ExternalState';
import { IBondingView } from './bonding/IBondingView';
import { ActionSelector } from './catActions/bondingLevel/Lv0/ActionSelectorLv0';
import { CurrentAction } from './catActions/CurrentAction';
import { CatActionExecutor, ActionResult } from './catActions/CatActionExecutor';
import { GameTimeManager } from '@/game/GameTimeManager';
import { ShowBellyAction } from './catActions/ShowBellyAction';
import { PlayWithToyAction } from './catActions/PlayWithToyAction';
import { SitAction } from './catActions/SitAction';
import { RunAwayAction } from './catActions/RunAwayAction';

/**
 * ねこAI (クラス図の「ねこAI」に対応)
 * 猫の行動決定となつき度の管理を担当
 *
 * @package ねこ.ねこAI
 */
export class CatAI {
  private bonding: Bonding;
  private readonly actionSelector: ActionSelector;
  private currentAction: CurrentAction | null = null;
  private readonly gameTimeManager: GameTimeManager;

  constructor(
    initialBonding: Bonding,
    gameTimeManager: GameTimeManager
  ) {
    this.bonding = initialBonding;
    this.gameTimeManager = gameTimeManager;
    this.actionSelector = new ActionSelector();
  }

  /**
   * action() - クラス図のupdate()に対応
   * 外部状態を受け取り、行動を決定して実行する
   */
  action(
    externalState: ExternalState,
    currentX: number,
    currentY: number,
    toyX?: number,
    toyY?: number
  ): ActionResult | null {
    const currentTime = this.gameTimeManager.getTotalTime();

    // 現在のアクションが実行中かチェック
    if (this.currentAction && this.currentAction.isInProgress()) {
      // アクション継続中: 移動方向のみ再計算し、なつき度変化を適用
      return this.updateCurrentAction(currentX, currentY, toyX, toyY);
    }

    // アクション完了または初回実行: 新しいアクションを選択
    this.currentAction = null;
    const selectedActionName = this.actionSelector.select(this.bonding, externalState);

    return this.executeAction(selectedActionName, currentX, currentY, toyX, toyY, currentTime);
  }

  /**
   * なつき度を取得
   * ※ Cat（親パッケージ「ねこ」）から使用されるため public として公開
   *
   * @returns なつき度View
   */
  getBonding(): IBondingView {
    return this.bonding;
  }

  /**
   * 現在実行中のアクションを取得
   * ※ Cat（親パッケージ「ねこ」）から使用されるため public として公開
   */
  getCurrentAction(): CurrentAction | null {
    return this.currentAction;
  }

  /**
   * なつき度に応じた行動切り替え (未実装)
   * クラス図の switchCatActionByBondingLevel() に対応
   */
  private switchCatActionByBondingLevel(): void {
    // TODO: なつき度に応じた行動パターンの切り替えロジック
    // ステップ2以降で実装予定
  }

  /**
   * 現在実行中のアクションを更新
   */
  private updateCurrentAction(
    currentX: number,
    currentY: number,
    toyX?: number,
    toyY?: number
  ): ActionResult | null {
    if (!this.currentAction) return null;

    const result = this.currentAction.action(currentX, currentY, toyX, toyY);

    // 毎フレームのなつき度変化を適用
    if (result.internalStateChange?.bonding !== undefined) {
      const deltaTime = this.gameTimeManager.getDeltaTime();
      const timeFactorPerSecond = deltaTime / 1000;
      const bondingChange = result.internalStateChange.bonding * timeFactorPerSecond;
      this.bonding = this.bonding.updateBonding(bondingChange);
    }

    return result;
  }

  /**
   * 新しいアクションを実行
   */
  private executeAction(
    actionName: string,
    currentX: number,
    currentY: number,
    toyX: number | undefined,
    toyY: number | undefined,
    currentTime: number
  ): ActionResult | null {
    const actionExecutor = this.createActionExecutor(actionName);
    const actionConfig = this.actionSelector.getActionConfig(actionName);

    if (!actionExecutor || !actionConfig) {
      return null;
    }

    // 現在のアクション状態を設定
    this.currentAction = new CurrentAction(
      actionExecutor,
      currentTime,
      actionConfig.duration || 0,
      this.gameTimeManager
    );

    // ActionResultを生成
    return this.currentAction.action(currentX, currentY, toyX, toyY);
  }

  /**
   * アクション名からCatActionExecutorインスタンスを作成
   */
  private createActionExecutor(actionName: string): CatActionExecutor | null {
    switch (actionName) {
      case 'showBelly':
        return new ShowBellyAction();
      case 'playWithToy':
        return new PlayWithToyAction();
      case 'sit':
        return new SitAction();
      case 'runAway':
        return new RunAwayAction();
      default:
        return null;
    }
  }
}
