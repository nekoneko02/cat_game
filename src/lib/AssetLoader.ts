import * as Phaser from 'phaser';
import assetsConfig from '../../public/config/assets.json';

export interface AssetLoadResult {
  success: boolean;
  loadedAssets: string[];
  failedAssets: string[];
}

export class AssetLoader {
  private loadedAssets: Set<string> = new Set();

  constructor() {}

  async loadAssetsToScene(scene: Phaser.Scene): Promise<AssetLoadResult> {
    const loadedAssets: string[] = [];
    const failedAssets: string[] = [];

    return new Promise((resolve) => {
      scene.load.on('loaderror', (file: { key: string; url: string }) => {
        console.error(`Failed to load asset: ${file.key} from ${file.url}`);
        failedAssets.push(file.key);
      });

      scene.load.on('filecomplete', (_: unknown, key: string) => {
        loadedAssets.push(key);
        this.loadedAssets.add(key);
      });

      scene.load.on('complete', () => {
        this.createAnimationsFromConfig(scene);
        resolve({
          success: failedAssets.length === 0,
          loadedAssets,
          failedAssets
        });
      });

      this.loadCatAssets(scene);
      this.loadToyAssets(scene);

      if (scene.load.totalToLoad === 0) {
        this.createAnimationsFromConfig(scene);
        resolve({
          success: true,
          loadedAssets,
          failedAssets
        });
      } else {
        scene.load.start();
      }
    });
  }

  private loadCatAssets(scene: Phaser.Scene): void {
    for (const catConfig of assetsConfig.cats) {
      catConfig.frames.forEach((frameUrl, index) => {
        const frameKey = `${catConfig.key}_frame_${index}`;
        if (!this.loadedAssets.has(frameKey)) {
          scene.load.image(frameKey, frameUrl);
        }
      });
    }
  }

  private loadToyAssets(scene: Phaser.Scene): void {
    for (const toyConfig of assetsConfig.toys) {
      if (toyConfig.type === 'image' && !this.loadedAssets.has(toyConfig.key)) {
        scene.load.image(toyConfig.key, toyConfig.url);
      }
    }
  }

  private createAnimationsFromConfig(scene: Phaser.Scene): void {
    for (const catConfig of assetsConfig.cats) {
      if (scene.anims.exists(catConfig.key)) {
        continue;
      }

      // 存在するフレームのみを使用
      const validFrames: Array<{ key: string; frame: number }> = [];
      catConfig.frames.forEach((_, index) => {
        const frameKey = `${catConfig.key}_frame_${index}`;
        if (scene.textures.exists(frameKey)) {
          validFrames.push({
            key: frameKey,
            frame: 0
          });
        } else {
          console.warn(`Frame texture not found: ${frameKey}`);
        }
      });

      // 有効なフレームがない場合はスキップ
      if (validFrames.length === 0) {
        console.warn(`No valid frames found for animation: ${catConfig.key}`);
        continue;
      }

      try {
        scene.anims.create({
          key: catConfig.key,
          frames: validFrames,
          frameRate: catConfig.frameRate,
          repeat: -1
        });
      } catch (error) {
        console.error(`Failed to create animation ${catConfig.key}:`, error);
      }
    }
  }

  hasAsset(key: string): boolean {
    return this.loadedAssets.has(key);
  }

  getCatAnimationKeys(): string[] {
    return assetsConfig.cats.map(config => config.key);
  }

  getToyAssetKey(toyType: string): string {
    const toyConfig = assetsConfig.toys.find(toy => toy.key === `toy_${toyType}`);
    return toyConfig?.key || 'toy_ball';
  }

  getFirstCatFrameKey(): string {
    const firstCatConfig = assetsConfig.cats[0];
    return firstCatConfig ? `${firstCatConfig.key}_frame_0` : 'fallback_cat';
  }
}