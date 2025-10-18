import { GameTimeManager } from '@/game/GameTimeManager';
import { AssetConfig } from '@/domain/global/AssetConfig';

/**
 * グローバルレジストリ
 *
 * グローバルに共有されるサービスへのアクセスポイントを提供するSingleton。
 * テスト時にはモックオブジェクトに差し替え可能。
 *
 * @package Global
 */
export class GlobalRegistry {
  private static instance: GlobalRegistry | null = null;
  private gameTimeManager: GameTimeManager;
  private assetConfig: AssetConfig;

  private constructor() {
    this.gameTimeManager = new GameTimeManager();
    this.assetConfig = new AssetConfig();
  }

  static getInstance(): GlobalRegistry {
    if (!GlobalRegistry.instance) {
      GlobalRegistry.instance = new GlobalRegistry();
    }
    return GlobalRegistry.instance;
  }

  /**
   * GameTimeManagerを取得
   */
  getGameTimeManager(): GameTimeManager {
    return this.gameTimeManager;
  }

  /**
   * AssetConfigを取得
   */
  getAssetConfig(): AssetConfig {
    return this.assetConfig;
  }

  /**
   * テスト用: モックGameTimeManagerを設定
   *
   * @param mock - モックGameTimeManager
   */
  setMockTimeManager(mock: GameTimeManager): void {
    this.gameTimeManager = mock;
  }

  /**
   * テスト用: レジストリをリセット
   *
   * @internal テスト専用
   */
  static resetForTest(): void {
    GlobalRegistry.instance = null;
  }
}
