import { CatActionExecutor } from './CatActionExecutor';
import { ActionContext } from './ActionContext';
import { ActionResult } from './CatActionExecutor';
import { GameTimeManager } from '@/game/GameTimeManager';

/**
 * 実行中ねこアクション (クラス図の「実行中ねこアクション」に対応)
 * Cat.currentActionとして使用される
 */
export class CurrentAction {
  constructor(
    private readonly actionExecutor: CatActionExecutor,
    private readonly startTime: number,
    private readonly duration: number,
    private readonly gameTimeManager: GameTimeManager
  ) {}

  /**
   * アクション名を取得
   */
  getActionName(): string {
    return this.actionExecutor.getName();
  }

  /**
   * 開始時間を取得 (ゲーム内時間)
   */
  getStartTime(): number {
    return this.startTime;
  }

  /**
   * 実行時間を取得 (ミリ秒)
   */
  getDuration(): number {
    return this.duration;
  }

  /**
   * アクションが実行中かどうか
   */
  isInProgress(): boolean {
    if (this.duration === 0) {
      return false;
    }
    const currentTime = this.gameTimeManager.getTotalTime();
    const elapsed = currentTime - this.startTime;
    return elapsed < this.duration;
  }

  /**
   * アクションを実行
   * 毎フレーム呼び出され、移動方向を再計算する
   */
  action(currentX: number, currentY: number, toyX?: number, toyY?: number, flipX: boolean = false): ActionResult {
    const context = new ActionContext(currentX, currentY, toyX, toyY, flipX);
    return this.actionExecutor.createActionResult(context);
  }
}
