import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
import { BondingUpdateNotification } from '@/domain/cat/catAI/bonding/BondingUpdateNotification';
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

describe('Bonding', () => {
  let mockTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockTimeManager = new MockGameTimeManager();
    GlobalRegistry.getInstance().setMockTimeManager(mockTimeManager as any);
  });

  afterEach(() => {
    GlobalRegistry.resetForTest();
  });

  describe('constructor and getters', () => {
    it('なつき度を初期化できる', () => {
      const bonding = new Bonding(3, 0.5);

      expect(bonding.getLevel()).toBe(3);
      expect(bonding.getGauge()).toBe(0.5);
    });
  });

  describe('update', () => {
    it('アクション実行による更新（デフォルトでは変化なし）', () => {
      const bonding = new Bonding(1, 0.3);
      const notification = new BondingUpdateNotification('sit');

      bonding.update(notification);

      // デフォルト実装では変化なし
      expect(bonding.getGauge()).toBe(0.3);
    });
  });

  describe('updateByTime', () => {
    it('Lv1で時間経過により自動的にゲージが上昇する', () => {
      mockTimeManager.update(0);
      const bonding = new Bonding(1, 0);

      // 30秒経過
      mockTimeManager.update(30000);
      bonding.updateByTime();

      expect(bonding.getGauge()).toBeCloseTo(0.5, 2);
    });

    it('Lv1で60秒経過するとゲージが1.0になる', () => {
      mockTimeManager.update(0);
      const bonding = new Bonding(1, 0);

      // 60秒経過
      mockTimeManager.update(60000);
      bonding.updateByTime();

      expect(bonding.getGauge()).toBe(1.0);
    });
  });

  describe('levelUp', () => {
    it('レベルアップするとレベルが1つ上がり、ゲージが0にリセットされる', () => {
      mockTimeManager.update(0);
      const bonding = new Bonding(1, 0.8);

      bonding.levelUp();

      expect(bonding.getLevel()).toBe(2);
      expect(bonding.getGauge()).toBe(0);
    });

    it('レベルアップ後は新しいレベルのBondingUpdaterが設定される', () => {
      mockTimeManager.update(0);
      const bonding = new Bonding(1, 0.8);

      bonding.levelUp();

      // Lv2のupdaterは現在デフォルト実装なので、updateByTimeで変化なし
      bonding.updateByTime();
      expect(bonding.getGauge()).toBe(0); // 変化なし
    });
  });

  describe('isGaugeFull', () => {
    it('ゲージが1.0の場合trueを返す', () => {
      const bonding = new Bonding(1, 1.0);
      expect(bonding.isGaugeFull()).toBe(true);
    });

    it('ゲージが1.0未満の場合falseを返す', () => {
      const bonding = new Bonding(1, 0.99);
      expect(bonding.isGaugeFull()).toBe(false);
    });
  });

  describe('統合テスト: レベルアップシナリオ', () => {
    it('Lv1で60秒経過→レベルアップ→Lv2になる', () => {
      mockTimeManager.update(0);
      const bonding = new Bonding(1, 0);

      // 60秒経過
      mockTimeManager.update(60000);
      bonding.updateByTime();

      expect(bonding.isGaugeFull()).toBe(true);

      // レベルアップ
      bonding.levelUp();

      expect(bonding.getLevel()).toBe(2);
      expect(bonding.getGauge()).toBe(0);
    });
  });
});
