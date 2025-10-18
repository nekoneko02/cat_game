import { Bonding } from './bonding/Bonding';
import { BondingUpdateNotification } from './bonding/BondingUpdateNotification';
import { IBondingView } from './bonding/IBondingView';
import { IActionSelector } from './catActions/bondingLevel/IActionSelector';
import { CurrentAction } from './catActions/CurrentAction';
import { CatActionExecutor, ActionResult } from './catActions/CatActionExecutor';
import { ActionContext } from './catActions/ActionContext';
import { GameTimeManager } from '@/game/GameTimeManager';
import { CatActionRepository } from './catActions/CatActionRepository';

/**
 * ねこAI (クラス図の「ねこAI」に対応)
 * 猫の行動決定となつき度の管理を担当
 *
 * @package ねこ.ねこAI
 */
export class CatAI {
  private bonding: Bonding;
  private actionSelector: IActionSelector;
  private currentAction: CurrentAction | null = null;
  private readonly gameTimeManager: GameTimeManager;
  private readonly actionRepository: CatActionRepository;
  private currentBondingLevel: number;

  constructor(
    bondingContext: { level: number; gauge: number },
    gameTimeManager: GameTimeManager
  ) {
    // 新しいBondingを直接生成
    this.bonding = new Bonding(bondingContext.level, bondingContext.gauge);
    this.gameTimeManager = gameTimeManager;
    this.actionRepository = new CatActionRepository();
    this.currentBondingLevel = this.bonding.getLevel();
    const bondingLevelActions = this.actionRepository.getCatActionsByBondingLevel(this.currentBondingLevel);
    this.actionSelector = bondingLevelActions.getActionSelector();
  }

  /**
   * action() - クラス図のupdate()に対応
   * 外部状態を受け取り、行動を決定して実行する
   *
   * シーケンス図に従った処理順序:
   * 1. アクション実行
   * 2. bonding.update() (アクションによるなつき度変化)
   * 3. bonding.updateByTime() (時間経過によるなつき度変化)
   * 4. レベルアップ判定とlevelUp()呼び出し
   */
  action(context: ActionContext): ActionResult | null {
    const currentTime = this.gameTimeManager.getGameTime();

    // 現在のアクションが実行中かチェック
    if (this.currentAction && this.currentAction.isInProgress()) {
      // アクション継続中: 移動方向のみ再計算
      const result = this.updateCurrentAction(
        context.currentX,
        context.currentY,
        context.toyX,
        context.toyY,
        context.flipX
      );

      // 時間経過によるなつき度更新
      this.bonding.updateByTime();

      // レベルアップ判定
      this.checkAndLevelUp();

      return result;
    }

    // アクション完了または初回実行: 新しいアクションを選択
    this.currentAction = null;
    const selectedActionExecutor = this.actionSelector.select(context);

    const result = this.executeAction(
      selectedActionExecutor,
      context.currentX,
      context.currentY,
      context.toyX,
      context.toyY,
      currentTime,
      context.flipX
    );

    // アクション実行後、なつき度を更新（アクション名を通知）
    const actionName = selectedActionExecutor.getName();
    const notification = new BondingUpdateNotification(actionName);
    this.bonding.update(notification);

    // 時間経過によるなつき度更新
    this.bonding.updateByTime();

    // レベルアップ判定
    this.checkAndLevelUp();

    return result;
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
   * レベルアップ判定とレベルアップ処理
   */
  private checkAndLevelUp(): void {
    if (this.bonding.isGaugeFull()) {
      this.bonding.levelUp();
      this.switchCatActionByBondingLevel();
    }
  }

  /**
   * なつき度に応じた行動切り替え
   * クラス図の switchCatActionByBondingLevel() に対応
   */
  private switchCatActionByBondingLevel(): void {
    const newLevel = this.bonding.getLevel();

    if (newLevel !== this.currentBondingLevel) {
      this.currentBondingLevel = newLevel;
      const bondingLevelActions = this.actionRepository.getCatActionsByBondingLevel(newLevel);
      this.actionSelector = bondingLevelActions.getActionSelector();

      this.currentAction = null;
    }
  }

  /**
   * 現在実行中のアクションを更新
   */
  private updateCurrentAction(
    currentX: number,
    currentY: number,
    toyX?: number,
    toyY?: number,
    flipX: boolean = false
  ): ActionResult | null {
    if (!this.currentAction) return null;

    const result = this.currentAction.action(currentX, currentY, toyX, toyY, flipX);

    // 注: 新しい設計では、毎フレームのなつき度変化はBondingUpdaterのupdate()で処理
    // result.internalStateChange?.bondingは使用しない

    return result;
  }

  /**
   * 新しいアクションを実行
   */
  private executeAction(
    actionExecutor: CatActionExecutor,
    currentX: number,
    currentY: number,
    toyX: number | undefined,
    toyY: number | undefined,
    currentTime: number,
    flipX: boolean = false
  ): ActionResult | null {
    const actionName = actionExecutor.getName();
    const actionConfig = this.actionSelector.getActionConfig(actionName);

    if (!actionConfig) {
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
    return this.currentAction.action(currentX, currentY, toyX, toyY, flipX);
  }

  /**
   * デバッグ用: 利用可能なアクション名の一覧を取得
   * @internal デバッグ専用
   */
  debugGetAvailableActions(): string[] {
    return this.actionRepository.getAllActionNames();
  }

  /**
   * デバッグ用: アクションを強制実行
   * @internal デバッグ専用
   * @param actionName - アクション名 (例: "watchCautiously", "sit")
   * @param duration - 実行時間（ミリ秒）
   */
  debugForceAction(actionName: string, duration: number): void {
    const actionExecutor = this.actionRepository.getActionByName(actionName);
    if (!actionExecutor) {
      throw new Error(`Action not found: ${actionName}`);
    }

    const currentTime = this.gameTimeManager.getGameTime();
    this.currentAction = new CurrentAction(
      actionExecutor,
      currentTime,
      duration,
      this.gameTimeManager
    );

    // アクション開始時になつき度を更新（アクション名を通知）
    const notification = new BondingUpdateNotification(actionName);
    this.bonding.update(notification);
  }

  /**
   * デバッグ用: なつき度レベルを直接設定
   * @internal デバッグ専用
   * @param targetLevel - 設定するなつき度レベル（0-10）
   */
  debugSetBondingLevel(targetLevel: number): void {
    this.bonding.debugSetLevel(targetLevel);
    this.switchCatActionByBondingLevel();
  }
}
