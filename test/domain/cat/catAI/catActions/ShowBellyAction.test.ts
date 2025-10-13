import { ShowBellyAction } from '@/domain/cat/catAI/catActions/ShowBellyAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('ShowBellyAction', () => {
  let action: ShowBellyAction;

  beforeEach(() => {
    action = new ShowBellyAction();
  });

  describe('constructor', () => {
    it('アクション名が"showBelly"で初期化される', () => {
      expect(action.getName()).toBe('showBelly');
    });
  });

  describe('execute', () => {
    it('移動せずshowBellyアニメーションを返す', () => {
      const context = new ActionContext(100, 100);

      const result = action.execute(context);

      expect(result.deltaX).toBe(0);
      expect(result.deltaY).toBe(0);
      expect(result.animationCommands).toHaveLength(1);
      expect(result.animationCommands[0].animationKey).toBe('showBelly');
      expect(result.animationCommands[0].repeat).toBe(-1);
    });

    it('おもちゃがある場合も同じ動作をする', () => {
      const context = new ActionContext(100, 100, 200, 200);

      const result = action.execute(context);

      expect(result.deltaX).toBe(0);
      expect(result.deltaY).toBe(0);
      expect(result.animationCommands[0].animationKey).toBe('showBelly');
    });

    it('異なる位置でも同じ動作をする', () => {
      const context1 = new ActionContext(50, 50);
      const context2 = new ActionContext(300, 400);

      const result1 = action.execute(context1);
      const result2 = action.execute(context2);

      expect(result1).toEqual(result2);
    });

    it('speedプロパティを持たない', () => {
      const context = new ActionContext(100, 100);

      const result = action.execute(context);

      expect(result.speed).toBeUndefined();
    });

    it('flipXプロパティはcontext.flipXを継承する', () => {
      const contextWithoutFlip = new ActionContext(100, 100, undefined, undefined, false);
      const contextWithFlip = new ActionContext(100, 100, undefined, undefined, true);

      const resultWithoutFlip = action.execute(contextWithoutFlip);
      const resultWithFlip = action.execute(contextWithFlip);

      expect(resultWithoutFlip.flipX).toBe(false);
      expect(resultWithFlip.flipX).toBe(true);
    });
  });

  describe('getInternalStateChange', () => {
    it('bondingの変化を返す', () => {
      const change = action.getInternalStateChange();

      expect(change).toBeDefined();
      expect(change.bonding).toBe(0.067);
    });

    it('playfulnessとfearの変化は含まれない', () => {
      const change = action.getInternalStateChange();

      expect(change.playfulness).toBeUndefined();
      expect(change.fear).toBeUndefined();
    });

    it('3秒間の合計で意図した値になる', () => {
      const change = action.getInternalStateChange();
      const duration = 3;

      expect(change.bonding * duration).toBeCloseTo(0.2, 2);
    });

    it('bondingが正の値で増加する', () => {
      const change = action.getInternalStateChange();

      expect(change.bonding).toBeGreaterThan(0);
    });
  });

  describe('getExternalStateChange', () => {
    it('undefinedを返す（外部状態を変更しない）', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeUndefined();
    });
  });
});

describe('ShowBellyAction Integration Tests', () => {
  let action: ShowBellyAction;

  beforeEach(() => {
    action = new ShowBellyAction();
  });

  it('シナリオ: なつき度が高い時にお腹を見せて信頼を示す', () => {
    const context = new ActionContext(200, 200);

    const result = action.execute(context);
    const stateChange = action.getInternalStateChange();

    expect(result.deltaX).toBe(0);
    expect(result.deltaY).toBe(0);
    expect(result.animationCommands[0].animationKey).toBe('showBelly');

    expect(stateChange.bonding).toBeGreaterThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = new ActionContext(100, 100);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.deltaX).toBe(0);
    expect(actionResult.movement?.deltaY).toBe(0);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('showBelly');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(actionResult.internalStateChange?.bonding).toBe(0.067);
    expect(actionResult.internalStateChange?.playfulness).toBeUndefined();
    expect(actionResult.internalStateChange?.fear).toBeUndefined();

    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 複数回実行しても同じ結果を返す（冪等性）', () => {
    const context = new ActionContext(150, 150);

    const result1 = action.execute(context);
    const result2 = action.execute(context);
    const result3 = action.execute(context);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });
});
