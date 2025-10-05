import { Bonding } from './catAI/bonding/Bonding';
import { IBondingView } from './catAI/bonding/IBondingView';
import { ExternalState } from '../gameLogic/environment/ExternalState';
import { CatPosition } from './externalState/CatPosition';
import { ActionResult } from './catAI/catActions';
import { GameTimeManager } from '../../game/GameTimeManager';
import { CatAI } from './catAI/CatAI';

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
  private readonly catAI: CatAI;
  private _gameTimeManager: GameTimeManager | null = null;
  private position: CatPosition;

  constructor(
    public readonly id: string,
    public readonly name: string,
    private externalState: ExternalState,
    public readonly personality: Personality,
    public readonly preferences: Preferences,
    private lastUpdateTime: number = 0,
    gameTimeManager?: GameTimeManager,
    initialBonding?: Bonding,
    initialPosition?: CatPosition
  ) {
    if (gameTimeManager) {
      this._gameTimeManager = gameTimeManager;
    }
    const bonding = initialBonding || Bonding.createDefault();
    this.catAI = new CatAI(bonding, this.getGameTimeManager());
    this.position = initialPosition || CatPosition.createDefault();
  }

  /**
   * GameTimeManagerを取得（lazy初期化）
   */
  private getGameTimeManager(): GameTimeManager {
    if (!this._gameTimeManager) {
      this._gameTimeManager = new GameTimeManager();
    }
    return this._gameTimeManager;
  }

  /**
   * 外部状態を取得
   * @internal
   * @testonly テスト用途のみ。本来はprivateとして扱うべき
   */
  getExternalState(): ExternalState {
    return this.externalState;
  }

  /**
   * なつき度を取得
   */
  getBonding(): IBondingView {
    return this.catAI.getBonding();
  }

  /**
   * 現在のアクション状態を取得
   * @internal デバッグ用途のみ。本来はprivateとして扱うべき
   */
  getCurrentAction() {
    return this.catAI.getCurrentAction();
  }

  /**
   * 位置を取得
   * クラス図の getPosition() に対応
   */
  getPosition(): { x: number; y: number } {
    return { x: this.position.x, y: this.position.y };
  }

  /**
   * action() - クラス図のupdate()に対応
   * 状態を更新（ステップ1仕様）
   */
  action(newExternalState: ExternalState, toyX?: number, toyY?: number): ActionResult | null {
    const currentTime = this.getGameTimeManager().getTotalTime();
    this.lastUpdateTime = currentTime;

    // 外部状態を更新
    this.externalState = newExternalState;

    // CatAIに処理を委譲（現在位置を渡す）
    const actionResult = this.catAI.action(this.externalState, this.position.x, this.position.y, toyX, toyY);

    // ActionMovementに基づいて位置を更新
    // deltaX/deltaYは1秒あたりの移動量なので、deltaTime（1フレームの時間）を掛けて1フレーム分に変換
    if (actionResult?.movement) {
      const deltaX = actionResult.movement.deltaX || 0;
      const deltaY = actionResult.movement.deltaY || 0;
      const deltaTime = this.getGameTimeManager().getDeltaTime() / 1000; // ミリ秒→秒
      this.position = this.position.move(deltaX * deltaTime, deltaY * deltaTime);
    }

    return actionResult;
  }

  /**
   * update() - 後方互換性のため残す（内部的にaction()を呼ぶ）
   * @deprecated Use action() instead
   */
  update(newExternalState: ExternalState, _currentX: number, _currentY: number, toyX?: number, toyY?: number): ActionResult | null {
    // currentX/currentYは互換性のために残すが使用しない（Catが位置を管理）
    return this.action(newExternalState, toyX, toyY);
  }

  /**
   * デフォルトねこを作成
   */
  static createDefault(name: string = 'たぬきねこ', gameTimeManager?: GameTimeManager): Cat {
    return new Cat(
      'cat-' + performance.now(),
      name,
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
      0,
      gameTimeManager,
      Bonding.createDefault()
    );
  }
}