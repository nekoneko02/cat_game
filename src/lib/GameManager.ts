import * as Phaser from 'phaser';
import { PhaserGame, CatGameScene } from '@/types/game';
import { CatState } from './session';
import { StateSaver } from './StateSaver';
import { logDebug, logError, logInfo } from './log';

export interface GameConfig {
  initialCatState?: CatState;
  catName?: string;
  onGameEnd?: () => Promise<void>;
}

export interface GameManagerCallbacks {
  onGameReady?: (game: PhaserGame) => void;
  onGameStart?: () => void;
  onGameEnd?: () => void;
  onStateChange?: (state: GameState) => void;
}

export enum GameState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDING = 'ending',
  ERROR = 'error'
}

export class GameManager {
  private phaserGame: PhaserGame | null = null;
  private currentState: GameState = GameState.IDLE;
  private gameConfig: GameConfig | null = null;
  private callbacks: GameManagerCallbacks = {};
  private stateSaver: StateSaver;

  constructor() {
    this.stateSaver = new StateSaver();
  }

  async startGame(
    parentElement: HTMLElement,
    config: GameConfig = {},
    callbacks: GameManagerCallbacks = {}
  ): Promise<boolean> {
    try {
      this.setState(GameState.LOADING);
      this.gameConfig = config;
      this.callbacks = callbacks;

      await this.destroyExistingGame();

      const phaserConfig = this.createPhaserConfig(parentElement, config);
      this.phaserGame = new Phaser.Game(phaserConfig) as PhaserGame;

      const CatGameClass = await this.loadCatGameScene();
      const sceneManager = this.phaserGame.scene as Phaser.Scenes.SceneManager;

      // 既存のシーンが存在する場合は削除
      if (sceneManager.getScene('CatGame')) {
        sceneManager.remove('CatGame');
      }

      logDebug('GameManager: Starting game with config', { config });

      // Sceneを追加（configはコンストラクタには渡さない）
      sceneManager.add('CatGame', CatGameClass, false);

      // Scene.init(data)でデータを渡してからstart
      const initData = {
        initialCatState: config.initialCatState,
        catName: config.catName,
        onGameEnd: this.handleGameEnd.bind(this)
      };

      logDebug('GameManager: Starting scene with data', { initData });
      sceneManager.start('CatGame', initData);

      this.setState(GameState.PLAYING);

      if (this.callbacks.onGameReady) {
        this.callbacks.onGameReady(this.phaserGame);
      }

      if (this.callbacks.onGameStart) {
        this.callbacks.onGameStart();
      }

      this.setupGameEndHandlers();

      return true;
    } catch (error) {
      logError('Failed to start game', { error: error instanceof Error ? error.message : String(error) });
      this.setState(GameState.ERROR);
      return false;
    }
  }

  async endGame(): Promise<void> {
    if (this.currentState === GameState.ENDING || this.currentState === GameState.IDLE) {
      return;
    }

    this.setState(GameState.ENDING);

    try {
      await this.saveCurrentGameState();

      const scene = this.getGameScene();
      if (scene && 'endGame' in scene) {
        await (scene as unknown as { endGame: () => Promise<void> }).endGame();
      }

      if (this.callbacks.onGameEnd) {
        this.callbacks.onGameEnd();
      }

      await this.destroyExistingGame();
      this.setState(GameState.IDLE);
    } catch (error) {
      logError('Error ending game', { error: error instanceof Error ? error.message : String(error) });
      this.setState(GameState.ERROR);
    }
  }

  pauseGame(): void {
    if (this.currentState !== GameState.PLAYING) return;

    if (this.phaserGame) {
      (this.phaserGame.scene as Phaser.Scenes.SceneManager).pause('CatGame');
      this.setState(GameState.PAUSED);
    }
  }

  resumeGame(): void {
    if (this.currentState !== GameState.PAUSED) return;

    if (this.phaserGame) {
      (this.phaserGame.scene as Phaser.Scenes.SceneManager).resume('CatGame');
      this.setState(GameState.PLAYING);
    }
  }

  addToyToGame(toyKey: string): boolean {
    const scene = this.getGameScene();
    logDebug('GameManager.addToyToGame called', { toyKey, hasScene: !!scene, hasAddToyMethod: scene && 'addToy' in scene });

    if (scene && 'addToy' in scene) {
      (scene as unknown as { addToy: (key: string) => void }).addToy(toyKey);
      logInfo('Successfully called addToy on scene', { toyKey });
      return true;
    }
    logDebug('Failed to add toy to game', { toyKey, hasScene: !!scene });
    return false;
  }

  removeToyFromGame(): boolean {
    const scene = this.getGameScene();
    if (scene && 'removeToy' in scene) {
      (scene as unknown as { removeToy: () => void }).removeToy();
      return true;
    }
    return false;
  }

  getCurrentCatState(): CatState | null {
    const scene = this.getGameScene();
    if (scene && 'getCurrentCatState' in scene) {
      return (scene as unknown as { getCurrentCatState: () => CatState }).getCurrentCatState();
    }
    return null;
  }

  getGameState(): GameState {
    return this.currentState;
  }

  isGameActive(): boolean {
    return this.currentState === GameState.PLAYING || this.currentState === GameState.PAUSED;
  }

  getGame(): PhaserGame | null {
    return this.phaserGame;
  }

  private async destroyExistingGame(): Promise<void> {
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
    }
  }

  private async loadCatGameScene(): Promise<typeof import('@/game/CatGame').default> {
    const { default: CatGame } = await import('@/game/CatGame');
    return CatGame;
  }

  private createPhaserConfig(parentElement: HTMLElement, config: GameConfig): Phaser.Types.Core.GameConfig {
    return {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: parentElement,
      backgroundColor: '#87CEEB',
      render: {
        antialias: true,
        pixelArt: false,
        transparent: false,
        clearBeforeRender: true,
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        powerPreference: 'default',
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
    };
  }

  private getGameScene(): CatGameScene | null {
    if (!this.phaserGame) return null;
    return this.phaserGame.scene.getScene('CatGame');
  }

  private setState(newState: GameState): void {
    if (this.currentState !== newState) {
      this.currentState = newState;
      if (this.callbacks.onStateChange) {
        this.callbacks.onStateChange(newState);
      }
    }
  }

  private async handleGameEnd(): Promise<void> {
    if (this.gameConfig?.onGameEnd) {
      await this.gameConfig.onGameEnd();
    }
  }

  private setupGameEndHandlers(): void {
    if (typeof window === 'undefined') return;

    const handleBeforeUnload = async () => {
      await this.saveCurrentGameState();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // クリーンアップ関数を保存
    (this as unknown as { _removeBeforeUnload?: () => void })._removeBeforeUnload = () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }

  private async saveCurrentGameState(): Promise<void> {
    try {
      const currentState = this.getCurrentCatState();
      if (currentState) {
        const catState: CatState = currentState;

        await this.stateSaver.saveGameEnd(catState);
      }
    } catch (error) {
      logError('Failed to save game state', { error: error instanceof Error ? error.message : String(error) });
    }
  }

  destroy(): void {
    this.destroyExistingGame();
    this.setState(GameState.IDLE);
    this.callbacks = {};
    this.gameConfig = null;

    const cleanupFn = (this as unknown as { _removeBeforeUnload?: () => void })._removeBeforeUnload;
    if (cleanupFn) {
      cleanupFn();
    }
  }
}