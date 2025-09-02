'use client';

import * as Phaser from 'phaser';
import { Cat, Personality, Preferences } from '@/domain/entities/Cat';
import { Toy, ToyType } from '@/domain/entities/Toy';
import { ExternalState } from '@/domain/valueObjects/ExternalState';
import { InternalState } from '@/domain/valueObjects/InternalState';
import { UserSessionManager } from '@/lib/UserSessionManager';
import { SessionAction } from '@/domain/entities/User';
import { AssetManager } from '@/lib/AssetManager';
import { AnimationManager } from '@/lib/AnimationManager';
import { DebugOverlay } from './DebugOverlay';
import { AnimationCommand } from '@/types/AnimationCommand';
import { GameTimeManager } from './GameTimeManager';
import assetsConfig from '../../public/config/assets.json';

export interface CatGameConfig {
  bonding: number;
  playfulness: number;
  fear: number;
  personality: Personality;
  preferences: Preferences;
  catName?: string;
}

export default class CatGame extends Phaser.Scene {
  private catSprite!: Phaser.Physics.Arcade.Sprite;
  private toySprite?: Phaser.Physics.Arcade.Sprite;
  private cat: Cat;
  private toy?: Toy;
  private sessionManager: UserSessionManager;
  private assetManager: AssetManager;
  private animationManager: AnimationManager;
  private debugOverlay: DebugOverlay | null = null;
  private onBondingChange?: (bonding: number) => void;
  private gameTimeManager: GameTimeManager;
  private lastBondingLevel: number = 1;
  private bondingDisplay?: Phaser.GameObjects.Group;
  private bondingText?: Phaser.GameObjects.Text;
  private assetsReady: boolean = false;
  private onGameEnd?: () => Promise<void>;
  
  constructor(config?: { initialCatState?: CatGameConfig; onGameEnd?: () => Promise<void> }) {
    super({ key: 'CatGame' });
    
    if (config?.initialCatState) {
      this.cat = this.createCatFromConfig(config.initialCatState);
    } else {
      this.cat = Cat.createDefault();
    }
    
    this.onGameEnd = config?.onGameEnd;
    this.sessionManager = UserSessionManager.getInstance();
    this.assetManager = AssetManager.getInstance();
    this.animationManager = new AnimationManager();
    this.gameTimeManager = GameTimeManager.getInstance();
  }

  private createCatFromConfig(config: CatGameConfig): Cat {
    const internalState = new InternalState(config.bonding, config.playfulness, config.fear);
    const externalState = ExternalState.createDefault();
    
    return new Cat(
      'cat-' + performance.now(),
      config.catName || 'たぬきねこ',
      internalState,
      externalState,
      config.personality,
      config.preferences,
      0
    );
  }

  preload() {
    this.load.on('loaderror', (file: { key: string; url: string }) => {
      console.error(`Failed to load asset: ${file.key} from ${file.url}`);
    });
    
    
    this.load.on('complete', () => {
      this.createAnimationsFromLoadedAssets();
      this.assetsReady = true;
    });

    this.load.on('filecomplete', () => {
    });

    this.loadAssetsFromManifestSync();
  }

  /**
   * Assets.jsonの設定を同期的に読み込んでアセットを設定
   */
  private loadAssetsFromManifestSync(): void {
    this.assetManager.loadManifest().then(() => {
      
      this.loadDefaultAssetsWithConfigValues();
    }).catch(error => {
      console.error('Failed to load manifest in sync method:', error);
      this.loadDefaultAssetsWithConfigValues();
    });
    
    this.loadDefaultAssetsWithConfigValues();
  }

  /**
   * Configファイルから動的に値を読み出してアセットを読み込み
   */
  private loadDefaultAssetsWithConfigValues(): void {
    // configファイルから猫のアセット設定を取得して読み込み
    for (const catConfig of assetsConfig.cats) {
      // 全てのフレームを個別に読み込み
      catConfig.frames.forEach((frameUrl, index) => {
        const frameKey = `${catConfig.key}_frame_${index}`;
        this.load.image(frameKey, frameUrl);
      });
    }
    
    // おもちゃのアセットも同様に読み込み
    for (const toyConfig of assetsConfig.toys) {
      if (toyConfig.type === 'image') {
        this.load.image(toyConfig.key, toyConfig.url);
      }
    }
  }



  create() {
    this.physics.world.setBounds(0, 0, 800, 600);
    
    // Set camera bounds
    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.setBackgroundColor('#87CEEB');
    
    // Create cat sprite with new asset system
    this.createCatSprite();
    
    this.gameTimeManager.reset();
    
    // Set up mouse interaction
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.toySprite && this.toySprite.active && this.toy) {
        this.toy = this.toy.moveTo(pointer.x, pointer.y);
        this.toySprite.setPosition(pointer.x, pointer.y);
        this.sessionManager.recordAction(SessionAction.mouseMove(pointer.x, pointer.y));
      }
    });
    
    // Set up petting interaction
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const distance = Phaser.Math.Distance.Between(
        this.catSprite.x,
        this.catSprite.y,
        pointer.x,
        pointer.y
      );
      
      if (distance < 60) { // Close enough to pet
        this.cat.petByUser();
        this.sessionManager.recordAction(SessionAction.petCat(pointer.x, pointer.y));
      }
    });
    
    // プレイセッション開始
    this.sessionManager.startPlaySession();
    
    // 初期なつき度を設定
    this.lastBondingLevel = this.cat.getBondingLevel();

    // なつき度UIを作成
    this.createBondingDisplay();
    
    // デバッグオーバーレイを初期化（管理者機能）
    // この行をコメントアウト/コメントインするだけでON/OFF切り替え可能
    this.enableDebugOverlay();
  }

  /**
   * 読み込み完了後にアニメーションを作成（設定ベース）
   */
  private async createAnimationsFromLoadedAssets(): Promise<void> {
    try {
      // 新しい統合設定を使用してアニメーションを作成
      for (const catConfig of assetsConfig.cats) {
        // フレーム配列を作成（Phaserの型に合わせて修正）
        const frames = catConfig.frames.map((_, index) => {
          const frameKey = `${catConfig.key}_frame_${index}`;
          // デバッグ: テクスチャが存在するかチェック
          if (!this.textures.exists(frameKey)) {
            console.warn(`Frame texture not found: ${frameKey}`);
          }
          return {
            key: frameKey,
            frame: 0
          };
        });

        // デフォルトのrepeat設定（無限ループ）
        const defaultRepeat = -1;

        // アニメーションを作成
        this.anims.create({
          key: catConfig.key,
          frames: frames,
          frameRate: catConfig.frameRate,
          repeat: defaultRepeat
        });
        
        // アニメーション作成完了
      }
      
      // アニメーション作成完了
    } catch (error) {
      console.error('Failed to create animations from config:', error);
    }
  }


  /**
   * ねこスプライトを作成（新アセットシステム対応）
   */
  private createCatSprite(): void {
    try {
      // 新しいアセットシステムでは最初のアイドルフレームを使用
      let catTextureKey: string;
      if (this.textures.exists('idle_frame_0')) {
        catTextureKey = 'idle_frame_0';
      } else if (this.textures.exists('cat_idle')) {
        catTextureKey = 'cat_idle';
      } else {
        catTextureKey = 'fallback_cat';
        this.createFallbackCatTexture();
      }
      this.catSprite = this.physics.add.sprite(400, 300, catTextureKey);
      
      // ゲームウィンドウに対する相対的なサイズを計算
      const texture = this.textures.get(catTextureKey);
      const gameHeight = this.sys.game.config.height as number; // ゲーム画面の高さ
      const targetSizeRatio = 0.2; // ゲーム画面高さの8%（小さめに調整）
      const targetSize = gameHeight * targetSizeRatio; // 相対的な目標サイズ
      let scale = 1.0;
      
      if (texture && texture.source && texture.source[0]) {
        const originalWidth = texture.source[0].width;
        const originalHeight = texture.source[0].height;
        // 複数PNG形式では各フレームが個別画像なので、そのままのサイズを使用
        const maxDimension = Math.max(originalWidth, originalHeight);
        scale = targetSize / maxDimension;
        
        // WebGL最大テクスチャサイズをチェック
        if (this.renderer.type === Phaser.WEBGL) {
          const gl = (this.renderer as Phaser.Renderer.WebGL.WebGLRenderer).gl;
          if (gl) {
            const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
            if (originalWidth > maxTextureSize || originalHeight > maxTextureSize) {
              console.warn(`Texture size ${originalWidth}x${originalHeight} exceeds WebGL limit ${maxTextureSize}`);
            }
          }
        }
      }
      
      this.catSprite.setScale(scale);
      this.catSprite.setCollideWorldBounds(true);
      this.catSprite.setBounce(0.1);
      
      // 透過とアンチエイリアシングを有効化
      this.catSprite.setAlpha(1.0);
      if (this.catSprite.texture) {
        this.catSprite.texture.source[0].scaleMode = Phaser.ScaleModes.LINEAR;
      }

      // アイドルアニメーションを開始
      this.executeAnimationSequence([{
        animationKey: 'idle',
        repeat: -1
      }]);
    } catch (error) {
      console.error('Failed to create cat sprite:', error);
      this.createFallbackCatSprite();
    }
  }

  /**
   * フォールバック用のねこテクスチャ作成
   */
  private createFallbackCatTexture(): void {
    if (this.textures.exists('fallback_cat')) {
      return;
    }

    const catGraphics = this.add.graphics();
    catGraphics.fillStyle(0xffa500); // Orange cat
    catGraphics.fillCircle(32, 40, 18); // Body
    catGraphics.fillCircle(32, 25, 12); // Head
    catGraphics.fillTriangle(22, 18, 18, 10, 26, 13); // Left ear
    catGraphics.fillTriangle(42, 18, 38, 13, 46, 10); // Right ear
    catGraphics.fillStyle(0x000000);
    catGraphics.fillCircle(28, 22, 2); // Left eye
    catGraphics.fillCircle(36, 22, 2); // Right eye
    catGraphics.generateTexture('fallback_cat', 64, 64);
    catGraphics.destroy();
  }

  /**
   * フォールバック用のシンプルなねこスプライト作成
   */
  private createFallbackCatSprite(): void {
    this.createFallbackCatTexture();
    this.catSprite = this.physics.add.sprite(400, 300, 'fallback_cat');
    this.catSprite.setScale(1.5);
    this.catSprite.setCollideWorldBounds(true);
    this.catSprite.setBounce(0.1);
  }

  update() {
    const currentTime = Date.now();
    
    // 外部状態を更新
    const externalState = new ExternalState(
      !!this.toy,
      this.toy ? Phaser.Math.Distance.Between(
        this.catSprite.x,
        this.catSprite.y,
        this.toy.x,
        this.toy.y
      ) : 0,
      this.toy ? this.toy.type : null,
      true, // userPresence - ゲーム中は常にtrue
      !!this.toy && this.toy.getState().isMoving
    );
    
    // デバッグ用ログ（最初の数フレームのみ）
    if (currentTime % 1000 < 100) { // 約1秒に1回
      console.log('ExternalState:', {
        toyPresence: !!this.toy,
        toy: this.toy,
        toySprite: this.toySprite,
        assetsReady: this.assetsReady
      });
    }
    
    // Cat entityを更新
    const toyX = this.toy ? this.toy.x : undefined;
    const toyY = this.toy ? this.toy.y : undefined;
    const actionResult = this.cat.update(externalState, this.catSprite.x, this.catSprite.y, toyX, toyY);
    
    // アクション結果に基づいてスプライトを更新
    if (actionResult && actionResult.movement) {
      this.executeMovement(actionResult.movement);
    }
    
    
    // なつき度の変更をチェック（値が変わった時のみ更新）
    const bondingLevel = this.cat.getBondingLevel();
    if (bondingLevel !== this.lastBondingLevel) {
      // Phaser内のUI更新
      this.updateBondingDisplay();
      this.lastBondingLevel = bondingLevel;
    }
    
    // デバッグオーバーレイを更新
    if (this.debugOverlay) {
      this.debugOverlay.update(this.cat, externalState);
    }
    
    this.gameTimeManager.update();
  }


  /**
   * 動作を実行（新しいCatActionシステム対応）
   */
  private executeMovement(movement: { deltaX?: number; deltaY?: number; speed?: number; animationCommands: AnimationCommand[]; flipX?: boolean }) {
    // 移動処理
    if (movement.deltaX !== undefined && movement.deltaY !== undefined) {
      if (movement.deltaX !== 0 || movement.deltaY !== 0) {
        // 移動先の座標を計算
        const targetX = this.catSprite.x + movement.deltaX;
        const targetY = this.catSprite.y + movement.deltaY;
        
        // 時間ベース移動実行
        const pixelsPerSecond = movement.speed || 100;
        const deltaTime = this.gameTimeManager.getDeltaTime();
        const moveDistance = (pixelsPerSecond * deltaTime) / 1000;
        
        if (moveDistance > 0) {
          const angle = Phaser.Math.Angle.Between(this.catSprite.x, this.catSprite.y, targetX, targetY);
          const velocityX = Math.cos(angle) * pixelsPerSecond;
          const velocityY = Math.sin(angle) * pixelsPerSecond;
          this.catSprite.setVelocity(velocityX, velocityY);
        }
      } else {
        // 停止
        this.catSprite.setVelocity(0);
      }
    }

    // イラスト反転処理
    if (movement.flipX !== undefined) {
      this.catSprite.setFlipX(movement.flipX);
    }

    // アニメーション処理
    this.executeAnimationSequence(movement.animationCommands);
  }

  /**
   * アニメーションシーケンスを実行
   */
  private executeAnimationSequence(commands: AnimationCommand[]): void {
    if (commands.length === 0) return;
    
    const command = commands[0];
    this.playAnimationFromConfig(command.animationKey, command.repeat);
  }

  /**
   * Configからアニメーションを再生
   */
  private playAnimationFromConfig(animationKey: string, repeat: number): void {
    // 現在再生中のアニメーションをチェック
    const currentAnim = this.catSprite.anims.currentAnim;
    const currentAnimKey = currentAnim?.key;
    
    // 同じアニメーションが既に再生中の場合は継続（リセットしない）
    if (currentAnimKey === animationKey) {
      return;
    }
    
    // 既にアニメーションが存在する場合はそのまま再生
    if (this.anims.exists(animationKey)) {
      // Phaserでrepeatをオーバーライドして再生
      this.catSprite.play({ key: animationKey, repeat: repeat });
      return;
    }
    
    // configからアニメーション設定を取得して作成
    const config = assetsConfig.cats.find(c => c.key === animationKey);
    if (!config) return;
    
    const frames = config.frames.map((_, index) => ({
      key: `${animationKey}_frame_${index}`,
      frame: 0
    }));
    
    this.anims.create({
      key: animationKey,
      frames: frames,
      frameRate: config.frameRate,
      repeat: repeat
    });
    
    this.catSprite.play({ key: animationKey, repeat: repeat });
  }

  /**
   * 特定のrepeat回数で一時的なアニメーションを作成
   */
  private createTemporaryAnimationWithRepeat(baseAnimationKey: string, repeatCount: number): void {
    const tempKey = `${baseAnimationKey}_repeat_${repeatCount}`;
    
    if (this.anims.exists(tempKey)) {
      this.catSprite.play(tempKey);
      return;
    }

    const catConfig = assetsConfig.cats.find(config => config.key === baseAnimationKey);
    if (!catConfig) return;

    const frames = catConfig.frames.map((_, index) => ({
      key: `${baseAnimationKey}_frame_${index}`,
      frame: 0
    }));

    this.anims.create({
      key: tempKey,
      frames: frames,
      frameRate: catConfig.frameRate,
      repeat: repeatCount
    });
    
    this.catSprite.play(tempKey);
  }


  public addToy(toyType: ToyType) {
    console.log('CatGame.addToy called with:', toyType);
    
    // 既存のおもちゃを削除
    if (this.toySprite) {
      this.toySprite.destroy();
    }
    
    // ドメインエンティティとしてのToyを作成
    this.toy = Toy.create(toyType, 400, 300);
    console.log('Created toy entity:', this.toy);
    
    // アセットが準備できているか確認してからスプライト作成
    if (this.assetsReady) {
      console.log('Assets ready, creating toy sprite');
      this.createToySprite(toyType);
    } else {
      console.log('Assets not ready, waiting...');
      // アセットがまだ準備できていない場合、待機
      const waitForAssets = () => {
        if (this.assetsReady) {
          console.log('Assets now ready, creating toy sprite');
          this.createToySprite(toyType);
        } else {
          this.time.delayedCall(50, waitForAssets);
        }
      };
      waitForAssets();
    }
    
    // セッションにアクションを記録
    this.sessionManager.recordAction(SessionAction.toySelect(toyType));
  }

  /**
   * おもちゃスプライトを作成（新アセットシステム対応）
   */
  private createToySprite(toyType: ToyType): void {
    try {
      // assets.jsonから直接取得（統一的な方法）
      const expectedKey = `toy_${toyType}`;
      const toyConfig = assetsConfig.toys.find(t => t.key === expectedKey);
      const toyAssetKey = toyConfig?.key || 'toy_ball'; // フォールバック
      
      // テクスチャが確実に存在することを確認
      if (!this.textures.exists(toyAssetKey)) {
        this.createFallbackToySprite(toyType);
        return;
      }
      
      // おもちゃスプライト作成
      this.toySprite = this.physics.add.sprite(400, 300, toyAssetKey);
      
      // おもちゃのサイズをゲームウィンドウに対する相対的なサイズで調整
      const toyTexture = this.textures.get(toyAssetKey);
      const gameHeight = this.sys.game.config.height as number;
      const toyTargetSizeRatio = 0.1; // ゲーム画面高さの10%
      const toyTargetSize = gameHeight * toyTargetSizeRatio;
      let toyScale = 1.0;
      
      if (toyTexture && toyTexture.source && toyTexture.source[0]) {
        const toyWidth = toyTexture.source[0].width;
        const toyHeight = toyTexture.source[0].height;
        const toyMaxDimension = Math.max(toyWidth, toyHeight);
        toyScale = toyTargetSize / toyMaxDimension;
      }
      
      this.toySprite.setScale(toyScale);
      this.toySprite.setInteractive();
      this.toySprite.setDepth(10);
      
      // おもちゃの透過とアンチエイリアシングを有効化
      this.toySprite.setAlpha(1.0);
      if (this.toySprite.texture) {
        this.toySprite.texture.source[0].scaleMode = Phaser.ScaleModes.LINEAR;
      }
      
    } catch (error) {
      console.error(`Failed to create toy sprite for ${toyType}:`, error);
      this.createFallbackToySprite(toyType);
    }
  }

  /**
   * フォールバック用のおもちゃスプライト作成
   */
  private createFallbackToySprite(toyType: ToyType): void {
    const fallbackKey = `fallback_toy_${toyType}`;
    
    if (!this.textures.exists(fallbackKey)) {
      this.createFallbackToyTexture(toyType, fallbackKey);
    }
    
    this.toySprite = this.physics.add.sprite(400, 300, fallbackKey);
    this.toySprite.setScale(2);
    this.toySprite.setInteractive();
    this.toySprite.setDepth(10);
  }

  /**
   * フォールバック用のおもちゃテクスチャ作成
   */
  private createFallbackToyTexture(toyType: ToyType, textureKey: string): void {
    const graphics = this.add.graphics();
    const characteristics = this.toy?.getCharacteristics();
    const color = characteristics?.color || 0xff6b6b;
    
    graphics.fillStyle(color);
    
    switch (toyType) {
      case 'ball':
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(12, 12, 3); // highlight
        break;
      case 'feather':
        graphics.fillEllipse(16, 16, 8, 20);
        graphics.fillStyle(0xffffff);
        graphics.fillEllipse(16, 12, 4, 10); // highlight
        break;
      case 'mouse':
        graphics.fillEllipse(16, 16, 16, 10);
        graphics.fillStyle(0x000000);
        graphics.fillCircle(12, 14, 1); // eye
        graphics.fillCircle(20, 14, 1); // eye
        break;
      case 'laser':
        graphics.fillCircle(16, 16, 6);
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 3); // center dot
        break;
      default:
        graphics.fillRect(8, 8, 16, 16);
        break;
    }
    
    graphics.generateTexture(textureKey, 32, 32);
    graphics.destroy();
  }

  public removeToy() {
    if (this.toySprite) {
      this.toySprite.destroy();
      this.toySprite = undefined;
    }
    
    this.toy = undefined;
    
    // セッションにアクションを記録
    this.sessionManager.recordAction(SessionAction.toyRemove());
  }

  /**
   * ゲーム終了時の処理
   */
  public async endGame() {
    const finalBondingLevel = this.cat.getBondingLevel();
    this.sessionManager.endPlaySession(finalBondingLevel);
    
    if (this.onGameEnd) {
      await this.onGameEnd();
    }
  }

  /**
   * 現在の猫の状態をCatGameConfig形式で取得
   */
  public getCurrentCatState(): CatGameConfig {
    const internalState = this.cat.getInternalState();
    return {
      bonding: internalState.bonding,
      playfulness: internalState.playfulness,
      fear: internalState.fear,
      personality: this.cat.personality,
      preferences: this.cat.preferences
    };
  }

  public setBondingCallback(callback: (bonding: number) => void) {
    this.onBondingChange = callback;
  }

  /**
   * ねこエンティティを取得
   */
  public getCat(): Cat {
    return this.cat;
  }
  
  /**
   * 現在のおもちゃを取得
   */
  public getToy(): Toy | undefined {
    return this.toy;
  }

  /**
   * なつき度表示UIを作成
   */
  private createBondingDisplay(): void {
    this.bondingDisplay = this.add.group();
    
    // 背景パネル
    const bg = this.add.rectangle(120, 40, 220, 60, 0x000000, 0.7);
    bg.setStrokeStyle(2, 0xffffff, 0.8);
    this.bondingDisplay.add(bg);
    
    // タイトル
    const title = this.add.text(120, 25, 'なつき度', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.bondingDisplay.add(title);
    
    // ハートアイコンを10個作成
    for (let i = 0; i < 10; i++) {
      const heart = this.add.text(35 + i * 17, 50, '♥', {
        fontSize: '16px',
        color: '#ff69b4'
      }).setOrigin(0.5);
      this.bondingDisplay.add(heart);
    }
    
    // なつき度数値表示
    this.bondingText = this.add.text(120, 65, '1/10', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    this.bondingDisplay.add(this.bondingText);
    
    // UI全体を最前面に表示
    this.bondingDisplay.setDepth(1000);
    
    // 初期表示更新
    this.updateBondingDisplay();
  }

  /**
   * なつき度表示を更新
   */
  private updateBondingDisplay(): void {
    if (!this.bondingDisplay) return;
    
    const bondingLevel = this.cat.getBondingLevel();
    const hearts = this.bondingDisplay.children.entries.filter(child => 
      child instanceof Phaser.GameObjects.Text && child.text === '♥'
    ) as Phaser.GameObjects.Text[];
    
    // ハートの色を更新
    hearts.forEach((heart, index) => {
      if (index < bondingLevel) {
        heart.setColor('#ff69b4'); // ピンク（満たされたハート）
        heart.setAlpha(1.0);
      } else {
        heart.setColor('#666666'); // グレー（空のハート）
        heart.setAlpha(0.5);
      }
    });
    
    // 数値表示を更新
    if (this.bondingText) {
      this.bondingText.setText(`${bondingLevel}/10`);
    }
  }

  /**
   * デバッグオーバーレイを有効化（管理者機能）
   */
  private enableDebugOverlay(): void {
    if (!this.debugOverlay) {
      this.debugOverlay = new DebugOverlay(this);
      
      // キーボードショートカット（D キーでトグル）
      this.input.keyboard?.on('keydown-D', () => {
        if (this.debugOverlay) {
          this.debugOverlay.toggle();
        }
      });
      
      // 初期状態で表示
      this.debugOverlay.setVisible(true);
    }
  }

  /**
   * デバッグオーバーレイを無効化
   */
  private disableDebugOverlay(): void {
    if (this.debugOverlay) {
      this.debugOverlay.destroy();
      this.debugOverlay = null;
    }
  }
}