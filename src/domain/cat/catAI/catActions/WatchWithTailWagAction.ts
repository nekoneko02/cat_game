import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class WatchWithTailWagAction extends CatActionExecutor {
  constructor() {
    super('watchWithTailWag');
  }

  execute(context: ActionContext): ActionMovement {
    let animationKey = 'watchWithTailWag_FrontLeft';

    if (context.hasToy()) {
      // おもちゃが画面右側（ねこより右）にあるか
      let isToyRightOfCat = context.isToyRightOfCatOnScreen();
      // おもちゃが画面下側（ねこより下、ねこの正面側）にあるか
      const isToyBelowCat = context.isToyBelowCatOnScreen();

      // flipXが有効な場合は左右を反転
      if (context.flipX) {
        isToyRightOfCat = !isToyRightOfCat;
      }

      if (isToyBelowCat) {
        animationKey = isToyRightOfCat ? 'watchWithTailWag_FrontRight' : 'watchWithTailWag_FrontLeft';
      } else {
        animationKey = isToyRightOfCat ? 'watchWithTailWag_BackRight' : 'watchWithTailWag_BackLeft';
      }
    }

    return {
      deltaX: 0,
      deltaY: 0,
      speed: 0,
      flipX: context.flipX,
      animationCommands: [{
        animationKey: animationKey,
        repeat: -1
      }]
    };
  }

  getInternalStateChange(): Record<string, number> {
    return {};
  }
}
