import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

/**
 * お腹見せアクション
 */
export class ShowBellyAction extends CatActionExecutor {
  constructor() {
    super('showBelly');
  }

  execute(context: ActionContext): ActionMovement {
    return {
      deltaX: 0,
      deltaY: 0,
      flipX: context.flipX,
      animationCommands: [{
        animationKey: 'showBelly',
        repeat: -1  // 1回のみ実行
      }]
    };
  }

  /**
   * 内部状態変化（1秒あたりの変化量）
   */
  getInternalStateChange(): Record<string, number> {
    return {
      bonding: 0.067        // 3秒間で+0.2相当
    };
  }
}