import { BondingUpdaterLv1 } from '@/domain/cat/catAI/bonding/updaters/BondingUpdaterLv1';
import { BondingLevel } from '@/domain/cat/catAI/bonding/BondingLevel';
import { BondingGauge } from '@/domain/cat/catAI/bonding/BondingGauge';
import { GlobalRegistry } from '@/domain/global/GlobalRegistry';

// モックGameTimeManager
class MockGameTimeManager {
  private totalTime: number = 0;

  getGameTime(): number {
    return this.totalTime;
  }

  update(time: number): void {
    this.totalTime = time;
  }

  getDeltaTime(): number {
    return 0;
  }

  reset(): void {
    this.totalTime = 0;
  }

  pause(): void {}
  resume(): void {}
  setTimeScale(_scale: number): void {}
  isPausedState(): boolean {
    return false;
  }
}

describe('BondingUpdaterLv1', () => {
  let mockTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockTimeManager = new MockGameTimeManager();
    GlobalRegistry.getInstance().setMockTimeManager(mockTimeManager as any);
  });

  afterEach(() => {
    GlobalRegistry.resetForTest();
  });

  describe('updateByTime', () => {
    it('初期ゲージ0、0秒経過: ゲージは0のまま', () => {
      mockTimeManager.update(0);
      const updater = new BondingUpdaterLv1(0, 0);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0);

      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBe(0);
    });

    it('初期ゲージ0、30秒経過: ゲージは0.5', () => {
      const initialGauge = 0;
      const createdAt = 0;
      const currentTime = 30000; // 30秒
      mockTimeManager.update(currentTime);

      const updater = new BondingUpdaterLv1(initialGauge, createdAt);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0);

      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBeCloseTo(0.5, 2);
    });

    it('初期ゲージ0、60秒経過: ゲージは1.0', () => {
      const initialGauge = 0;
      const createdAt = 0;
      const currentTime = 60000; // 60秒
      mockTimeManager.update(currentTime);

      const updater = new BondingUpdaterLv1(initialGauge, createdAt);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0);

      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBe(1.0);
    });

    it('初期ゲージ0、90秒経過: ゲージは1.0（上限）', () => {
      const initialGauge = 0;
      const createdAt = 0;
      const currentTime = 90000; // 90秒
      mockTimeManager.update(currentTime);

      const updater = new BondingUpdaterLv1(initialGauge, createdAt);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0);

      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBe(1.0);
    });

    it('途中の時刻から作成された場合も正しく動作する', () => {
      const initialGauge = 0;
      const createdAt = 10000; // 10秒時点で作成
      const currentTime = 40000; // 40秒時点（作成から30秒経過）
      mockTimeManager.update(currentTime);

      const updater = new BondingUpdaterLv1(initialGauge, createdAt);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0);

      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBeCloseTo(0.5, 2); // 30秒経過 = 0.5
    });

    it('保存されたゲージ値0.5から再開: 30秒経過で1.0になる', () => {
      const initialGauge = 0.5; // 保存されていたゲージ値
      const createdAt = 0;
      mockTimeManager.update(createdAt);

      const updater = new BondingUpdaterLv1(initialGauge, createdAt);
      const level = new BondingLevel(1);
      const gauge = new BondingGauge(0.5);

      // 30秒経過
      mockTimeManager.update(30000);
      const newGauge = updater.updateByTime(level, gauge);

      expect(newGauge.getValue()).toBe(1.0); // 0.5 + 0.5 = 1.0
    });
  });
});
