import { CatAction, ActionMovement } from './CatAction';
import { ActionContext } from './ActionContext';

/**
 * お座りアクション
 */
export class SitAction extends CatAction {
  constructor() {
    super('sit');
  }

  execute(_context: ActionContext): ActionMovement {
    return {
      deltaX: 0,
      deltaY: 0,
      animationCommands: [{
        animationKey: 'sit',
        repeat: -1
      }]
    };
  }

  /**
   * 内部状態変化（1秒あたりの変化量）
   */
  getInternalStateChange(): Record<string, number> {
    return {
      playfulness: 0.033,   // 3秒間で+0.1相当
      fear: -0.033          // 3秒間で-0.1相当
    };
  }
}