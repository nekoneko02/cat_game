import { InternalState } from '../valueObjects/InternalState';
import { ExternalState } from '../valueObjects/ExternalState';
import { ActionProbabilityCalculator } from '../config/ActionProbabilityCalculator';
import { ActionResult, CatAction, ActionContext, ShowBellyAction, PlayWithToyAction, SitAction, RunAwayAction } from '../actions';
import { GameTimeManager } from '../../game/GameTimeManager';

/**
 * ねこの性格特性
 */
export interface Personality {
  social: number;      // 社交的 (0-1)
  active: number;      // 活発 (0-1)
  bold: number;        // 大胆 (0-1)
  dependent: number;   // 甘えん坊 (0-1)
  friendly: number;    // 人懐っこい (0-1)
}

/**
 * ねこの好み
 */
export interface Preferences {
  toyTypes: string[];           // 好きなおもちゃの種類
  movementSpeed: number;        // 好む移動速度 (0-1)
  movementDirections: string[]; // 好む移動方向
  randomness: number;           // ランダムさの好み (0-1)
}

/**
 * ねこエンティティ
 * 「実際のねこ」を表現するドメインエンティティ
 */
export class Cat {
  private actionProbabilityCalculator: ActionProbabilityCalculator;
  private _gameTimeManager: GameTimeManager | null = null;
  private currentAction: {
    name: string;
    startTime: number;
    duration?: number;
  } | null = null;

  constructor(
    public readonly id: string,
    public readonly name: string,
    private internalState: InternalState,
    private externalState: ExternalState,
    public readonly personality: Personality,
    public readonly preferences: Preferences,
    private lastUpdateTime: number = 0
  ) {
    this.actionProbabilityCalculator = new ActionProbabilityCalculator();
  }

  /**
   * GameTimeManagerを取得（lazy初期化）
   */
  private getGameTimeManager(): GameTimeManager {
    if (!this._gameTimeManager) {
      this._gameTimeManager = GameTimeManager.getInstance();
    }
    return this._gameTimeManager;
  }

  /**
   * ねこの現在の感情を取得（ステップ1仕様）
   */
  getCurrentEmotions(): Record<string, number> {
    return this.actionProbabilityCalculator.calculateEmotions(this.internalState);
  }

  /**
   * 内部状態を取得
   */
  getInternalState(): InternalState {
    return this.internalState;
  }

  /**
   * 外部状態を取得
   */
  getExternalState(): ExternalState {
    return this.externalState;
  }

  /**
   * なつき度を取得（0-10スケール）
   * -1から1の内部値を0から10のスケールに変換
   */
  getBondingLevel(): number {
    // -1から1の範囲を0から10に変換: (value + 1) * 5
    const scaledValue = (this.internalState.bonding + 1) * 5;
    return Math.floor(Math.max(0, Math.min(10, scaledValue)));
  }

  /**
   * 現在のアクション状態を取得
   */
  getCurrentAction() {
    return this.currentAction;
  }

  /**
   * 状態を更新（ステップ1仕様）
   */
  update(newExternalState: ExternalState, currentX: number, currentY: number, toyX?: number, toyY?: number): ActionResult | null {
    const deltaTime = this.getGameTimeManager().getDeltaTime();
    const currentTime = this.getGameTimeManager().getTotalTime();
    this.lastUpdateTime = currentTime;

    // 外部状態を更新
    this.externalState = newExternalState;

    // 時間経過による内部状態の自然変化
    this.updateInternalStateByTime(deltaTime);

    // 現在のアクションがまだ実行中かチェック
    if (this.currentAction) {
      const actionElapsed = currentTime - this.currentAction.startTime;
      if (this.currentAction.duration && actionElapsed < this.currentAction.duration) {
        // アクション継続中：移動方向のみ再計算
        return this.updateCurrentAction(currentX, currentY, toyX, toyY);
      } else {
        // アクション完了
        this.currentAction = null;
      }
    }

    // アクション確率を計算
    const actionProbabilities = this.actionProbabilityCalculator.calculateActionProbabilities(
      this.internalState,
      this.externalState
    );

    // 確率に基づいてアクションを選択
    const selectedAction = this.actionProbabilityCalculator.selectAction(actionProbabilities);
    
    // アクションを実行
    return this.executeStepOneAction(selectedAction, currentX, currentY, toyX, toyY);
  }

  /**
   * 現在実行中のアクションの移動方向を更新し、内部状態を毎フレーム適用
   */
  private updateCurrentAction(currentX: number, currentY: number, toyX?: number, toyY?: number): ActionResult | null {
    if (!this.currentAction) return null;

    const actionInstance = this.createActionInstance(this.currentAction.name);
    if (!actionInstance) return null;

    // 毎フレームの内部状態変化を適用
    const internalStateChange = actionInstance.getInternalStateChange();
    if (internalStateChange) {
      const deltaTime = this.getGameTimeManager().getDeltaTime();
      const timeFactorPerSecond = deltaTime / 1000; // 1フレームあたりの時間係数
      this.applyTimeBasedInternalStateChange(internalStateChange, timeFactorPerSecond);
    }

    // ActionContextを作成して移動方向を再計算
    const context = new ActionContext(currentX, currentY, toyX, toyY);
    const movement = actionInstance.execute(context);

    return {
      movement: movement
    };
  }


  /**
   * ユーザーからなでられた時の処理（ステップ1仕様）
   */
  petByUser(intensity: number = 1.0): void {
    const emotions = this.getCurrentEmotions();
    
    // 感情に応じた反応（valence: 快適度で判定）
    const valence = emotions.valence || 0;
    const fear = this.internalState.fear;
    
    if (fear > 0.5) {
      // 恐怖度が高い場合は撫でられても怖がる
      if (Math.random() < 0.7) {
        this.internalState = this.internalState.updateBonding(-0.02 * intensity);
      }
    } else if (valence >= -0.1) {
      // より寛容な条件でなつき度上昇
      // 基本的に撫でられると嬉しい（恐怖度が高くない限り）
      const bondingIncrease = Math.min(0.08 * intensity, 0.1); // 最大0.1まで上昇
      this.internalState = this.internalState.updateBonding(bondingIncrease);
    } else {
      // 非常にネガティブな状態でも、小さな変化
      if (Math.random() < 0.5) {
        this.internalState = this.internalState.updateBonding(0.01 * intensity);
      }
    }
  }

  /**
   * 時間経過による内部状態の変化
   */
  private updateInternalStateByTime(deltaTime: number): void {
    const timeFactorPerSecond = deltaTime / 1000;

    // 遊び欲求の自然減衰
    const playfulnessDecay = timeFactorPerSecond * 0.0001; // 1秒あたり0.0001減少
    this.internalState = this.internalState.decreasePlayfulness(playfulnessDecay);

    // 外部状態による内部状態への影響（InternalStateクラスでカプセル化）
    this.internalState = this.internalState.applyExternalInfluence(this.externalState, timeFactorPerSecond);

    // 将来的に他の状態変化も追加予定
    // - 空腹度の増加
    // - 疲労度の蓄積
    // - 健康度の変化など
  }


  /**
   * アクション名からCatActionインスタンスを作成
   */
  private createActionInstance(actionName: string): CatAction | null {
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

  /**
   * ステップ1のアクションを実行
   */
  private executeStepOneAction(actionName: string, currentX: number, currentY: number, toyX?: number, toyY?: number): ActionResult | null {
    const actionInstance = this.createActionInstance(actionName);
    const actionConfig = this.actionProbabilityCalculator.getActionConfig(actionName);
    
    if (!actionInstance || !actionConfig) {
      return null;
    }

    // 現在のアクション状態を設定
    this.currentAction = {
      name: actionName,
      startTime: this.getGameTimeManager().getTotalTime(),
      duration: actionConfig.duration || 0
    };

    // アクション効果は実行中に毎フレーム適用される（ここでは適用しない）

    // ActionContextを作成してActionResultを生成
    const context = new ActionContext(currentX, currentY, toyX, toyY);
    return actionInstance.createActionResult(context);
  }

  /**
   * 内部状態の変更を適用（アクション実行時用）
   */
  private applyInternalStateChange(changes: Record<string, number>): void {
    // アクション実行時は即座に適用（既に時間ベース調整済み）
    this.applyTimeBasedInternalStateChange(changes, 1.0);
  }

  /**
   * 時間ベースの内部状態変更を適用
   */
  private applyTimeBasedInternalStateChange(changes: Record<string, number>, timeFactorPerSecond: number): void {
    let newBonding = this.internalState.bonding;
    let newPlayfulness = this.internalState.playfulness;
    let newFear = this.internalState.fear;

    // 各プロパティを時間係数付きで更新
    if (changes.bonding !== undefined) {
      const change = changes.bonding * timeFactorPerSecond;
      newBonding = Math.max(-1, Math.min(1, this.internalState.bonding + change));
    }
    if (changes.playfulness !== undefined) {
      const change = changes.playfulness * timeFactorPerSecond;
      newPlayfulness = Math.max(-1, Math.min(1, this.internalState.playfulness + change));
    }
    if (changes.fear !== undefined) {
      const change = changes.fear * timeFactorPerSecond;
      newFear = Math.max(-1, Math.min(1, this.internalState.fear + change));
    }

    // 新しい内部状態を作成
    this.internalState = new InternalState(
      newBonding,
      newPlayfulness,
      newFear
    );
  }

  /**
   * 外部状態の変更を適用
   */
  private applyExternalStateChange(changes: { isPlaying?: boolean }): void {
    if (changes.isPlaying !== undefined) {
      this.externalState = this.externalState.updatePlayingState(changes.isPlaying);
    }
  }

  /**
   * デフォルトねこを作成
   */
  static createDefault(name: string = 'たぬきねこ'): Cat {
    return new Cat(
      'cat-' + performance.now(),
      name,
      InternalState.createDefault(),
      ExternalState.createDefault(),
      {
        social: 0.7,
        active: 0.8,
        bold: 0.6,
        dependent: 0.5,
        friendly: 0.8
      },
      {
        toyTypes: ['ball', 'feather', 'mouse'],
        movementSpeed: 0.7,
        movementDirections: ['horizontal', 'vertical'],
        randomness: 0.6
      },
      0
    );
  }
}