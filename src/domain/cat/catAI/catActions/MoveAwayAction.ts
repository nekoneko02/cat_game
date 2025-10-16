import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class MoveAwayAction extends CatActionExecutor {
  constructor() {
    super('moveAway');
  }

  execute(context: ActionContext): ActionMovement {
    const gameWidth = 800;
    const gameHeight = 600;
    const margin = 50;
    const stopDistance = 200;

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

    const dx = context.currentX - toyX;
    const dy = context.currentY - toyY;
    const distanceToUser = Math.sqrt(dx * dx + dy * dy);

    if (distanceToUser >= stopDistance) {
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

    if (distanceToUser === 0) {
      return {
        deltaX: 80,
        deltaY: 0,
        speed: 80,
        flipX: true,
        animationCommands: [{
          animationKey: 'walk',
          repeat: -1
        }]
      };
    }

    const directionX = dx / distanceToUser;
    const directionY = dy / distanceToUser;

    const idealTargetX = context.currentX + directionX * stopDistance;
    const idealTargetY = context.currentY + directionY * stopDistance;

    const targetX = Math.max(margin, Math.min(gameWidth - margin, idealTargetX));
    const targetY = Math.max(margin, Math.min(gameHeight - margin, idealTargetY));

    const toTargetX = targetX - context.currentX;
    const toTargetY = targetY - context.currentY;
    const distanceToTarget = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

    const moveDirectionX = toTargetX / distanceToTarget;
    const moveDirectionY = toTargetY / distanceToTarget;
    const speedPerSecond = 80;

    return {
      deltaX: moveDirectionX * speedPerSecond,
      deltaY: moveDirectionY * speedPerSecond,
      speed: speedPerSecond,
      flipX: this.shouldFlipX(moveDirectionX),
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
