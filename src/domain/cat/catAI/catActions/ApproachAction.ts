import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class ApproachAction extends CatActionExecutor {
  constructor() {
    super('approach');
  }

  execute(context: ActionContext): ActionMovement {
    const stopDistance = 100;

    if (!context.hasToy()) {
      return {
        deltaX: 0,
        deltaY: 0,
        speed: 0,
        flipX: false,
        animationCommands: [{
          animationKey: 'idle',
          repeat: -1
        }]
      };
    }

    const toyX = context.toyX!;
    const toyY = context.toyY!;

    const dx = toyX - context.currentX;
    const dy = toyY - context.currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= stopDistance) {
      return {
        deltaX: 0,
        deltaY: 0,
        speed: 0,
        flipX: this.shouldFlipX(dx),
        animationCommands: [{
          animationKey: 'idle',
          repeat: -1
        }]
      };
    }

    const directionX = dx / distance;
    const directionY = dy / distance;
    const speedPerSecond = 80;

    return {
      deltaX: directionX * speedPerSecond,
      deltaY: directionY * speedPerSecond,
      speed: speedPerSecond,
      flipX: this.shouldFlipX(directionX),
      animationCommands: [{
        animationKey: 'walk',
        repeat: -1
      }]
    };
  }

  getInternalStateChange(): Record<string, number> {
    return {};
  }
}
