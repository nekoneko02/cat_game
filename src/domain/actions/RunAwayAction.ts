import { CatAction, ActionMovement } from './CatAction';
import { ActionContext } from './ActionContext';

/**
 * 逃げる・隠れるアクション
 */
export class RunAwayAction extends CatAction {
  constructor() {
    super('runAway');
  }

  execute(context: ActionContext): ActionMovement {
    // ゲーム画面サイズ（CatGame.tsと合わせる）
    const gameWidth = 800;
    const gameHeight = 600;
    const margin = 50; // 壁から少し離れた位置
    
    // 4つのコーナー座標を定義
    const corners = [
      { x: margin, y: margin },                    // 左上
      { x: gameWidth - margin, y: margin },        // 右上
      { x: margin, y: gameHeight - margin },       // 左下
      { x: gameWidth - margin, y: gameHeight - margin } // 右下
    ];
    
    let targetCorner;
    
    if (context.hasToy()) {
      // おもちゃがある場合：最も遠いコーナーを選択
      const toyX = context.toyX!;
      const toyY = context.toyY!;
      
      let maxDistance = -1;
      targetCorner = corners[0]; // デフォルト
      
      corners.forEach(corner => {
        const distance = Math.sqrt(
          Math.pow(corner.x - toyX, 2) + Math.pow(corner.y - toyY, 2)
        );
        if (distance > maxDistance) {
          maxDistance = distance;
          targetCorner = corner;
        }
      });
    } else {
      // おもちゃがない場合：現在位置から最も遠いコーナーを選択
      let maxDistance = -1;
      targetCorner = corners[0]; // デフォルト
      
      corners.forEach(corner => {
        const distance = Math.sqrt(
          Math.pow(corner.x - context.currentX, 2) + Math.pow(corner.y - context.currentY, 2)
        );
        if (distance > maxDistance) {
          maxDistance = distance;
          targetCorner = corner;
        }
      });
    }
    
    // コーナーまでの距離を計算
    const distanceToCorner = Math.sqrt(
      Math.pow(targetCorner.x - context.currentX, 2) + Math.pow(targetCorner.y - context.currentY, 2)
    );
    const arrivalDistance = 30; // コーナーに到着したと判定する距離
    
    if (distanceToCorner <= arrivalDistance) {
      // コーナーに到着：scaredアニメーションで停止
      return {
        deltaX: 0,
        deltaY: 0,
        speed: 0,
        flipX: this.shouldFlipX(0),
        animationCommands: [{
          animationKey: 'scared',
          repeat: -1
        }]
      };
    } else {
      // まだコーナーに到着していない：escapeアニメーションで移動
      const movement = context.getMovementDeltaTo(targetCorner.x, targetCorner.y);
      return {
        deltaX: movement.deltaX,
        deltaY: movement.deltaY,
        speed: 150,
        flipX: this.shouldFlipX(movement.deltaX),
        animationCommands: [{
          animationKey: 'escape',
          repeat: -1  // 逃げている間は継続
        }]
      };
    }
  }

  /**
   * 内部状態変化（1秒あたりの変化量）
   * RunAwayアクションは内部状態を変更しない
   */
  getInternalStateChange(): Record<string, number> {
    return {};
  }
}