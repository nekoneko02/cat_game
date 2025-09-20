'use client';

import * as Phaser from 'phaser';
import { Cat, Personality, Preferences } from '@/domain/entities/Cat';
import { Toy } from '@/domain/entities/Toy';
import { ExternalState } from '@/domain/valueObjects/ExternalState';
import { InternalState } from '@/domain/valueObjects/InternalState';
import { UserSessionManager } from '@/lib/UserSessionManager';
import { SessionAction } from '@/domain/entities/User';
import { AssetLoader } from '@/lib/AssetLoader';
import { AnimationManager } from '@/lib/AnimationManager';
import { Renderer } from '@/lib/Renderer';
import { InputControls } from '@/lib/InputControls';
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
  private assetLoader: AssetLoader;
  private animationManager: AnimationManager;
  private gameRenderer: Renderer;
  private inputControls: InputControls;
  private debugOverlay: DebugOverlay | null = null;
  private onBondingChange?: (bonding: number) => void;
  private gameTimeManager: GameTimeManager;
  private lastBondingLevel: number = 1;
  private bondingDisplay?: Phaser.GameObjects.Group;
  private bondingText?: Phaser.GameObjects.Text;
  private assetsReady: boolean = false;
  private onGameEnd?: () => Promise<void>;

  constructor() {
    super({ key: 'CatGame' });
    console.log('CatGame: Constructor called');

    // 基本的なマネージャーのみ初期化（猫の初期化はinit()で行う）
    this.sessionManager = UserSessionManager.getInstance();
    this.assetLoader = new AssetLoader();
    this.animationManager = new AnimationManager();
    this.inputControls = new InputControls();
  }

  init(data: { initialCatState?: any; catName?: string; onGameEnd?: () => Promise<void> }) {
    console.log('CatGame: init() called with data:', data);

    // GameTimeManagerを作成
    this.gameTimeManager = new GameTimeManager();
    this.gameRenderer = new Renderer(this.assetLoader);

    if (data?.initialCatState) {
      console.log('CatGame: Using initial cat state:', data.initialCatState);
      this.cat = this.createCatFromConfig(data.initialCatState, data.catName);
      console.log('CatGame: Created cat with loaded state. Bonding:', this.cat.getInternalState().bonding);
    } else {
      // ユースケースに従い、猫状態が取得できない場合はエラーとする
      const errorMessage = 'ねこの内部状態が取得できないため、ゲームを開始できません';
      console.error('CatGame: ' + errorMessage);
      throw new Error(errorMessage);
    }

    this.onGameEnd = data?.onGameEnd;
  }

  private createCatFromConfig(config: CatGameConfig, catName?: string): Cat {
    const internalState = new InternalState(config.bonding, config.playfulness, config.fear);
    const externalState = ExternalState.createDefault();

    return new Cat(
      'cat-' + performance.now(),
      catName || config.catName || 'たぬきねこ',
      internalState,
      externalState,
      config.personality,
      config.preferences,
      0,
      this.gameTimeManager
    );
  }

  async preload() {
    try {
      const result = await this.assetLoader.loadAssetsToScene(this);
      this.assetsReady = result.success;

      if (!result.success && result.failedAssets.length > 0) {
        console.warn('Some assets failed to load:', result.failedAssets);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      this.assetsReady = false;
    }
  }

  create() {
    this.physics.world.setBounds(0, 0, 800, 600);

    this.cameras.main.setBounds(0, 0, 800, 600);
    this.cameras.main.setBackgroundColor('#87CEEB');

    // Create cat sprite using Renderer
    const catResult = this.gameRenderer.createCatSprite(this, 400, 300);
    this.catSprite = catResult.sprite;

    if (catResult.usedFallback) {
      console.warn('Using fallback cat sprite');
    }

    this.gameTimeManager.reset();

    // Set up input controls
    this.inputControls.setupMouseControls(
      this,
      this.catSprite,
      this.toySprite,
      this.cat,
      this.toy,
      {
        onToyMove: (x, y) => {
          if (this.toy) {
            this.toy = this.toy.moveTo(x, y);
          }
        },
        onPetCat: (_x, _y) => {
          // Additional petting logic can be added here
        }
      }
    );

    this.sessionManager.startPlaySession();

    this.lastBondingLevel = this.cat.getBondingLevel();

    // なつき度UIを作成
    this.bondingDisplay = this.gameRenderer.createBondingDisplay(this);
    this.updateBondingDisplay();

    this.enableDebugOverlay();

    // アイドルアニメーションを開始
    this.executeAnimationSequence([{
      animationKey: 'idle',
      repeat: -1
    }]);
  }

  update() {
    const currentTime = Date.now();

    const externalState = new ExternalState(
      !!this.toy,
      this.toy ? Phaser.Math.Distance.Between(
        this.catSprite.x,
        this.catSprite.y,
        this.toy.x,
        this.toy.y
      ) : 0,
      true,
      !!this.toy && this.toy.getState().isMoving
    );


    const toyX = this.toy ? this.toy.x : undefined;
    const toyY = this.toy ? this.toy.y : undefined;
    const actionResult = this.cat.update(externalState, this.catSprite.x, this.catSprite.y, toyX, toyY);

    if (actionResult && actionResult.movement) {
      this.executeMovement(actionResult.movement);
    }

    const bondingLevel = this.cat.getBondingLevel();
    if (bondingLevel !== this.lastBondingLevel) {
      this.updateBondingDisplay();
      this.lastBondingLevel = bondingLevel;
    }

    if (this.debugOverlay) {
      this.debugOverlay.update(this.cat, externalState);
    }

    this.gameTimeManager.update();
  }

  private executeMovement(movement: { deltaX?: number; deltaY?: number; speed?: number; animationCommands: AnimationCommand[]; flipX?: boolean }) {
    if (movement.deltaX !== undefined && movement.deltaY !== undefined) {
      if (movement.deltaX !== 0 || movement.deltaY !== 0) {
        const targetX = this.catSprite.x + movement.deltaX;
        const targetY = this.catSprite.y + movement.deltaY;

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
        this.catSprite.setVelocity(0);
      }
    }

    if (movement.flipX !== undefined) {
      this.catSprite.setFlipX(movement.flipX);
    }

    this.executeAnimationSequence(movement.animationCommands);
  }

  private executeAnimationSequence(commands: AnimationCommand[]): void {
    if (commands.length === 0) return;

    const command = commands[0];
    this.playAnimationFromConfig(command.animationKey, command.repeat);
  }

  private playAnimationFromConfig(animationKey: string, repeat: number): void {
    try {
      const currentAnim = this.catSprite.anims.currentAnim;
      const currentAnimKey = currentAnim?.key;

      if (currentAnimKey === animationKey) {
        return;
      }

      if (this.anims.exists(animationKey)) {
        this.catSprite.play(animationKey, true);
      } else {
        console.warn(`Animation not found: ${animationKey}`);
      }
    } catch (error) {
      console.error(`Error playing animation ${animationKey}:`, error);
    }
  }

  public addToy(toyKey: string) {
    console.log('CatGame.addToy called with toyKey:', toyKey);

    if (this.toySprite) {
      this.toySprite.destroy();
    }

    this.toy = Toy.create(toyKey, 400, 300);
    console.log('Toy created:', !!this.toy);

    if (this.assetsReady && this.textures.exists(toyKey)) {
      this.createToySprite(toyKey);
    } else {
      if (!this.assetsReady) {
        this.assetLoader.loadAssetsToScene(this).then((result) => {
          this.assetsReady = result.success;
          if (this.assetsReady && this.textures.exists(toyKey)) {
            this.createToySprite(toyKey);
          }
        });
      }

      const waitForAssets = () => {
        if (this.assetsReady && this.textures.exists(toyKey)) {
          this.createToySprite(toyKey);
        } else {
          this.time.delayedCall(100, waitForAssets);
        }
      };
      waitForAssets();
    }

    this.sessionManager.recordAction(SessionAction.toySelect(toyKey));
  }

  private createToySprite(toyKey: string) {
    if (!this.toy) {
      return;
    }

    const toyResult = this.gameRenderer.createToySprite(this, toyKey, 400, 300);
    this.toySprite = toyResult.sprite;

    // Update input controls with new toy
    this.inputControls.setupMouseControls(
      this,
      this.catSprite,
      this.toySprite,
      this.cat,
      this.toy,
      {
        onToyMove: (x, y) => {
          if (this.toy) {
            this.toy = this.toy.moveTo(x, y);
          }
        }
      }
    );
  }

  public removeToy() {
    if (this.toySprite) {
      this.toySprite.destroy();
      this.toySprite = undefined;
    }

    this.toy = undefined;

    this.sessionManager.recordAction(SessionAction.toyRemove());
  }

  public async endGame() {
    const finalBondingLevel = this.cat.getBondingLevel();
    this.sessionManager.endPlaySession(finalBondingLevel);

    if (this.onGameEnd) {
      await this.onGameEnd();
    }
  }

  public getCurrentCatState(): CatGameConfig {
    const internalState = this.cat.getInternalState();
    const currentState = {
      bonding: internalState.bonding,
      playfulness: internalState.playfulness,
      fear: internalState.fear,
      personality: this.cat.personality,
      preferences: this.cat.preferences
    };
    console.log('CatGame: getCurrentCatState returning:', currentState);
    return currentState;
  }

  public setBondingCallback(callback: (bonding: number) => void) {
    this.onBondingChange = callback;
  }

  public getCat(): Cat {
    return this.cat;
  }

  public getToy(): Toy | undefined {
    return this.toy;
  }

  private updateBondingDisplay(): void {
    if (!this.bondingDisplay) return;

    const bondingLevel = this.cat.getBondingLevel();
    this.gameRenderer.updateBondingDisplay(this.bondingDisplay, bondingLevel);
  }

  private enableDebugOverlay(): void {
    if (!this.debugOverlay) {
      this.debugOverlay = new DebugOverlay(this);

      this.input.keyboard?.on('keydown-D', () => {
        if (this.debugOverlay) {
          this.debugOverlay.toggle();
        }
      });

      this.debugOverlay.setVisible(true);
    }
  }

  private disableDebugOverlay(): void {
    if (this.debugOverlay) {
      this.debugOverlay.destroy();
      this.debugOverlay = null;
    }
  }
}