import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class WatchCautiouslyAction extends CatActionExecutor {
  constructor() {
    super('watchCautiously');
  }

  execute(context: ActionContext): ActionMovement {
    let animationKey = 'cautious_watchFrontLeft';

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
        animationKey = isToyRightOfCat ? 'cautious_watchFrontRight' : 'cautious_watchFrontLeft';
      } else {
        animationKey = isToyRightOfCat ? 'cautious_watchBackRight' : 'cautious_watchBackLeft';
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
