import { CatAI } from '@/domain/cat/catAI/CatAI';
import { Bonding } from '@/domain/cat/catAI/bonding/Bonding';
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
    bonding = Bonding.createDefault();
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

    it('should return 0 when internal bonding is -1', () => {
      const aiWithMinBonding = new CatAI(
        new Bonding(-1),
        mockGameTimeManager
      );

      expect(aiWithMinBonding.getBonding().getLevel()).toBe(0);
    });

    it('should return 10 when internal bonding is 1', () => {
      const aiWithMaxBonding = new CatAI(
        new Bonding(1),
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
});
