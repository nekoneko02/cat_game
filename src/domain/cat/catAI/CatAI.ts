import { Bonding } from './bonding/Bonding';
import { ExternalState } from '../../gameLogic/environment/ExternalState';
import { IBondingView } from './bonding/IBondingView';
import { IActionSelector } from './catActions/bondingLevel/IActionSelector';
import { CurrentAction } from './catActions/CurrentAction';
import { CatActionExecutor, ActionResult } from './catActions/CatActionExecutor';
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
    initialBonding: Bonding,
    gameTimeManager: GameTimeManager
  ) {
    this.bonding = initialBonding;
    this.gameTimeManager = gameTimeManager;
    this.actionRepository = new CatActionRepository();
    this.currentBondingLevel = this.bonding.getLevel();
    const bondingLevelActions = this.actionRepository.getCatActionsByBondingLevel(this.currentBondingLevel);
    this.actionSelector = bondingLevelActions.getActionSelector();
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
    toyY?: number,
    flipX: boolean = false
  ): ActionResult | null {
    const currentTime = this.gameTimeManager.getTotalTime();

    this.updateBondingByTime();
    this.switchCatActionByBondingLevel();

    // 現在のアクションが実行中かチェック
    if (this.currentAction && this.currentAction.isInProgress()) {
      // アクション継続中: 移動方向のみ再計算し、なつき度変化を適用
      return this.updateCurrentAction(currentX, currentY, toyX, toyY, flipX);
    }

    // アクション完了または初回実行: 新しいアクションを選択
    this.currentAction = null;
    const selectedActionExecutor = this.actionSelector.select(this.bonding, externalState);

    return this.executeAction(selectedActionExecutor, currentX, currentY, toyX, toyY, currentTime, flipX);
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
   * 時間経過によるなつき度自動上昇
   * なつきやすいシナリオ:
   * - 0～1分: Lv.1 → Lv.2 (ゲージ 0 → 1)
   * - 1～3分: Lv.2 → Lv.3 (ゲージ 0 → 1)
   * - 3分以降: Lv.3で固定 (ゲージ 0)
   */
  private updateBondingByTime(): void {
    const totalTimeMs = this.gameTimeManager.getTotalTime();
    const totalTimeSec = totalTimeMs / 1000;

    let targetLevel: number;
    let targetGauge: number;

    if (totalTimeSec < 60) {
      // 0~1分: Lv1 → Lv2への進捗
      targetLevel = 1;
      targetGauge = totalTimeSec / 60;
    } else if (totalTimeSec < 180) {
      // 1~3分: Lv2 → Lv3への進捗
      targetLevel = 2;
      targetGauge = (totalTimeSec - 60) / 120;
    } else {
      // 3分以降: Lv3で固定
      targetLevel = 3;
      targetGauge = 0;
    }

    this.bonding = new Bonding(targetLevel, targetGauge);
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

    const currentTime = this.gameTimeManager.getTotalTime();
    this.currentAction = new CurrentAction(
      actionExecutor,
      currentTime,
      duration,
      this.gameTimeManager
    );
  }
}
