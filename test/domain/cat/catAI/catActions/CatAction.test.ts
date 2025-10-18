import { CatActionExecutor, ActionMovement, ActionResult } from '@/domain/cat/catAI/catActions/CatActionExecutor';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';
import { AnimationCommand } from '@/types/AnimationCommand';

class TestCatActionExecutor extends CatActionExecutor {
  constructor(name: string = 'testAction') {
    super(name);
  }

  execute(context: ActionContext): ActionMovement {
    return {
      deltaX: 10,
      deltaY: 5,
      speed: 100,
      animationCommands: [{ animationKey: 'test-anim', repeat: 0 }],
      flipX: false
    };
  }

  getInternalStateChange(): Record<string, number> | undefined {
    return { bonding: 0.1, playfulness: 0.2 };
  }

  getExternalStateChange(): Record<string, boolean> | undefined {
    return { isPlaying: true };
  }
}

class MinimalTestAction extends CatActionExecutor {
  constructor() {
    super('minimalAction');
  }

  execute(context: ActionContext): ActionMovement {
    return {
      animationCommands: []
    };
  }
}

describe('CatActionExecutor', () => {
  let testAction: TestCatActionExecutor;
  let minimalAction: MinimalTestAction;
  let context: ActionContext;

  beforeEach(() => {
    testAction = new TestCatActionExecutor('customAction');
    minimalAction = new MinimalTestAction();
    context = ActionContext.withToy(100, 100, 200, 200, false, false);
  });

  describe('constructor', () => {
    it('名前を設定してインスタンスを作成できる', () => {
      expect(testAction).toBeDefined();
      expect(testAction.getName()).toBe('customAction');
    });
  });

  describe('getName', () => {
    it('アクション名を取得できる', () => {
      expect(testAction.getName()).toBe('customAction');
    });

    it('デフォルト名を取得できる', () => {
      const defaultAction = new TestCatActionExecutor();
      expect(defaultAction.getName()).toBe('testAction');
    });
  });

  describe('execute', () => {
    it('ActionMovementを返す', () => {
      const movement = testAction.execute(context);

      expect(movement).toBeDefined();
      expect(movement.deltaX).toBe(10);
      expect(movement.deltaY).toBe(5);
      expect(movement.speed).toBe(100);
      expect(movement.animationCommands).toHaveLength(1);
      expect(movement.flipX).toBe(false);
    });

    it('最小限のActionMovementを返す', () => {
      const movement = minimalAction.execute(context);

      expect(movement).toBeDefined();
      expect(movement.animationCommands).toEqual([]);
      expect(movement.deltaX).toBeUndefined();
      expect(movement.deltaY).toBeUndefined();
      expect(movement.speed).toBeUndefined();
    });
  });

  describe('getInternalStateChange', () => {
    it('内部状態変化を返す', () => {
      const stateChange = testAction.getInternalStateChange();

      expect(stateChange).toBeDefined();
      expect(stateChange?.bonding).toBe(0.1);
      expect(stateChange?.playfulness).toBe(0.2);
    });

    it('デフォルトではundefinedを返す', () => {
      const stateChange = minimalAction.getInternalStateChange();

      expect(stateChange).toBeUndefined();
    });
  });

  describe('getExternalStateChange', () => {
    it('外部状態変化を返す', () => {
      const stateChange = testAction.getExternalStateChange();

      expect(stateChange).toBeDefined();
      expect(stateChange?.isPlaying).toBe(true);
    });

    it('デフォルトではundefinedを返す', () => {
      const stateChange = minimalAction.getExternalStateChange();

      expect(stateChange).toBeUndefined();
    });
  });

  describe('createActionResult', () => {
    it('完全なActionResultを生成できる', () => {
      const result = testAction.createActionResult(context);

      expect(result).toBeDefined();
      expect(result.internalStateChange).toBeDefined();
      expect(result.externalStateChange).toBeDefined();
      expect(result.movement).toBeDefined();
    });

    it('最小限のActionResultを生成できる', () => {
      const result = minimalAction.createActionResult(context);

      expect(result).toBeDefined();
      expect(result.internalStateChange).toBeUndefined();
      expect(result.externalStateChange).toBeUndefined();
      expect(result.movement).toBeDefined();
      expect(result.movement?.animationCommands).toEqual([]);
    });

    it('内部状態変化を含むActionResultを生成できる', () => {
      const result = testAction.createActionResult(context);

      expect(result.internalStateChange).toEqual({
        bonding: 0.1,
        playfulness: 0.2
      });
    });

    it('外部状態変化を含むActionResultを生成できる', () => {
      const result = testAction.createActionResult(context);

      expect(result.externalStateChange).toEqual({
        isPlaying: true
      });
    });

    it('移動情報を含むActionResultを生成できる', () => {
      const result = testAction.createActionResult(context);

      expect(result.movement).toBeDefined();
      expect(result.movement?.deltaX).toBe(10);
      expect(result.movement?.deltaY).toBe(5);
    });
  });

  describe('shouldFlipX (protected)', () => {
    it('deltaXが正の場合trueを返す（右向き移動）', () => {
      const result = (testAction as any).shouldFlipX(10);
      expect(result).toBe(true);
    });

    it('deltaXが負の場合falseを返す（左向き移動）', () => {
      const result = (testAction as any).shouldFlipX(-10);
      expect(result).toBe(false);
    });

    it('deltaXが0の場合falseを返す（移動なし）', () => {
      const result = (testAction as any).shouldFlipX(0);
      expect(result).toBe(false);
    });

    it('小数点の正の値でもtrueを返す', () => {
      const result = (testAction as any).shouldFlipX(0.1);
      expect(result).toBe(true);
    });

    it('小数点の負の値でもfalseを返す', () => {
      const result = (testAction as any).shouldFlipX(-0.1);
      expect(result).toBe(false);
    });
  });
});

describe('CatActionExecutor Integration Tests', () => {
  class CustomAction extends CatActionExecutor {
    private executionCount = 0;

    constructor() {
      super('customIntegrationAction');
    }

    execute(context: ActionContext): ActionMovement {
      this.executionCount++;

      const deltaX = context.hasToy() ?
        (context.toyX! - context.currentX) : 0;

      return {
        deltaX,
        deltaY: 0,
        speed: 150,
        animationCommands: [
          { animationKey: 'walk', repeat: 0 }
        ],
        flipX: this.shouldFlipX(deltaX)
      };
    }

    getInternalStateChange(): Record<string, number> {
      return {
        playfulness: 0.05 * this.executionCount
      };
    }

    getExecutionCount(): number {
      return this.executionCount;
    }
  }

  it('シナリオ: おもちゃに向かって移動し、flipXが適切に設定される', () => {
    const action = new CustomAction();

    // 猫の位置(100, 100)、おもちゃの位置(300, 100) → 右向き移動
    const context1 = ActionContext.withToy(100, 100, 300, 100, false, false);
    const result1 = action.createActionResult(context1);

    expect(result1.movement?.deltaX).toBeGreaterThan(0);
    expect(result1.movement?.flipX).toBe(true);

    // 猫の位置(300, 100)、おもちゃの位置(100, 100) → 左向き移動
    const context2 = ActionContext.withToy(300, 100, 100, 100, false, false);
    const result2 = action.createActionResult(context2);

    expect(result2.movement?.deltaX).toBeLessThan(0);
    expect(result2.movement?.flipX).toBe(false);
  });

  it('シナリオ: 内部状態変化は1秒あたりの定数値を返す', () => {
    const action = new CustomAction();
    const context = ActionContext.withToy(100, 100, 200, 200, false, false);

    // createActionResult()ではgetInternalStateChange()がexecute()より先に呼ばれるため
    // executionCountは0, 1, 2となる
    const result1 = action.createActionResult(context);
    const result2 = action.createActionResult(context);
    const result3 = action.createActionResult(context);

    // getInternalStateChangeが呼ばれた時点のexecutionCountで計算される
    expect(result1.internalStateChange?.playfulness).toBe(0); // 0 * 0.05 = 0
    expect(result2.internalStateChange?.playfulness).toBe(0.05); // 1 * 0.05 = 0.05
    expect(result3.internalStateChange?.playfulness).toBe(0.1); // 2 * 0.05 = 0.1

    // 実行回数が正しくカウントされていることを確認
    expect(action.getExecutionCount()).toBe(3);
  });

  it('シナリオ: おもちゃがない場合は移動しない', () => {
    const action = new CustomAction();
    const contextWithoutToy = ActionContext.withoutToy(100, 100, false, false);

    const result = action.createActionResult(contextWithoutToy);

    expect(result.movement?.deltaX).toBe(0);
    expect(result.movement?.flipX).toBe(false);
  });
});
