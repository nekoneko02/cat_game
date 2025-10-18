import { GlobalRegistry } from '@/domain/global/GlobalRegistry';
import { GameTimeManager } from '@/game/GameTimeManager';
import { AssetConfig } from '@/domain/global/AssetConfig';

describe('GlobalRegistry', () => {
  beforeEach(() => {
    // 各テスト前にレジストリをリセット
    GlobalRegistry.resetForTest();
  });

  describe('getInstance', () => {
    it('Singletonインスタンスを取得できること', () => {
      const instance1 = GlobalRegistry.getInstance();
      const instance2 = GlobalRegistry.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getGameTimeManager', () => {
    it('GameTimeManagerを取得できること', () => {
      const registry = GlobalRegistry.getInstance();
      const gtm = registry.getGameTimeManager();

      expect(gtm).toBeInstanceOf(GameTimeManager);
    });

    it('同じGameTimeManagerインスタンスを返すこと', () => {
      const registry = GlobalRegistry.getInstance();
      const gtm1 = registry.getGameTimeManager();
      const gtm2 = registry.getGameTimeManager();

      expect(gtm1).toBe(gtm2);
    });
  });

  describe('getAssetConfig', () => {
    it('AssetConfigを取得できること', () => {
      const registry = GlobalRegistry.getInstance();
      const assetConfig = registry.getAssetConfig();

      expect(assetConfig).toBeInstanceOf(AssetConfig);
    });
  });

  describe('setMockTimeManager', () => {
    it('モックGameTimeManagerを設定できること', () => {
      const registry = GlobalRegistry.getInstance();

      class MockGameTimeManager extends GameTimeManager {
        getDeltaTime(): number {
          return 999;
        }
      }

      const mockGtm = new MockGameTimeManager();
      registry.setMockTimeManager(mockGtm);

      const retrievedGtm = registry.getGameTimeManager();
      expect(retrievedGtm).toBe(mockGtm);
      expect(retrievedGtm.getDeltaTime()).toBe(999);
    });
  });
});
