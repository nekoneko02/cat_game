import { ActionContext } from './ActionContext';
import { AnimationCommand } from '@/types/AnimationCommand';

export interface ActionMovement {
  deltaX?: number;
  deltaY?: number;
  speed?: number;
  animationCommands: AnimationCommand[];
  flipX?: boolean;
}

export interface ActionResult {
  internalStateChange?: Record<string, number>;
  externalStateChange?: Record<string, boolean>;
  movement?: ActionMovement;
}

/**
 * ねこのアクションを定義する抽象クラス
 */
export abstract class CatAction {
  protected readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * アクション名を取得
   */
  getName(): string {
    return this.name;
  }

  /**
   * アクションの動作を実行（サブクラスで実装）
   * @param context アクション実行時のコンテキスト情報
   */
  abstract execute(context: ActionContext): ActionMovement;

  /**
   * 内部状態の変化を取得（サブクラスでオーバーライド可能）
   * @returns 1秒あたりの変化量。アクションの持続時間で自動的にスケールされる。
   */
  getInternalStateChange(): Record<string, number> | undefined {
    return undefined;
  }

  /**
   * 外部状態の変化を取得（サブクラスでオーバーライド可能）
   */
  getExternalStateChange(): Record<string, boolean> | undefined {
    return undefined;
  }

  /**
   * ActionResultを生成
   */
  createActionResult(context: ActionContext): ActionResult {
    return {
      internalStateChange: this.getInternalStateChange(),
      externalStateChange: this.getExternalStateChange(),
      movement: this.execute(context)
    };
  }

  /**
   * 移動方向に基づいてflipXを判定
   * 元のイラストは左向きなので、右向きの移動時にflipXをtrueにする
   */
  protected shouldFlipX(deltaX: number): boolean {
    return deltaX > 0; // 右向きの移動の場合、イラストを反転
  }
}