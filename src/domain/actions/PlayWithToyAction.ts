import { CatAction, ActionMovement } from './CatAction';
import { ActionContext } from './ActionContext';

/**
 * おもちゃと遊ぶアクション
 */
export class PlayWithToyAction extends CatAction {
  constructor() {
    super('playWithToy');
  }

  execute(context: ActionContext): ActionMovement {
    if (context.hasToy()) {
      const toyDistance = context.getToyDistance();
      const catchDistance = 60; // おもちゃをキャッチする距離（調整可能）
      
      if (toyDistance <= catchDistance) {
        // おもちゃに十分近づいた場合は停止してじゃれる
        // じゃれるときはおもちゃの方向を向く
        const toyMovement = context.getToyMovementDelta()!;
        return {
          deltaX: 0,
          deltaY: 0,
          speed: 0,
          flipX: this.shouldFlipX(toyMovement.deltaX),
          animationCommands: [{
            animationKey: 'play',
            repeat: -1  // 数回じゃれる動作
          }]
        };
      } else {
        // まだ遠い場合は追いかける
        const toyMovement = context.getToyMovementDelta()!;
        return {
          deltaX: toyMovement.deltaX,
          deltaY: toyMovement.deltaY,
          speed: 200,
          flipX: this.shouldFlipX(toyMovement.deltaX),
          animationCommands: [{
            animationKey: 'chase',
            repeat: -1  // 無限ループで追いかける
          }]
        };
      }
    }
    
    // おもちゃがない場合は移動しない
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
      playfulness: -0.033,  // 3秒間で-0.1相当
      bonding: 0.033,       // 3秒間で+0.1相当
      fear: -0.033          // 3秒間で-0.1相当
    };
  }

  getExternalStateChange(): Record<string, boolean> {
    return {
      isPlaying: true
    };
  }
}