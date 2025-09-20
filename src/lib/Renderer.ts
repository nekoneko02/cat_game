import * as Phaser from 'phaser';
// ToyType removed - using asset keys directly
import { AssetLoader } from './AssetLoader';

export interface SpriteConfig {
  key: string;
  x: number;
  y: number;
  scale?: number;
  depth?: number;
  interactive?: boolean;
}

export interface RenderResult {
  sprite: Phaser.Physics.Arcade.Sprite;
  success: boolean;
  usedFallback: boolean;
}

export class Renderer {
  private assetLoader: AssetLoader;

  constructor(assetLoader: AssetLoader) {
    this.assetLoader = assetLoader;
  }

  createCatSprite(scene: Phaser.Scene, x: number = 400, y: number = 300): RenderResult {
    let catTextureKey: string;
    let usedFallback = false;

    const firstFrameKey = this.assetLoader.getFirstCatFrameKey();
    if (scene.textures.exists(firstFrameKey)) {
      catTextureKey = firstFrameKey;
    } else if (scene.textures.exists('cat_idle')) {
      catTextureKey = 'cat_idle';
    } else {
      catTextureKey = 'fallback_cat';
      this.createFallbackCatTexture(scene);
      usedFallback = true;
    }

    try {
      const catSprite = scene.physics.add.sprite(x, y, catTextureKey);

      const scale = this.calculateCatScale(scene, catTextureKey);
      catSprite.setScale(scale);
      catSprite.setCollideWorldBounds(true);
      catSprite.setBounce(0.1);
      catSprite.setAlpha(1.0);

      if (catSprite.texture) {
        catSprite.texture.source[0].scaleMode = Phaser.ScaleModes.LINEAR;
      }

      return {
        sprite: catSprite,
        success: true,
        usedFallback
      };
    } catch (error) {
      console.error('Failed to create cat sprite:', error);
      return this.createFallbackCatSprite(scene, x, y);
    }
  }

  createToySprite(scene: Phaser.Scene, toyKey: string, x: number = 400, y: number = 300): RenderResult {
    let usedFallback = false;

    try {
      if (!scene.textures.exists(toyKey)) {
        this.createFallbackToyTexture(scene, toyKey);
        usedFallback = true;
      }

      const toySprite = scene.physics.add.sprite(x, y, usedFallback ? `fallback_${toyKey}` : toyKey);

      const scale = this.calculateToyScale(scene, toySprite.texture);
      toySprite.setScale(scale);
      toySprite.setInteractive();
      toySprite.setDepth(10);
      toySprite.setAlpha(1.0);

      if (toySprite.texture) {
        toySprite.texture.source[0].scaleMode = Phaser.ScaleModes.LINEAR;
      }

      return {
        sprite: toySprite,
        success: true,
        usedFallback
      };
    } catch (error) {
      console.error(`Failed to create toy sprite for ${toyKey}:`, error);
      return this.createFallbackToySprite(scene, toyKey, x, y);
    }
  }

  createBondingDisplay(scene: Phaser.Scene): Phaser.GameObjects.Group {
    const bondingDisplay = scene.add.group();

    const bg = scene.add.rectangle(120, 40, 220, 60, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0xffffff, 0.8);
    bondingDisplay.add(bg);

    const title = scene.add.text(120, 25, 'なつき度', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    bondingDisplay.add(title);

    for (let i = 0; i < 10; i++) {
      // ハート画像が利用可能な場合は画像を使用、そうでなければテキストを使用
      let heart: Phaser.GameObjects.GameObject;
      if (scene.textures.exists('game_heart_small')) {
        heart = scene.add.image(35 + i * 17, 50, 'game_heart_small').setOrigin(0.5);
        heart.setScale(0.5); // アイコンサイズを調整
        heart.setTint(0xff69b4); // ピンク色に着色
      } else {
        heart = scene.add.text(35 + i * 17, 50, '♡', {
          fontSize: '16px',
          color: '#ff69b4'
        }).setOrigin(0.5);
      }
      bondingDisplay.add(heart);
    }

    const bondingText = scene.add.text(120, 65, '1/10', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    bondingDisplay.add(bondingText);

    bondingDisplay.setDepth(1000);

    return bondingDisplay;
  }

  updateBondingDisplay(bondingDisplay: Phaser.GameObjects.Group, bondingLevel: number): void {
    // ハート要素を取得（画像またはテキスト）
    const hearts = bondingDisplay.children.entries.filter(child => {
      if (child instanceof Phaser.GameObjects.Image && child.texture.key === 'game_heart_small') {
        return true;
      }
      if (child instanceof Phaser.GameObjects.Text && child.text === '♡') {
        return true;
      }
      return false;
    });

    hearts.forEach((heart, index) => {
      if (index < bondingLevel) {
        if (heart instanceof Phaser.GameObjects.Image) {
          heart.setTint(0xff69b4); // ピンク色
          heart.setAlpha(1.0);
        } else if (heart instanceof Phaser.GameObjects.Text) {
          heart.setColor('#ff69b4');
          heart.setAlpha(1.0);
        }
      } else {
        if (heart instanceof Phaser.GameObjects.Image) {
          heart.setTint(0x666666); // グレー色
          heart.setAlpha(0.5);
        } else if (heart instanceof Phaser.GameObjects.Text) {
          heart.setColor('#666666');
          heart.setAlpha(0.5);
        }
      }
    });

    const bondingText = bondingDisplay.children.entries.find(child =>
      child instanceof Phaser.GameObjects.Text && child.text.includes('/')
    ) as Phaser.GameObjects.Text;

    if (bondingText) {
      bondingText.setText(`${bondingLevel}/10`);
    }
  }

  private calculateCatScale(scene: Phaser.Scene, textureKey: string): number {
    const texture = scene.textures.get(textureKey);
    const gameHeight = scene.sys.game.config.height as number;
    const targetSizeRatio = 0.2;
    const targetSize = gameHeight * targetSizeRatio;
    let scale = 1.0;

    if (texture && texture.source && texture.source[0]) {
      const originalWidth = texture.source[0].width;
      const originalHeight = texture.source[0].height;
      const maxDimension = Math.max(originalWidth, originalHeight);
      scale = targetSize / maxDimension;
    }

    return scale;
  }

  private calculateToyScale(scene: Phaser.Scene, texture: Phaser.Textures.Texture): number {
    const gameHeight = scene.sys.game.config.height as number;
    const toyTargetSizeRatio = 0.1;
    const toyTargetSize = gameHeight * toyTargetSizeRatio;
    let toyScale = 1.0;

    if (texture && texture.source && texture.source[0]) {
      const toyWidth = texture.source[0].width;
      const toyHeight = texture.source[0].height;
      const toyMaxDimension = Math.max(toyWidth, toyHeight);
      toyScale = toyTargetSize / toyMaxDimension;
    }

    return toyScale;
  }

  private createFallbackCatTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists('fallback_cat')) {
      return;
    }

    const catGraphics = scene.add.graphics();
    catGraphics.fillStyle(0xffa500);
    catGraphics.fillCircle(32, 40, 18);
    catGraphics.fillCircle(32, 25, 12);
    catGraphics.fillTriangle(22, 18, 18, 10, 26, 13);
    catGraphics.fillTriangle(42, 18, 38, 13, 46, 10);
    catGraphics.fillStyle(0x000000);
    catGraphics.fillCircle(28, 22, 2);
    catGraphics.fillCircle(36, 22, 2);
    catGraphics.generateTexture('fallback_cat', 64, 64);
    catGraphics.destroy();
  }

  private createFallbackToyTexture(scene: Phaser.Scene, toyKey: string): void {
    const fallbackKey = `fallback_${toyKey}`;

    if (scene.textures.exists(fallbackKey)) {
      return;
    }

    const graphics = scene.add.graphics();
    const color = 0xff6b6b;

    graphics.fillStyle(color);

    if (toyKey.includes('ball')) {
      graphics.fillCircle(16, 16, 12);
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(12, 12, 3);
    } else if (toyKey.includes('feather')) {
      graphics.fillEllipse(16, 16, 8, 20);
      graphics.fillStyle(0xffffff);
      graphics.fillEllipse(16, 12, 4, 10);
    } else if (toyKey.includes('mouse')) {
      graphics.fillEllipse(16, 16, 16, 10);
      graphics.fillStyle(0x000000);
      graphics.fillCircle(12, 14, 1);
      graphics.fillCircle(20, 14, 1);
    } else if (toyKey.includes('laser')) {
      graphics.fillCircle(16, 16, 6);
      graphics.fillStyle(0xffffff);
      graphics.fillCircle(16, 16, 3);
    } else {
      graphics.fillRect(8, 8, 16, 16);
    }

    graphics.generateTexture(fallbackKey, 32, 32);
    graphics.destroy();
  }

  private createFallbackCatSprite(scene: Phaser.Scene, x: number, y: number): RenderResult {
    this.createFallbackCatTexture(scene);
    const catSprite = scene.physics.add.sprite(x, y, 'fallback_cat');
    catSprite.setScale(1.5);
    catSprite.setCollideWorldBounds(true);
    catSprite.setBounce(0.1);

    return {
      sprite: catSprite,
      success: true,
      usedFallback: true
    };
  }

  private createFallbackToySprite(scene: Phaser.Scene, toyKey: string, x: number, y: number): RenderResult {
    const fallbackKey = `fallback_${toyKey}`;
    this.createFallbackToyTexture(scene, toyKey);

    const toySprite = scene.physics.add.sprite(x, y, fallbackKey);
    toySprite.setScale(2);
    toySprite.setInteractive();
    toySprite.setDepth(10);

    return {
      sprite: toySprite,
      success: true,
      usedFallback: true
    };
  }
}