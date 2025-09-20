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
  private assetManifest: AssetManifest | null = null;

  constructor() {}

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
   * 最小限のフォールバック用アセット設定を生成
   * NOTE: 正式な設定は /public/config/assets.json で管理される
   * このメソッドは assets.json が読み込めない場合のみ使用される
   */
  private async generateDefaultManifest(): Promise<AssetManifest> {
    console.warn('assets.json が読み込めませんでした。最小限のフォールバック設定を使用します。');
    return {
      cats: {
        assets: [],
        animations: []
      },
      toys: {
        assets: [
          // 最小限のフォールバック用おもちゃ
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