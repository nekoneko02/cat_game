/**
 * アセット設定の型定義
 */
export interface AssetConfig {
  key: string;
  url: string;
  type: 'image' | 'spritesheet';
  frameConfig?: {
    frameWidth: number;
    frameHeight: number;
    startFrame?: number;
    endFrame?: number;
  };
}

export interface AnimationConfig {
  key: string;
  textureKey: string;
  frameStart: number;
  frameEnd: number;
  frameRate: number;
  repeat: number; // -1 for infinite loop
  duration?: number;
}

export interface AssetManifest {
  cats: {
    assets: AssetConfig[];
    animations: AnimationConfig[];
  };
  toys: {
    assets: AssetConfig[];
  };
  ui: {
    assets: AssetConfig[];
  };
}

/**
 * アセット管理システム
 * 特定のディレクトリ構造に基づいてアセットを自動読み込み
 */
export class AssetManager {
  private static instance: AssetManager | null = null;
  private assetManifest: AssetManifest | null = null;

  private constructor() {}

  /**
   * シングルトンインスタンス取得
   */
  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  /**
   * アセットマニフェストを読み込み
   */
  async loadManifest(): Promise<AssetManifest> {
    if (this.assetManifest) {
      return this.assetManifest;
    }

    try {
      // 外部設定ファイルから読み込み
      const response = await fetch('/config/assets.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch assets config: ${response.status}`);
      }
      
      this.assetManifest = await response.json();
      return this.assetManifest as AssetManifest;
    } catch (error) {
      this.assetManifest = await this.generateDefaultManifest();
      return this.assetManifest;
    }
  }

  /**
   * デフォルトのアセット設定を生成
   */
  private async generateDefaultManifest(): Promise<AssetManifest> {
    return {
      cats: {
        assets: [
          {
            key: 'cat_idle',
            url: '/assets/cats/cat_idle.png',
            type: 'spritesheet',
            frameConfig: {
              frameWidth: 64,
              frameHeight: 64,
              startFrame: 0,
              endFrame: 3
            }
          },
          {
            key: 'cat_showBelly',
            url: '/assets/cats/cat_showBelly.png',
            type: 'spritesheet',
            frameConfig: {
              frameWidth: 64,
              frameHeight: 64,
              startFrame: 0,
              endFrame: 3
            }
          },
          {
            key: 'cat_chase',
            url: '/assets/cats/cat_chase.png',
            type: 'spritesheet',
            frameConfig: {
              frameWidth: 64,
              frameHeight: 64,
              startFrame: 0,
              endFrame: 3
            }
          },
          {
            key: 'cat_sit',
            url: '/assets/cats/cat_sit.png',
            type: 'spritesheet',
            frameConfig: {
              frameWidth: 64,
              frameHeight: 64,
              startFrame: 0,
              endFrame: 3
            }
          },
          {
            key: 'cat_scared',
            url: '/assets/cats/cat_scared.png',
            type: 'spritesheet',
            frameConfig: {
              frameWidth: 64,
              frameHeight: 64,
              startFrame: 0,
              endFrame: 3
            }
          }
        ],
        animations: [
          {
            key: 'idle',
            textureKey: 'cat_idle',
            frameStart: 0,
            frameEnd: 3,
            frameRate: 2,
            repeat: -1,
            duration: 2000
          },
          {
            key: 'showBelly',
            textureKey: 'cat_showBelly',
            frameStart: 0,
            frameEnd: 3,
            frameRate: 4,
            repeat: 0,
            duration: 2000
          },
          {
            key: 'chase',
            textureKey: 'cat_chase',
            frameStart: 0,
            frameEnd: 3,
            frameRate: 8,
            repeat: -1,
            duration: 1500
          },
          {
            key: 'sit',
            textureKey: 'cat_sit',
            frameStart: 0,
            frameEnd: 3,
            frameRate: 3,
            repeat: 0,
            duration: 1500
          },
          {
            key: 'scared',
            textureKey: 'cat_scared',
            frameStart: 0,
            frameEnd: 3,
            frameRate: 6,
            repeat: 2,
            duration: 1000
          }
        ]
      },
      toys: {
        assets: [
          {
            key: 'toy_ball',
            url: '/assets/toys/ball.png',
            type: 'image'
          }
        ]
      },
      ui: {
        assets: []
      }
    };
  }

  /**
   * フォールバック用のシンプルなマニフェスト
   */
  private generateFallbackManifest(): AssetManifest {
    return {
      cats: {
        assets: [],
        animations: []
      },
      toys: {
        assets: []
      },
      ui: {
        assets: []
      }
    };
  }

  /**
   * Phaserシーンにアセットを読み込み（非推奨：直接preloadで使用することを推奨）
   */
  loadAssetsToScene(scene: Phaser.Scene): Promise<void> {
    return new Promise(async (resolve) => {
      
      const manifest = await this.loadManifest();
      
      // エラーハンドリング
      scene.load.on('loaderror', (file: { key: string; url: string }) => {
        console.warn(`Failed to load asset: ${file.key} from ${file.url}`);
      });
      
      // ねこのアセット読み込み
      for (const asset of manifest.cats.assets) {
        try {
          if (asset.type === 'spritesheet' && asset.frameConfig) {
            scene.load.spritesheet(asset.key, asset.url, {
              frameWidth: asset.frameConfig.frameWidth,
              frameHeight: asset.frameConfig.frameHeight,
              startFrame: asset.frameConfig.startFrame,
              endFrame: asset.frameConfig.endFrame
            });
          } else {
            scene.load.image(asset.key, asset.url);
          }
        } catch (error) {
          console.warn(`Failed to queue asset ${asset.key}:`, error);
        }
      }

      // おもちゃのアセット読み込み
      for (const asset of manifest.toys.assets) {
        try {
          scene.load.image(asset.key, asset.url);
        } catch (error) {
          console.warn(`Failed to queue toy asset ${asset.key}:`, error);
        }
      }

      // UIのアセット読み込み
      for (const asset of manifest.ui.assets) {
        try {
          scene.load.image(asset.key, asset.url);
        } catch (error) {
          console.warn(`Failed to queue UI asset ${asset.key}:`, error);
        }
      }

      // 読み込み完了時の処理
      scene.load.once('complete', () => {
        this.createAnimations(scene);
        resolve();
      });

      // 読み込み開始（既に開始されている場合は即座に完了）
      if (scene.load.totalToLoad === 0) {
        this.createAnimations(scene);
        resolve();
      } else {
        scene.load.start();
      }
    });
  }

  /**
   * Phaserアニメーションを作成
   */
  private createAnimations(scene: Phaser.Scene): void {
    this.assetManifest?.cats.animations.forEach(animConfig => {
      if (scene.anims.exists(animConfig.key)) {
        return; // 既に存在する場合はスキップ
      }

      try {
        // テクスチャが存在するかチェック
        if (!scene.textures.exists(animConfig.textureKey)) {
          console.warn(`Texture not found for animation ${animConfig.key}: ${animConfig.textureKey}`);
          return;
        }

        scene.anims.create({
          key: animConfig.key,
          frames: scene.anims.generateFrameNumbers(animConfig.textureKey, {
            start: animConfig.frameStart,
            end: animConfig.frameEnd
          }),
          frameRate: animConfig.frameRate,
          repeat: animConfig.repeat
        });
      } catch (error) {
        console.error(`Failed to create animation ${animConfig.key}:`, error);
      }
    });
  }

  /**
   * アセットの存在確認
   */
  hasAsset(key: string): boolean {
    if (!this.assetManifest) return false;
    
    const allAssets = [
      ...this.assetManifest.cats.assets,
      ...this.assetManifest.toys.assets,
      ...this.assetManifest.ui.assets
    ];
    
    return allAssets.some(asset => asset.key === key);
  }

  /**
   * アニメーション設定を取得
   */
  getAnimationConfig(animationKey: string): AnimationConfig | null {
    if (!this.assetManifest) return null;
    
    return this.assetManifest.cats.animations.find(
      anim => anim.key === animationKey
    ) || null;
  }

  /**
   * おもちゃアセットキーを取得
   */
  getToyAssetKey(toyType: string): string {
    return `toy_${toyType}`;
  }

  /**
   * デバッグ情報出力
   */
  debugInfo(): void {
    if (!this.assetManifest) {
      return;
    }
  }
}