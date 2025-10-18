import { WatchToyAction } from '@/domain/cat/catAI/catActions/WatchToyAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('WatchToyAction', () => {
  let action: WatchToyAction;

  beforeEach(() => {
    action = new WatchToyAction();
  });

  describe('constructor', () => {
    it('アクション名が"watchToy"で初期化される', () => {
      expect(action.getName()).toBe('watchToy');
    });
  });

  describe('execute', () => {
    describe('おもちゃがない場合', () => {
      it('sitアニメーションを返す', () => {
        const context = ActionContext.withoutToy(100, 100, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.flipX).toBe(false);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('sit');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });

      it('context.flipXを継承する', () => {
        const context = ActionContext.withoutToy(100, 100, false, false, true);

        const result = action.execute(context);

        expect(result.flipX).toBe(true);
        expect(result.animationCommands[0].animationKey).toBe('sit');
      });
    });

    describe('おもちゃがある場合', () => {
      it('おもちゃが左にある場合、flipX=falseでwatchToyアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 200, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.flipX).toBe(false);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });

      it('おもちゃが右にある場合、flipX=trueでwatchToyアニメーションを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 200, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.flipX).toBe(true);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });

      it('おもちゃが真上にある場合（dx=0）、flipX=falseを返す', () => {
        const context = ActionContext.withToy(200, 200, 200, 100, false, false);

        const result = action.execute(context);

        expect(result.flipX).toBe(false);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
      });

      it('おもちゃが真下にある場合（dx=0）、flipX=falseを返す', () => {
        const context = ActionContext.withToy(200, 200, 200, 300, false, false);

        const result = action.execute(context);

        expect(result.flipX).toBe(false);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
      });

      it('おもちゃが斜め左上にある場合、flipX=falseを返す', () => {
        const context = ActionContext.withToy(200, 200, 100, 100, false, false);

        const result = action.execute(context);

        expect(result.flipX).toBe(false);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
      });

      it('おもちゃが斜め右下にある場合、flipX=trueを返す', () => {
        const context = ActionContext.withToy(200, 200, 300, 300, false, false);

        const result = action.execute(context);

        expect(result.flipX).toBe(true);
        expect(result.animationCommands[0].animationKey).toBe('watchToy');
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

describe('WatchToyAction Integration Tests', () => {
  let action: WatchToyAction;

  beforeEach(() => {
    action = new WatchToyAction();
  });

  it('シナリオ: おもちゃがないときは座る', () => {
    const context = ActionContext.withoutToy(200, 200, false, false);

    const result = action.execute(context);
    const stateChange = action.getInternalStateChange();

    expect(result.deltaX).toBe(0);
    expect(result.deltaY).toBe(0);
    expect(result.animationCommands[0].animationKey).toBe('sit');
    expect(stateChange).toEqual({});
  });

  it('シナリオ: おもちゃがあるときは見つめる', () => {
    const context = ActionContext.withToy(200, 200, 300, 200, false, false);

    const result = action.execute(context);
    const stateChange = action.getInternalStateChange();

    expect(result.deltaX).toBe(0);
    expect(result.deltaY).toBe(0);
    expect(result.animationCommands[0].animationKey).toBe('watchToy');
    expect(result.flipX).toBe(true);
    expect(stateChange).toEqual({});
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = ActionContext.withToy(100, 100, 200, 150, false, false);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.deltaX).toBe(0);
    expect(actionResult.movement?.deltaY).toBe(0);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('watchToy');
    expect(actionResult.movement?.flipX).toBe(true);

    expect(actionResult.internalStateChange).toEqual({});
    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 複数回実行しても同じ結果を返す（冪等性）', () => {
    const context = ActionContext.withToy(150, 150, 250, 200, false, false);

    const result1 = action.execute(context);
    const result2 = action.execute(context);
    const result3 = action.execute(context);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it('シナリオ: おもちゃの位置が変わると向きが変わる', () => {
    const catX = 200;
    const catY = 200;

    const leftResult = action.execute(ActionContext.withToy(catX, catY, 100, 200, false, false));
    const rightResult = action.execute(ActionContext.withToy(catX, catY, 300, 200, false, false));

    expect(leftResult.flipX).toBe(false);
    expect(rightResult.flipX).toBe(true);
    expect(leftResult.animationCommands[0].animationKey).toBe('watchToy');
    expect(rightResult.animationCommands[0].animationKey).toBe('watchToy');
  });
});
