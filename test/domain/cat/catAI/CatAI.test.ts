import { CatAI } from '@/domain/cat/catAI/CatAI';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
import { BondingFactory } from '@/domain/cat/catAI/bonding/BondingFactory';
import { ExternalState } from '@/domain/gameLogic/environment/ExternalState';
import { GameTimeManager } from '@/game/GameTimeManager';

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

describe('CatAI', () => {
  let catAI: CatAI;
  let mockGameTimeManager: MockGameTimeManager;
  let bonding: Bonding;
  let externalState: ExternalState;

  beforeEach(() => {
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(0);
    bonding = BondingFactory.createDefault();
    externalState = ExternalState.createDefault();
    catAI = new CatAI(bonding, mockGameTimeManager);
  });

  describe('action', () => {
    it('should execute action and return ActionResult', () => {
      const result = catAI.action(externalState, 100, 100);

      expect(result).toBeDefined();
      if (result && result.animationCommand) {
        expect(typeof result.animationCommand.key).toBe('string');
      }
    });

    it('should update internal state when action includes state change', () => {
      const initialBonding = catAI.getBonding();

      for (let i = 0; i < 100; i++) {
        mockGameTimeManager.update(16.67);
        catAI.action(externalState, 100, 100);
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
        BondingFactory.getBonding({ level: 0, gauge: 0 }),
        mockGameTimeManager
      );

      expect(aiWithMinBonding.getBonding().getLevel()).toBe(0);
    });

    it('should return 10 when bonding level is 10', () => {
      const aiWithMaxBonding = new CatAI(
        BondingFactory.getBonding({ level: 10, gauge: 0 }),
        mockGameTimeManager
      );

      expect(aiWithMaxBonding.getBonding().getLevel()).toBe(10);
    });
  });

  describe('getCurrentAction', () => {
    it('should return current action', () => {
      catAI.action(externalState, 100, 100);
      const currentAction = catAI.getCurrentAction();

      expect(currentAction).toBeDefined();
    });
  });

  describe('Level up from Lv.3 to Lv.4', () => {
    it('should remain at Lv.3 with gauge cap 0.25 initially after 3 minutes', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      catAI.action(externalState, 100, 100);

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBe(0);
    });

    it('should increase gauge to 0.25 after 3min45sec without watchToy', () => {
      mockGameTimeManager.setTotalTime(225000); // 3分45秒
      catAI.action(externalState, 100, 100);

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should stop at gauge cap 0.25 after 4min without watchToy', () => {
      mockGameTimeManager.setTotalTime(240000); // 4分
      catAI.action(externalState, 100, 100);

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should increase gauge cap to 0.5 after 1 watchToy action', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      const stateWithToy = new ExternalState(true, 100, true, false);

      // watchToyアクションを実行させる
      catAI.debugForceAction('watchToy', 3000);
      catAI.action(stateWithToy, 100, 100, 150, 150);

      // 45秒後（上限0.5の半分の時間）
      mockGameTimeManager.setTotalTime(225000);
      catAI.action(externalState, 100, 100);

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(3);
      expect(bondingView.getGauge()).toBeCloseTo(0.25, 2);
    });

    it('should reach Lv.4 after 3 watchToy actions and sufficient time', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分
      const stateWithToy = new ExternalState(true, 100, true, false);

      // watchToyを3回実行（カウント0→3）
      for (let i = 0; i < 3; i++) {
        catAI.debugForceAction('watchToy', 3000);
        catAI.action(stateWithToy, 100, 100, 150, 150);
      }

      // 上限値は (3+1)/4 = 1.0
      // 3分後（180秒経過）でゲージ1.0到達
      mockGameTimeManager.setTotalTime(360000); // 6分（180秒後）
      catAI.action(externalState, 100, 100);

      const bondingView = catAI.getBonding();
      expect(bondingView.getLevel()).toBe(4);
      expect(bondingView.getGauge()).toBe(0);
    });

    it('should gradually increase gauge with each watchToy action', () => {
      mockGameTimeManager.setTotalTime(180000); // 3分（ゲージ計測開始）
      const stateWithToy = new ExternalState(true, 100, true, false);

      // 1回目のwatchToy → カウント0→1、上限(1+1)/4=0.5
      catAI.debugForceAction('watchToy', 3000);
      catAI.action(stateWithToy, 100, 100, 150, 150);

      // 45秒後（時間経過で0.25増加）
      mockGameTimeManager.setTotalTime(225000); // 3分45秒（+45秒）
      catAI.action(externalState, 100, 100);
      expect(catAI.getBonding().getGauge()).toBeCloseTo(0.25, 2);

      // 2回目のwatchToy → カウント1→2、上限(2+1)/4=0.75
      catAI.debugForceAction('watchToy', 3000);
      catAI.action(stateWithToy, 100, 100, 150, 150);

      // さらに45秒後（時間経過で合計0.5増加）
      mockGameTimeManager.setTotalTime(270000); // 4分30秒（+90秒）
      catAI.action(externalState, 100, 100);
      expect(catAI.getBonding().getGauge()).toBeCloseTo(0.5, 2);

      // 3回目のwatchToy → カウント2→3、上限(3+1)/4=1.0
      catAI.debugForceAction('watchToy', 3000);
      catAI.action(stateWithToy, 100, 100, 150, 150);

      // さらに45秒後（時間経過で合計0.75増加）
      mockGameTimeManager.setTotalTime(315000); // 5分15秒（+135秒）
      catAI.action(externalState, 100, 100);
      expect(catAI.getBonding().getGauge()).toBeCloseTo(0.75, 2);

      // 最終的にLv.4到達（さらに45秒後で1.0）
      mockGameTimeManager.setTotalTime(360000); // 6分（+180秒）
      catAI.action(externalState, 100, 100);
      expect(catAI.getBonding().getLevel()).toBe(4);
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
  });
});
