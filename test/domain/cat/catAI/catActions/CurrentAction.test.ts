import { CurrentAction } from '@/domain/cat/catAI/catActions/CurrentAction';
import { CatActionExecutor } from '@/domain/cat/catAI/catActions/CatActionExecutor';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';
import { GameTimeManager } from '@/game/GameTimeManager';

class MockActionExecutor extends CatActionExecutor {
  constructor() {
    super('mockAction');
  }

  execute(context: ActionContext) {
    return {
      animationCommands: [{ animationKey: 'mock_animation', repeat: 0 }],
      flipX: false,
      deltaX: 10,
      deltaY: 0
    };
  }

  getInternalStateChange() {
    return { bonding: 0.1, playfulness: 0.05 };
  }
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

describe('CurrentAction', () => {
  let mockActionExecutor: CatActionExecutor;
  let mockGameTimeManager: MockGameTimeManager;

  beforeEach(() => {
    mockActionExecutor = new MockActionExecutor();
    mockGameTimeManager = new MockGameTimeManager();
    mockGameTimeManager.setDeltaTime(16.67);
    mockGameTimeManager.setTotalTime(1000);
  });

  describe('constructor', () => {
    it('should create CurrentAction with start time and duration', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      expect(currentAction.getActionName()).toBe('mockAction');
      expect(currentAction.getStartTime()).toBe(1000);
      expect(currentAction.getDuration()).toBe(2000);
    });

    it('should create CurrentAction with 0 duration', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        0,
        mockGameTimeManager
      );

      expect(currentAction.getDuration()).toBe(0);
    });
  });

  describe('isInProgress', () => {
    it('should return true when action is still in progress', () => {
      mockGameTimeManager.setTotalTime(1000);
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      mockGameTimeManager.setTotalTime(2000);
      expect(currentAction.isInProgress()).toBe(true);
    });

    it('should return false when action duration has elapsed', () => {
      mockGameTimeManager.setTotalTime(1000);
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      mockGameTimeManager.setTotalTime(3001);
      expect(currentAction.isInProgress()).toBe(false);
    });

    it('should return false when duration is 0', () => {
      mockGameTimeManager.setTotalTime(1000);
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        0,
        mockGameTimeManager
      );

      mockGameTimeManager.setTotalTime(1001);
      expect(currentAction.isInProgress()).toBe(false);
    });

    it('should return true at exact start time', () => {
      mockGameTimeManager.setTotalTime(1000);
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      expect(currentAction.isInProgress()).toBe(true);
    });
  });

  describe('action', () => {
    it('should execute the action and return ActionResult', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      const result = currentAction.action(100, 100);

      expect(result).toBeDefined();
      expect(result.movement).toBeDefined();
      expect(result.movement?.animationCommands).toHaveLength(1);
      expect(result.movement?.animationCommands[0].animationKey).toBe('mock_animation');
      expect(result.movement?.deltaX).toBe(10);
      expect(result.movement?.deltaY).toBe(0);
    });

    it('should include internal state change in result', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      const result = currentAction.action(100, 100);

      expect(result.internalStateChange).toBeDefined();
      expect(result.internalStateChange?.bonding).toBe(0.1);
      expect(result.internalStateChange?.playfulness).toBe(0.05);
    });

    it('should pass correct context with toy position', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      const result = currentAction.action(100, 100, 200, 150);

      expect(result).toBeDefined();
      expect(result.movement).toBeDefined();
    });
  });

  describe('getters', () => {
    it('should return correct action name', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        2000,
        mockGameTimeManager
      );

      expect(currentAction.getActionName()).toBe('mockAction');
    });

    it('should return correct start time', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        2500,
        1000,
        mockGameTimeManager
      );

      expect(currentAction.getStartTime()).toBe(2500);
    });

    it('should return correct duration', () => {
      const currentAction = new CurrentAction(
        mockActionExecutor,
        1000,
        3500,
        mockGameTimeManager
      );

      expect(currentAction.getDuration()).toBe(3500);
    });
  });
});
