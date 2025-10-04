import { SitAction } from '@/domain/actions/SitAction';
import { ActionContext } from '@/domain/actions/ActionContext';

describe('SitAction', () => {
  let action: SitAction;

  beforeEach(() => {
    action = new SitAction();
  });

  describe('constructor', () => {
    it('アクション名が"sit"で初期化される', () => {
      expect(action.getName()).toBe('sit');
    });
  });

  describe('execute', () => {
    it('移動せずsitアニメーションを返す', () => {
      const context = new ActionContext(100, 100);

      const result = action.execute(context);

      expect(result.deltaX).toBe(0);
      expect(result.deltaY).toBe(0);
      expect(result.animationCommands).toHaveLength(1);
      expect(result.animationCommands[0].animationKey).toBe('sit');
      expect(result.animationCommands[0].repeat).toBe(-1);
    });

    it('おもちゃがある場合も同じ動作をする', () => {
      const context = new ActionContext(100, 100, 200, 200);

      const result = action.execute(context);

      expect(result.deltaX).toBe(0);
      expect(result.deltaY).toBe(0);
      expect(result.animationCommands[0].animationKey).toBe('sit');
    });

    it('異なる位置でも同じ動作をする', () => {
      const context1 = new ActionContext(0, 0);
      const context2 = new ActionContext(500, 500);

      const result1 = action.execute(context1);
      const result2 = action.execute(context2);

      expect(result1).toEqual(result2);
    });

    it('speedプロパティを持たない', () => {
      const context = new ActionContext(100, 100);

      const result = action.execute(context);

      expect(result.speed).toBeUndefined();
    });

    it('flipXプロパティを持たない', () => {
      const context = new ActionContext(100, 100);

      const result = action.execute(context);

      expect(result.flipX).toBeUndefined();
    });
  });

  describe('getInternalStateChange', () => {
    it('playfulnessとfearの変化を返す', () => {
      const change = action.getInternalStateChange();

      expect(change).toBeDefined();
      expect(change.playfulness).toBe(0.033);
      expect(change.fear).toBe(-0.033);
    });

    it('bondingの変化は含まれない', () => {
      const change = action.getInternalStateChange();

      expect(change.bonding).toBeUndefined();
    });

    it('3秒間の合計で意図した値になる', () => {
      const change = action.getInternalStateChange();
      const duration = 3;

      expect(change.playfulness * duration).toBeCloseTo(0.1, 2);
      expect(change.fear * duration).toBeCloseTo(-0.1, 2);
    });

    it('playfulnessが増加しfearが減少する', () => {
      const change = action.getInternalStateChange();

      expect(change.playfulness).toBeGreaterThan(0);
      expect(change.fear).toBeLessThan(0);
    });
  });

  describe('getExternalStateChange', () => {
    it('undefinedを返す（外部状態を変更しない）', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeUndefined();
    });
  });
});

describe('SitAction Integration Tests', () => {
  let action: SitAction;

  beforeEach(() => {
    action = new SitAction();
  });

  it('シナリオ: リラックスしてお座りする', () => {
    const context = new ActionContext(150, 150);

    const result = action.execute(context);
    const stateChange = action.getInternalStateChange();

    expect(result.deltaX).toBe(0);
    expect(result.deltaY).toBe(0);
    expect(result.animationCommands[0].animationKey).toBe('sit');

    expect(stateChange.playfulness).toBeGreaterThan(0);
    expect(stateChange.fear).toBeLessThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = new ActionContext(200, 200);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.deltaX).toBe(0);
    expect(actionResult.movement?.deltaY).toBe(0);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('sit');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(actionResult.internalStateChange?.playfulness).toBe(0.033);
    expect(actionResult.internalStateChange?.fear).toBe(-0.033);
    expect(actionResult.internalStateChange?.bonding).toBeUndefined();

    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 複数回実行しても同じ結果を返す（冪等性）', () => {
    const context = new ActionContext(100, 100);

    const result1 = action.execute(context);
    const result2 = action.execute(context);
    const result3 = action.execute(context);

    expect(result1).toEqual(result2);
    expect(result2).toEqual(result3);
  });

  it('シナリオ: ShowBellyActionとの違いを確認', () => {
    const context = new ActionContext(100, 100);

    const sitResult = action.execute(context);
    const sitStateChange = action.getInternalStateChange();

    expect(sitResult.animationCommands[0].animationKey).toBe('sit');
    expect(sitStateChange.bonding).toBeUndefined();
    expect(sitStateChange.playfulness).toBe(0.033);
  });
});
