import { CatAction, ActionMovement } from './CatAction';
import { ActionContext } from './ActionContext';

/**
 * お腹見せアクション
 */
export class ShowBellyAction extends CatAction {
  constructor() {
    super('showBelly');
  }

  execute(_context: ActionContext): ActionMovement {
    return {
      deltaX: 0,
      deltaY: 0,
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
      playfulness: 0.033,   // 3秒間で+0.1相当
      bonding: 0.067,       // 3秒間で+0.2相当
      fear: -0.067          // 3秒間で-0.2相当
    };
  }
}