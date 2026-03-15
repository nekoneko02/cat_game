import { WatchWithTailWagAction } from '@/domain/cat/catAI/catActions/WatchWithTailWagAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('WatchWithTailWagAction', () => {
  let action: WatchWithTailWagAction;

  beforeEach(() => {
    action = new WatchWithTailWagAction();
  });

  describe('constructor', () => {
    it('アクション名が"watchWithTailWag"で初期化される', () => {
      expect(action.getName()).toBe('watchWithTailWag');
    });
  });

  describe('execute', () => {
    describe('おもちゃがない場合', () => {
      it('デフォルトでwatchWithTailWag_FrontLeftアニメーションを返す', () => {
        const context = ActionContext.withoutToy(100, 100, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });
    });

    describe('おもちゃがある場合（flipXなし）', () => {
      it('おもちゃが正面左にある場合、watchWithTailWag_FrontLeftアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 300, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');
        expect(result.flipX).toBe(false);
      });

      it('おもちゃが正面右にある場合、watchWithTailWag_FrontRightアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 300, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontRight');
        expect(result.flipX).toBe(false);
      });

      it('おもちゃが背面左にある場合、watchWithTailWag_BackLeftアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 100, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_BackLeft');
        expect(result.flipX).toBe(false);
      });

      it('おもちゃが背面右にある場合、watchWithTailWag_BackRightアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 100, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_BackRight');
        expect(result.flipX).toBe(false);
      });
    });

    describe('おもちゃがある場合（flipXあり）', () => {
      it('おもちゃが正面左にある場合、flipXにより右向きアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 300, false, false, true);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontRight');
        expect(result.flipX).toBe(true);
      });

      it('おもちゃが正面右にある場合、flipXにより左向きアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 300, false, false, true);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');
        expect(result.flipX).toBe(true);
      });

      it('おもちゃが背面左にある場合、flipXにより右向きアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 100, false, false, true);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_BackRight');
        expect(result.flipX).toBe(true);
      });

      it('おもちゃが背面右にある場合、flipXにより左向きアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 100, false, false, true);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_BackLeft');
        expect(result.flipX).toBe(true);
      });
    });

    describe('境界値のテスト', () => {
      it('おもちゃがちょうど真横にある場合（Y座標が同じ）', () => {
        const context = ActionContext.withToy(200, 200, 300, 200, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_BackRight');
      });

      it('おもちゃがちょうど真正面にある場合（X座標が同じ）', () => {
        const context = ActionContext.withToy(200, 200, 200, 300, false, false, false);

        const result = action.execute(context);

        expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');
      });
    });
  });

  describe('getInternalStateChange', () => {
    it('空のオブジェクトを返す（内部状態を変更しない）', () => {
      const change = action.getInternalStateChange();

      expect(change).toEqual({});
    });
  });

  describe('getExternalStateChange', () => {
    it('undefinedを返す（外部状態を変更しない）', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeUndefined();
    });
  });
});

describe('WatchWithTailWagAction Integration Tests', () => {
  let action: WatchWithTailWagAction;

  beforeEach(() => {
    action = new WatchWithTailWagAction();
  });

  it('シナリオ: おもちゃに興味を示しながら尻尾を振る', () => {
    const context = ActionContext.withToy(200, 200, 300, 300, false, false);

    const result = action.execute(context);
    const stateChange = action.getInternalStateChange();

    expect(result.deltaX).toBe(0);
    expect(result.deltaY).toBe(0);
    expect(result.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontRight');
    expect(stateChange).toEqual({});
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = ActionContext.withToy(100, 100, 50, 150, false, false);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.deltaX).toBe(0);
    expect(actionResult.movement?.deltaY).toBe(0);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');

    expect(actionResult.internalStateChange).toEqual({});
    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 複数回実行しても同じ結果を返す（冪等性）', () => {
    const context = ActionContext.withToy(150, 150, 200, 200, false, false);

    const result1 = action.execute(context);
    const result2 = action.execute(context);
    const result3 = action.execute(context);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it('シナリオ: おもちゃの位置が変わると異なるアニメーションになる', () => {
    const catX = 200;
    const catY = 200;

    const frontLeftResult = action.execute(ActionContext.withToy(catX, catY, 100, 300, false, false));
    const frontRightResult = action.execute(ActionContext.withToy(catX, catY, 300, 300, false, false));
    const backLeftResult = action.execute(ActionContext.withToy(catX, catY, 100, 100, false, false));
    const backRightResult = action.execute(ActionContext.withToy(catX, catY, 300, 100, false, false));

    expect(frontLeftResult.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontLeft');
    expect(frontRightResult.animationCommands[0].animationKey).toBe('watchWithTailWag_FrontRight');
    expect(backLeftResult.animationCommands[0].animationKey).toBe('watchWithTailWag_BackLeft');
    expect(backRightResult.animationCommands[0].animationKey).toBe('watchWithTailWag_BackRight');
  });
});
