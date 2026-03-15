import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class WatchToyAction extends CatActionExecutor {
  constructor() {
    super('watchToy');
  }

  execute(context: ActionContext): ActionMovement {
    if (!context.hasToy()) {
      return {
        deltaX: 0,
        deltaY: 0,
        speed: 0,
        flipX: context.flipX,
        animationCommands: [{
          animationKey: 'sit',
          repeat: -1
        }]
      };
    }

    const toyDirection = context.getToyDirection()!;
    const flipX = this.shouldFlipX(toyDirection.x);

    return {
      deltaX: 0,
      deltaY: 0,
      speed: 0,
      flipX,
      animationCommands: [{
        animationKey: 'watchToy',
        repeat: -1
      }]
    };
  }

  getInternalStateChange(): Record<string, number> {
    return {};
  }
}
