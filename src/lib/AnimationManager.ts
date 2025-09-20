import { AssetManager, AnimationConfig } from './AssetManager';
import { logWarn, logError } from './log';

/**
 * アニメーション再生状態
 */
export interface AnimationState {
  currentAnimation: string;
  isPlaying: boolean;
  startTime: number;
  duration?: number;
  repeat: number;
  onComplete?: () => void;
}

/**
 * アニメーション管理システム
 * Phaserスプライトのアニメーション制御を行う
 */
export class AnimationManager {
  private assetManager: AssetManager;
  private currentState: AnimationState | null = null;

  constructor() {
    this.assetManager = new AssetManager();
  }

  /**
   * アニメーションを再生
   */
  playAnimation(
    sprite: Phaser.GameObjects.Sprite,
    animationKey: string,
    onComplete?: () => void
  ): boolean {
    const animConfig = this.assetManager.getAnimationConfig(animationKey);
    
    if (!animConfig) {
      logWarn('Animation config not found', { animationKey });
      // フォールバック: 静的フレームを設定
      if (sprite.scene.textures.exists('fallback_cat')) {
        return this.setStaticFrame(sprite, 'fallback_cat', 0);
      }
      return false;
    }

    // 既存のアニメーションを停止
    if (this.currentState?.isPlaying) {
      sprite.stop();
    }

    // 新しいアニメーションを開始
    try {
      // アニメーションが存在するかチェック
      if (!sprite.scene.anims.exists(animationKey)) {
        logWarn('Animation not found in scene', { animationKey });
        // フォールバック: テクスチャが存在するなら静的フレームを設定
        if (sprite.scene.textures.exists(animConfig.textureKey)) {
          return this.setStaticFrame(sprite, animConfig.textureKey, animConfig.frameStart);
        } else if (sprite.scene.textures.exists('fallback_cat')) {
          return this.setStaticFrame(sprite, 'fallback_cat', 0);
        } else {
          logWarn('No suitable texture found for animation', { animationKey });
          return false;
        }
      }

      sprite.play(animationKey);
      
      this.currentState = {
        currentAnimation: animationKey,
        isPlaying: true,
        startTime: Date.now(),
        duration: animConfig.duration || 1000,
        repeat: animConfig.repeat,
        onComplete
      };

      // 完了時のコールバック設定
      if (onComplete || animConfig.repeat === 0) {
        sprite.once('animationcomplete', () => {
          if (this.currentState?.currentAnimation === animationKey) {
            this.currentState.isPlaying = false;
            if (onComplete) {
              onComplete();
            }
          }
        });
      }

      return true;
    } catch (error) {
      logError('Failed to play animation', { animationKey, error: error instanceof Error ? error.message : String(error) });
      // フォールバック: 静的フレームを設定
      if (animConfig && sprite.scene.textures.exists(animConfig.textureKey)) {
        return this.setStaticFrame(sprite, animConfig.textureKey, animConfig.frameStart);
      } else if (sprite.scene.textures.exists('fallback_cat')) {
        return this.setStaticFrame(sprite, 'fallback_cat', 0);
      } else {
        logError('No fallback texture available for animation', { animationKey });
        return false;
      }
    }
  }

  /**
   * アクションに基づいてアニメーションを選択・再生
   */
  playActionAnimation(
    sprite: Phaser.GameObjects.Sprite,
    actionName: string,
    onComplete?: () => void
  ): boolean {
    const animationKey = this.getAnimationKeyForAction(actionName);
    
    if (!animationKey) {
      logWarn('No animation mapping for action', { actionName });
      return false;
    }

    return this.playAnimation(sprite, animationKey, onComplete);
  }

  /**
   * アクション名からアニメーションキーへのマッピング
   */
  private getAnimationKeyForAction(actionName: string): string | null {
    const actionAnimationMap: Record<string, string> = {
      'showBelly': 'showBelly',
      'playWithToy': 'chase',
      'sit': 'sit',
      'runAway': 'scared',
      'idle': 'idle',
      'scared': 'scared',
      'chase': 'chase'
    };

    return actionAnimationMap[actionName] || null;
  }

  /**
   * アイドルアニメーションを再生
   */
  playIdleAnimation(sprite: Phaser.GameObjects.Sprite): boolean {
    return this.playAnimation(sprite, 'idle');
  }

  /**
   * アニメーションを停止
   */
  stopAnimation(sprite: Phaser.GameObjects.Sprite): void {
    if (this.currentState?.isPlaying) {
      sprite.stop();
      this.currentState.isPlaying = false;
    }
  }

  /**
   * 現在のアニメーション状態を取得
   */
  getCurrentState(): AnimationState | null {
    return this.currentState ? { ...this.currentState } : null;
  }

  /**
   * アニメーションが再生中かチェック
   */
  isPlaying(animationKey?: string): boolean {
    if (!this.currentState?.isPlaying) {
      return false;
    }

    if (animationKey) {
      return this.currentState.currentAnimation === animationKey;
    }

    return true;
  }

  /**
   * アニメーションを一時停止
   */
  pauseAnimation(sprite: Phaser.GameObjects.Sprite): void {
    if (this.currentState?.isPlaying) {
      sprite.anims.pause();
    }
  }

  /**
   * アニメーションを再開
   */
  resumeAnimation(sprite: Phaser.GameObjects.Sprite): void {
    if (this.currentState && !this.currentState.isPlaying) {
      sprite.anims.resume();
      this.currentState.isPlaying = true;
    }
  }

  /**
   * アニメーション完了を待機
   */
  waitForAnimationComplete(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentState?.isPlaying) {
        resolve();
        return;
      }

      const checkComplete = () => {
        if (!this.currentState?.isPlaying) {
          resolve();
        } else {
          setTimeout(checkComplete, 100);
        }
      };

      checkComplete();
    });
  }

  /**
   * アニメーション設定を更新
   */
  updateAnimationConfig(sprite: Phaser.GameObjects.Sprite, config: Partial<AnimationConfig>): void {
    if (!this.currentState?.currentAnimation) {
      return;
    }

    const currentAnimKey = this.currentState.currentAnimation;
    const animConfig = this.assetManager.getAnimationConfig(currentAnimKey);
    
    if (!animConfig) {
      return;
    }

    // フレームレートの動的変更
    if (config.frameRate && sprite.anims.currentAnim) {
      sprite.anims.currentAnim.frameRate = config.frameRate;
    }
  }

  /**
   * フォールバック：シンプルなテクスチャ切り替え
   */
  setStaticFrame(sprite: Phaser.GameObjects.Sprite, textureKey: string, frame?: number): boolean {
    try {
      if (frame !== undefined) {
        sprite.setTexture(textureKey, frame);
      } else {
        sprite.setTexture(textureKey);
      }
      
      // 現在のアニメーションを停止
      if (this.currentState?.isPlaying) {
        this.currentState.isPlaying = false;
      }

      return true;
    } catch (error) {
      logError('Failed to set static frame', { textureKey, error: error instanceof Error ? error.message : String(error) });
      return false;
    }
  }

  /**
   * デバッグ情報出力
   */
  debugInfo(): void {
    // Debug info removed for production
  }

  /**
   * クリーンアップ
   */
  dispose(): void {
    this.currentState = null;
  }
}