import { Cat, Personality, Preferences } from '@/domain/cat/Cat';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';
import { GameTimeManager } from '@/game/GameTimeManager';

// GameTimeManagerのモック
class MockGameTimeManager extends GameTimeManager {
  private mockDeltaTime: number = 0;
  private mockTotalTime: number = 0;

  setDeltaTime(deltaTime: number): void {
    this.mockDeltaTime = deltaTime;
  }

  setTotalTime(totalTime: number): void {
    this.mockTotalTime = totalTime;
  }

  getDeltaTime(): number {
    return this.mockDeltaTime;
  }

  getTotalTime(): number {
    return this.mockTotalTime;
  }

  update(deltaTime: number): void {
    this.mockDeltaTime = deltaTime;
    this.mockTotalTime += deltaTime;
  }
}

describe('Cat', () => {
  let cat: Cat;
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67); // 60FPS想定
    mockGameTimeManager.setTotalTime(0);
    cat = Cat.createDefault('テスト猫', mockGameTimeManager);
  });

  describe('createDefault', () => {
    it('デフォルト値でCatインスタンスを作成できる', () => {
      const defaultCat = Cat.createDefault();

      expect(defaultCat).toBeDefined();
      expect(defaultCat.name).toBe('たぬきねこ');
      expect(defaultCat.personality.social).toBe(0.7);
      expect(defaultCat.personality.active).toBe(0.8);
      expect(defaultCat.personality.bold).toBe(0.6);
      expect(defaultCat.personality.dependent).toBe(0.5);
      expect(defaultCat.personality.friendly).toBe(0.8);
    });

    it('名前を指定してCatインスタンスを作成できる', () => {
      const customCat = Cat.createDefault('カスタム猫');

      expect(customCat.name).toBe('カスタム猫');
    });
  });

  describe('getExternalState', () => {
    it('外部状態を取得できる', () => {
      const externalState = cat.getExternalState();

      expect(externalState).toBeInstanceOf(ExternalState);
      expect(typeof externalState.toyPresence).toBe('boolean');
      expect(typeof externalState.userPresence).toBe('boolean');
      expect(typeof externalState.isPlaying).toBe('boolean');
    });
  });

  describe('getBonding', () => {
    it('なつき度を取得できる', () => {
      const bonding = cat.getBonding();

      expect(bonding).toBeDefined();
      expect(typeof bonding.getLevel()).toBe('number');
      expect(typeof bonding.getGauge()).toBe('number');
    });

    it('なつき度レベルは0-10の範囲', () => {
      const bonding = cat.getBonding();
      const level = bonding.getLevel();

      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(10);
    });

    it('レベル0の場合、レベル0を返す', () => {
      const lowBondingCat = new Cat(
        'test-id',
        'テスト猫',
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager,
        new Bonding(0, 0)
      );

      expect(lowBondingCat.getBonding().getLevel()).toBe(0);
    });

    it('レベル10の場合、レベル10を返す', () => {
      const highBondingCat = new Cat(
        'test-id',
        'テスト猫',
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager,
        new Bonding(10, 0)
      );

      expect(highBondingCat.getBonding().getLevel()).toBe(10);
    });

    it('レベル5の場合、レベル5を返す', () => {
      const midBondingCat = new Cat(
        'test-id',
        'テスト猫',
        ExternalState.createDefault(),
        cat.personality,
        cat.preferences,
        0,
        mockGameTimeManager,
        new Bonding(5, 0)
      );

      expect(midBondingCat.getBonding().getLevel()).toBe(5);
    });
  });

  describe('getCurrentAction', () => {
    it('現在のアクションを取得できる', () => {
      cat.action(ExternalState.createDefault());
      const currentAction = cat.getCurrentAction();

      expect(currentAction).toBeDefined();
    });
  });

  describe('getPosition', () => {
    it('現在位置を取得できる', () => {
      const position = cat.getPosition();

      expect(position).toBeDefined();
      expect(typeof position.x).toBe('number');
      expect(typeof position.y).toBe('number');
    });
  });

  describe('action', () => {
    it('アクションを実行すると結果が返される', () => {
      const result = cat.action(ExternalState.createDefault());

      // アクション結果は返される（nullでないことを確認）
      expect(result).toBeDefined();
    });
  });
});

describe('Cat Integration Tests', () => {
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(0);
  });

  it('複数回のactionでなつき度が変化する可能性がある', () => {
    const cat = new Cat(
      'test-id',
      'テスト猫',
      ExternalState.createDefault(),
      {
        social: 0.5,
        active: 0.5,
        bold: 0.5,
        dependent: 0.5,
        friendly: 0.5
      },
      {
        toyTypes: ['ball'],
        movementSpeed: 0.5,
        movementDirections: ['horizontal'],
        randomness: 0.5
      },
      0,
      mockGameTimeManager,
      new Bonding(5, 0)
    );

    const initialBonding = cat.getBonding();

    for (let i = 0; i < 100; i++) {
      mockGameTimeManager.update(16.67);
      cat.action(ExternalState.createDefault());
    }

    const finalBonding = cat.getBonding();
    expect(finalBonding).toBeDefined();
  });
});

describe('Cat Debug methods', () => {
  let cat: Cat;
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(0);
    cat = Cat.createDefault('テスト猫', mockGameTimeManager);
  });

  describe('debugGetAvailableActions', () => {
    it('should return list of available action names', () => {
      const actions = cat.debugGetAvailableActions();

      expect(Array.isArray(actions)).toBe(true);
      expect(actions.length).toBeGreaterThan(0);
      expect(typeof actions[0]).toBe('string');
    });

    it('should include common action names', () => {
      const actions = cat.debugGetAvailableActions();

      expect(actions).toContain('sit');
      expect(actions).toContain('showBelly');
      expect(actions).toContain('watchCautiously');
    });
  });

  describe('debugForceAction', () => {
    it('should force execute specified action', () => {
      const actions = cat.debugGetAvailableActions();
      const actionName = actions[0];

      cat.debugForceAction(actionName, 4000);

      const currentAction = cat.getCurrentAction();
      expect(currentAction).toBeDefined();
      expect(currentAction?.getActionName()).toBe(actionName);
    });

    it('should set action duration', () => {
      const actions = cat.debugGetAvailableActions();
      const actionName = actions[0];

      cat.debugForceAction(actionName, 6000);

      const currentAction = cat.getCurrentAction();
      expect(currentAction?.getDuration()).toBe(6000);
    });

    it('should throw error for invalid action name', () => {
      expect(() => {
        cat.debugForceAction('invalidActionName', 3000);
      }).toThrow();
    });
  });
});
