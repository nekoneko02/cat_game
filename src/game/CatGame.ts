'use client';

import * as Phaser from 'phaser';
import { Cat } from '@/domain/cat/Cat';
import { Toy } from '@/domain/items/toys/Toy';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';
import { UserSessionManager } from '@/lib/UserSessionManager';
import { SessionAction } from '@/domain/user/User';
import { AssetLoader } from '@/lib/AssetLoader';
import { AnimationManager } from '@/lib/AnimationManager';
import { Renderer } from '@/lib/Renderer';
import { InputControls } from '@/lib/InputControls';
import { DebugOverlay } from './DebugOverlay';
import { AnimationCommand } from '@/types/AnimationCommand';
import { GameTimeManager } from './GameTimeManager';
import { GlobalRegistry } from '@/domain/global/GlobalRegistry';
import assetsConfig from '../../public/config/assets.json';
import { logDebug, logError, logWarn, logInfo } from '@/lib/log';

export interface CatGameConfig {
  cat: Cat;
  catName?: string;
}

export default class CatGame extends Phaser.Scene {
  private catSprite!: Phaser.Physics.Arcade.Sprite;
  private toySprite?: Phaser.Physics.Arcade.Sprite;
  private cat!: Cat;
  private toy?: Toy;
  private sessionManager: UserSessionManager;
  private assetLoader: AssetLoader;
  private animationManager: AnimationManager;
  private gameRenderer!: Renderer;
  private inputControls: InputControls;
  private debugOverlay: DebugOverlay | null = null;
  private onBondingChange?: (bonding: number) => void;
  private gameTimeManager!: GameTimeManager;
  private lastBondingLevel: number = 1;
  private bondingDisplay?: Phaser.GameObjects.Group;
  private bondingText?: Phaser.GameObjects.Text;
  private assetsReady: boolean = false;
  private onGameEnd?: () => Promise<void>;

  constructor() {
    super({ key: 'CatGame' });
    logDebug('CatGame: Constructor called');

    this.sessionManager = UserSessionManager.getInstance();
    this.assetLoader = new AssetLoader();
    this.animationManager = new AnimationManager();
    this.inputControls = new InputControls();
  }

  init(data: { cat?: Cat; catName?: string; onGameEnd?: () => Promise<void> }) {
    logDebug('CatGame: init() called', { data });

    // GlobalRegistryから共通のGameTimeManagerを取得
    const globalRegistry = GlobalRegistry.getInstance();
    this.gameTimeManager = globalRegistry.getGameTimeManager();
    this.gameRenderer = new Renderer(this.assetLoader);

    if (data?.cat) {
      logInfo('CatGame: Using cat from repository', {
        bondingLevel: data.cat.getBonding().getLevel(),
        bondingGauge: data.cat.getBonding().getGauge()
      });
      this.cat = data.cat;
    } else {
      const errorMessage = 'ねこの内部状態が取得できないため、ゲームを開始できません';
      logError('CatGame: ' + errorMessage);
      throw new Error(errorMessage);
    }

    this.onGameEnd = data?.onGameEnd;
  }

  async preload() {
    try {
      const result = await this.assetLoader.loadAssetsToScene(this);
      this.assetsReady = result.success;

      if (!result.success && result.failedAssets.length > 0) {
        logWarn('Some assets failed to load', { failedAssets: result.failedAssets });
      }
    } catch (error) {
      logError('Failed to load assets', { error: error instanceof Error ? error.message : String(error) });
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
      logWarn('Using fallback cat sprite');
    }

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

    this.lastBondingLevel = this.cat.getBonding().getLevel();

    // なつき度UIを作成
    this.bondingDisplay = this.gameRenderer.createBondingDisplay(this);
    this.updateBondingDisplay();

    //デバッグ用、商用環境ではOFF
    this.enableDebugOverlay();

    // アイドルアニメーションを開始
    this.executeAnimationSequence([{
      animationKey: 'idle',
      repeat: -1
    }]);
  }

  update() {
    // Catの現在位置を取得
    const catPosition = this.cat.getPosition();

    const externalState = new ExternalState(
      !!this.toy,
      this.toy ? Phaser.Math.Distance.Between(
        catPosition.x,
        catPosition.y,
        this.toy.x,
        this.toy.y
      ) : 0,
      true,
      !!this.toy && this.toy.getState().isMoving
    );


    const toyX = this.toy ? this.toy.x : undefined;
    const toyY = this.toy ? this.toy.y : undefined;
    const actionResult = this.cat.update(externalState, catPosition.x, catPosition.y, toyX, toyY);

    if (actionResult && actionResult.movement) {
      this.executeMovement(actionResult.movement);
    }

    // Catの位置をスプライトに反映
    const newPosition = this.cat.getPosition();
    this.catSprite.setPosition(newPosition.x, newPosition.y);

    // なつき度UIを毎フレーム更新（ゲージは常に変化する可能性があるため）
    this.updateBondingDisplay();

    const bondingLevel = this.cat.getBonding().getLevel();
    if (bondingLevel !== this.lastBondingLevel) {
      this.lastBondingLevel = bondingLevel;
    }

    if (this.debugOverlay) {
      this.debugOverlay.update(this.cat, externalState);
    }

    this.gameTimeManager.update();
  }

  private executeMovement(movement: { deltaX?: number; deltaY?: number; speed?: number; animationCommands: AnimationCommand[]; flipX?: boolean }) {
    // 位置更新はCatが管理し、update()でsetPosition()されるため、ここでは不要

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
        logWarn('Animation not found', { animationKey });
      }
    } catch (error) {
      logError('Error playing animation', { animationKey, error: error instanceof Error ? error.message : String(error) });
    }
  }

  public addToy(toyKey: string) {
    logDebug('CatGame.addToy called', { toyKey });

    if (this.toySprite) {
      this.toySprite.destroy();
    }

    this.toy = Toy.create(toyKey, 400, 300);
    logDebug('Toy created', { haseToy: !!this.toy });

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
    const finalBondingLevel = this.cat.getBonding().getLevel();
    this.sessionManager.endPlaySession(finalBondingLevel);

    if (this.onGameEnd) {
      await this.onGameEnd();
    }
  }

  public getCurrentCatState(): CatGameConfig {
    const currentState = {
      cat: this.cat,
      catName: this.cat.name
    };
    logDebug('CatGame: getCurrentCatState returning', {
      bondingLevel: this.cat.getBonding().getLevel(),
      bondingGauge: this.cat.getBonding().getGauge()
    });
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

    const bonding = this.cat.getBonding();
    const bondingLevel = bonding.getLevel();
    const bondingGauge = bonding.getGauge();
    this.gameRenderer.updateBondingDisplay(this.bondingDisplay, bondingLevel, bondingGauge);
  }

  private enableDebugOverlay(): void {
    if (!this.debugOverlay) {
      this.debugOverlay = new DebugOverlay(this, this.cat);
      // キーボード制御は全てDebugOverlay内で完結
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