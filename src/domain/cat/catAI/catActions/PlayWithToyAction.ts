import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

/**
 * おもちゃと遊ぶアクション
 */
export class PlayWithToyAction extends CatActionExecutor {
  constructor() {
    super('playWithToy');
  }

  execute(context: ActionContext): ActionMovement {
    if (context.hasToy()) {
      const toyDistance = context.getToyDistance();
      const catchDistance = 60;
      const speedPerSecond = 200; // 1秒あたりの移動速度（ピクセル/秒）

      if (toyDistance <= catchDistance) {
        const toyDirection = context.getToyDirection()!;
        return {
          deltaX: 0,
          deltaY: 0,
          speed: 0,
          flipX: this.shouldFlipX(toyDirection.x),
          animationCommands: [{
            animationKey: 'play',
            repeat: -1
          }]
        };
      } else {
        const toyDirection = context.getToyDirection()!;
        return {
          deltaX: toyDirection.x * speedPerSecond,
          deltaY: toyDirection.y * speedPerSecond,
          speed: speedPerSecond,
          flipX: this.shouldFlipX(toyDirection.x),
          animationCommands: [{
            animationKey: 'chase',
            repeat: -1
          }]
        };
      }
    }

    return {
      deltaX: 0,
      deltaY: 0,
      animationCommands: [{
        animationKey: 'idle',
        repeat: -1
      }]
    };
  }

  /**
   * 内部状態変化（1秒あたりの変化量）
   */
  getInternalStateChange(): Record<string, number> {
    return {
      bonding: 0.033        // 3秒間で+0.1相当
    };
  }

  getExternalStateChange(): Record<string, boolean> {
    return {
      isPlaying: true
    };
  }
}