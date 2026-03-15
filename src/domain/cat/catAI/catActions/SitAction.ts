import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

/**
 * お座りアクション
 */
export class SitAction extends CatActionExecutor {
  constructor() {
    super('sit');
  }

  execute(context: ActionContext): ActionMovement {
    return {
      deltaX: 0,
      deltaY: 0,
      flipX: context.flipX,
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
    return {};
  }
}