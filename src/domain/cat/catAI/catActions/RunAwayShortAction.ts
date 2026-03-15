import { CatActionExecutor, ActionMovement } from './CatActionExecutor';
import { ActionContext } from './ActionContext';

export class RunAwayShortAction extends CatActionExecutor {
  constructor() {
    super('runAwayShort');
  }

  execute(context: ActionContext): ActionMovement {
    const gameWidth = 800;
    const gameHeight = 600;
    const margin = 50;
    const escapeDistance = 300; // 離れたい距離
    const stopDistance = 300; // ユーザーとの距離がこれ以上で停止

    if (!context.hasToy()) {
      // おもちゃ(=ユーザー)がない場合は動作しない
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

    // ユーザーとの距離
    const distanceToUser = Math.sqrt(
      Math.pow(context.currentX - toyX, 2) + Math.pow(context.currentY - toyY, 2)
    );

    // ユーザーから離れる方向ベクトルを計算
    const dx = context.currentX - toyX;
    const dy = context.currentY - toyY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) {
      // ユーザーと同じ位置にいる場合はデフォルト方向（右）に逃げる
      return {
        deltaX: 120,
        deltaY: 0,
        speed: 120,
        flipX: true,
        animationCommands: [{
          animationKey: 'escape',
          repeat: -1
        }]
      };
    }

    // 正規化した方向ベクトル
    const directionX = dx / distance;
    const directionY = dy / distance;

    // ユーザーとの距離が100px超えたら縮こまる
    if (distanceToUser > stopDistance) {
      return {
        deltaX: 0,
        deltaY: 0,
        speed: 0,
        flipX: this.shouldFlipX(directionX),
        animationCommands: [{
          animationKey: 'shrinkBack',
          repeat: -1
        }]
      };
    }

    // 1. ユーザーから一定距離離れた理想的な目標地点を計算
    const idealTargetX = context.currentX + directionX * escapeDistance;
    const idealTargetY = context.currentY + directionY * escapeDistance;

    // 2. 目標地点を画面内にクランプ
    const targetX = Math.max(margin, Math.min(gameWidth - margin, idealTargetX));
    const targetY = Math.max(margin, Math.min(gameHeight - margin, idealTargetY));

    // 3. 目標地点までの距離とベクトルを計算
    const toTargetX = targetX - context.currentX;
    const toTargetY = targetY - context.currentY;
    const distanceToTarget = Math.sqrt(toTargetX * toTargetX + toTargetY * toTargetY);

    // 4. 目標地点に向かって移動
    const moveDirectionX = toTargetX / distanceToTarget;
    const moveDirectionY = toTargetY / distanceToTarget;
    const speedPerSecond = 120;

    return {
      deltaX: moveDirectionX * speedPerSecond,
      deltaY: moveDirectionY * speedPerSecond,
      speed: speedPerSecond,
      flipX: this.shouldFlipX(moveDirectionX),
      animationCommands: [{
        animationKey: 'escape',
        repeat: -1
      }]
    };
  }

  getInternalStateChange(): Record<string, number> {
    return {};
  }
}
