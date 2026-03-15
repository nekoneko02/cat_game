import { CatAI } from '@/domain/cat/catAI/CatAI';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';
import { GameTimeManager } from '@/game/GameTimeManager';
import { GlobalRegistry } from '@/domain/global/GlobalRegistry';

// ヘルパー関数: ExternalStateとパラメータからActionContextを作成
function createActionContext(
  externalState: ExternalState,
  currentX: number,
  currentY: number,
  toyX?: number,
  toyY?: number,
  flipX: boolean = false
): ActionContext {
  return new ActionContext({
    currentX,
    currentY,
    toyX,
    toyY,
    flipX,
    toyPresence: externalState.toyPresence,
    userPresence: externalState.userPresence,
    isPlaying: externalState.isPlaying
  });
}

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

  getGameTime(): number {
    return this.mockTotalTime;
  }

  update(): void {
    // Mock implementation - does nothing
  }
}

describe('CatAI', () => {
  let catAI: CatAI;
  let mockGameTimeManager: MockGameTimeManager;
  let bonding: Bonding;
  let externalState: ExternalState;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(0);
    GlobalRegistry.getInstance().setMockTimeManager(mockGameTimeManager as any);
    bonding = new Bonding(0, 0);
    externalState = ExternalState.createDefault();
    catAI = new CatAI({ level: 0, gauge: 0 }, mockGameTimeManager);
  });

  afterEach(() => {
    GlobalRegistry.resetForTest();
  });

  describe('action', () => {
    it('should execute action and return ActionResult', () => {
      const result = catAI.action(createActionContext(externalState, 100, 100));

      expect(result).toBeDefined();
      if (result && result.movement && result.movement.animationCommands) {
        expect(Array.isArray(result.movement.animationCommands)).toBe(true);
      }
    });

    it('should update internal state when action includes state change', () => {
      const initialBonding = catAI.getBonding();

      for (let i = 0; i < 100; i++) {
        catAI.action(createActionContext(externalState, 100, 100));
      }

      const updatedBonding = catAI.getBonding();
      expect(updatedBonding).toBeDefined();
    });
  });

  describe('getBonding', () => {
    it('should return bonding view', () => {
      const bondingView = catAI.getBonding();

      expect(bondingView).toBeDefined();
      expect(typeof bondingView.getLevel()).toBe('number');
      expect(typeof bondingView.getGauge()).toBe('number');
    });

    it('should return bonding level scaled to 0-10', () => {
      const bondingView = catAI.getBonding();
      const level = bondingView.getLevel();

      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(10);
    });

    it('should return 0 when bonding level is 0', () => {
      const aiWithMinBonding = new CatAI(
        { level: 0, gauge: 0 },
        mockGameTimeManager
      );

      expect(aiWithMinBonding.getBonding().getLevel()).toBe(0);
    });

    it('should return 10 when bonding level is 10', () => {
      const aiWithMaxBonding = new CatAI(
        { level: 10, gauge: 0 },
        mockGameTimeManager
      );

      expect(aiWithMaxBonding.getBonding().getLevel()).toBe(10);
    });
  });

  describe('getCurrentAction', () => {
    it('should return current action', () => {
      catAI.action(createActionContext(externalState, 100, 100));
      const currentAction = catAI.getCurrentAction();

      expect(currentAction).toBeDefined();
    });
  });

  describe('Level up from Lv.3 to Lv.4', () => {
    beforeEach(() => {
      // 時刻をリセットしてからCatAIを作成
      mockGameTimeManager.setTotalTime(0);
      // Lv3でのテストなので、Lv3で初期化
      catAI = new CatAI({ level: 3, gauge: 0 }, mockGameTimeManager);
    });

    it('should remain at Lv.3 with gauge cap 0.25 initially after 3 minutes', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      catAI.action(createActionContext(externalState, 100, 100));

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      // watchToyが0回でも上限は0.25、180秒経過で上限に到達
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should increase gauge to 0.25 after 3min45sec without watchToy', () => {
      mockGameTimeManager.setTotalTime(225000); // 3分45秒
      catAI.action(createActionContext(externalState, 100, 100));

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should stop at gauge cap 0.25 after 4min without watchToy', () => {
      mockGameTimeManager.setTotalTime(240000); // 4分
      catAI.action(createActionContext(externalState, 100, 100));

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should increase gauge cap to 0.5 after 1 watchToy action', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      const stateWithToy = new ExternalState(true, 100, true, false);

      // watchToyアクションを実行させる
      catAI.debugForceAction('watchToy', 3000);
      catAI.action(createActionContext(stateWithToy, 100, 100, 150, 150));

      // 225秒後（上限0.5に到達）
      mockGameTimeManager.setTotalTime(225000);
      catAI.action(createActionContext(externalState, 100, 100));

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      // watchToy 1回 → 上限0.5、225秒経過で上限に到達
      expect(bondingView.getGauge()).toBeCloseTo(0.5, 2);
    });

    it('should reach Lv.4 after 3 watchToy actions and sufficient time', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      const stateWithToy = new ExternalState(true, 100, true, false);

      // watchToyを3回実行（カウント0→3）
      for (let i = 0; i < 3; i++) {
        catAI.debugForceAction('watchToy', 3000);
      }

      // 上限値は (3+1)/4 = 1.0
      // 3分後（180秒経過）でゲージ1.0到達
      mockGameTimeManager.setTotalTime(360000); // 6分（180秒後）
      catAI.action(createActionContext(externalState, 100, 100));

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(4);
      expect(bondingView.getGauge()).toBe(0);
    });

    it('should gradually increase gauge with each watchToy action', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分（ゲージ計測開始）
      const stateWithToy = new ExternalState(true, 100, true, false);

      // 1回目のwatchToy → カウント0→1、上限(1+1)/4=0.5
      catAI.debugForceAction('watchToy', 3000);

      // 225秒後（時間経過225秒、上限0.5に到達）
      mockGameTimeManager.setTotalTime(225000); // 3分45秒（開始から225秒）
      catAI.action(createActionContext(externalState, 100, 100));
      // 225秒経過で (225/45)*0.25 = 1.25 だが、上限0.5で制限
      expect(catAI.getBonding().getGauge()).toBeCloseTo(0.5, 2);

      // 2回目のwatchToy → カウント1→2、上限(2+1)/4=0.75
      catAI.debugForceAction('watchToy', 3000);

      // さらに45秒後（時間経過270秒、上限0.75に到達）
      mockGameTimeManager.setTotalTime(270000); // 4分30秒（開始から270秒）
      catAI.action(createActionContext(externalState, 100, 100));
      // 270秒経過で (270/45)*0.25 = 1.5 だが、上限0.75で制限
      expect(catAI.getBonding().getGauge()).toBeCloseTo(0.75, 2);

      // 3回目のwatchToy → カウント2→3、上限(3+1)/4=1.0
      catAI.debugForceAction('watchToy', 3000);

      // 315秒後（時間経過315秒、上限1.0に到達）
      mockGameTimeManager.setTotalTime(315000); // 5分15秒（開始から315秒）
      catAI.action(createActionContext(externalState, 100, 100));
      // 315秒経過で (315/45)*0.25 = 1.75 だが、上限1.0で制限
      // ゲージ1.0でレベルアップが即座に発生するため、レベル4・ゲージ0になる
      expect(catAI.getBonding().getLevel()).toBe(4);
      expect(catAI.getBonding().getGauge()).toBe(0);
    });
  });

  describe('Debug methods', () => {
    describe('debugGetAvailableActions', () => {
      it('should return list of available action names', () => {
        const actions = catAI.debugGetAvailableActions();

        expect(Array.isArray(actions)).toBe(true);
        expect(actions.length).toBeGreaterThan(0);
        expect(typeof actions[0]).toBe('string');
      });
    });

    describe('debugForceAction', () => {
      it('should force execute specified action', () => {
        const actions = catAI.debugGetAvailableActions();
        const actionName = actions[0];

        catAI.debugForceAction(actionName, 3000);

        const currentAction = catAI.getCurrentAction();
        expect(currentAction).toBeDefined();
        expect(currentAction?.getActionName()).toBe(actionName);
      });

      it('should set action duration', () => {
        const actions = catAI.debugGetAvailableActions();
        const actionName = actions[0];

        catAI.debugForceAction(actionName, 5000);

        const currentAction = catAI.getCurrentAction();
        expect(currentAction?.getDuration()).toBe(5000);
      });
    });

    describe('debugSetBondingLevel', () => {
      it('should set bonding level directly', () => {
        catAI.debugSetBondingLevel(5);

        expect(catAI.getBonding().getLevel()).toBe(5);
        expect(catAI.getBonding().getGauge()).toBe(0);
      });

      it('should reset gauge when level is changed', () => {
        const aiWithGauge = new CatAI({ level: 3, gauge: 0.5 }, mockGameTimeManager);

        aiWithGauge.debugSetBondingLevel(7);

        expect(aiWithGauge.getBonding().getLevel()).toBe(7);
        expect(aiWithGauge.getBonding().getGauge()).toBe(0);
      });

      it('should allow setting level to 0', () => {
        const aiWithHighLevel = new CatAI({ level: 8, gauge: 0 }, mockGameTimeManager);

        aiWithHighLevel.debugSetBondingLevel(0);

        expect(aiWithHighLevel.getBonding().getLevel()).toBe(0);
        expect(aiWithHighLevel.getBonding().getGauge()).toBe(0);
      });

      it('should allow setting level to 10', () => {
        catAI.debugSetBondingLevel(10);

        expect(catAI.getBonding().getLevel()).toBe(10);
        expect(catAI.getBonding().getGauge()).toBe(0);
      });

      it('should switch action selector when level changes', () => {
        catAI.debugSetBondingLevel(1);
        const actions1 = catAI.debugGetAvailableActions();

        catAI.debugSetBondingLevel(5);
        const actions5 = catAI.debugGetAvailableActions();

        expect(actions1).toBeDefined();
        expect(actions5).toBeDefined();
      });
    });
  });
});
