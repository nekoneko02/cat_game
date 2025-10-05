import { PlayWithToyAction } from '@/domain/cat/catAI/catActions/PlayWithToyAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('PlayWithToyAction', () => {
  let action: PlayWithToyAction;

  beforeEach(() => {
    action = new PlayWithToyAction();
  });

  describe('constructor', () => {
    it('アクション名が"playWithToy"で初期化される', () => {
      expect(action.getName()).toBe('playWithToy');
    });
  });

  describe('execute', () => {
    describe('おもちゃがない場合', () => {
      it('移動せずidleアニメーションを返す', () => {
        const context = new ActionContext(100, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('idle');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });
    });

    describe('おもちゃが遠い場合', () => {
      it('おもちゃに向かって移動しchaseアニメーションを返す', () => {
        const context = new ActionContext(100, 100, 300, 200);

        const result = action.execute(context);

        expect(result.deltaX).toBeDefined();
        expect(result.deltaY).toBeDefined();
        expect(result.speed).toBe(200);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('chase');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });

      it('右方向のおもちゃに向かう場合flipX=trueになる', () => {
        const context = new ActionContext(100, 100, 300, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('左方向のおもちゃに向かう場合flipX=falseになる', () => {
        const context = new ActionContext(300, 100, 100, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });
    });

    describe('おもちゃが近い場合（60px以内）', () => {
      it('停止してplayアニメーションを返す', () => {
        const context = new ActionContext(100, 100, 130, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands).toHaveLength(1);
        expect(result.animationCommands[0].animationKey).toBe('play');
        expect(result.animationCommands[0].repeat).toBe(-1);
      });

      it('おもちゃの方向を向く（右側のおもちゃ）', () => {
        const context = new ActionContext(100, 100, 150, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.flipX).toBe(true);
      });

      it('おもちゃの方向を向く（左側のおもちゃ）', () => {
        const context = new ActionContext(100, 100, 50, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.flipX).toBe(false);
      });

      it('ちょうど60pxの距離でplayアニメーションになる', () => {
        const context = new ActionContext(100, 100, 160, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('play');
      });

      it('61pxの距離ではchaseアニメーションになる', () => {
        const context = new ActionContext(100, 100, 161, 100);

        const result = action.execute(context);

        expect(result.speed).toBe(200);
        expect(result.animationCommands[0].animationKey).toBe('chase');
      });
    });
  });

  describe('getInternalStateChange', () => {
    it('bondingの変化を返す', () => {
      const change = action.getInternalStateChange();

      expect(change).toBeDefined();
      expect(change.bonding).toBe(0.033);
    });

    it('playfulnessとfearの変化は含まれない', () => {
      const change = action.getInternalStateChange();

      expect(change.playfulness).toBeUndefined();
      expect(change.fear).toBeUndefined();
    });

    it('3秒間の合計で意図した値になる', () => {
      const change = action.getInternalStateChange();
      const duration = 3;

      expect(change.bonding * duration).toBeCloseTo(0.1, 2);
    });

    it('bondingが正の値で増加する', () => {
      const change = action.getInternalStateChange();

      expect(change.bonding).toBeGreaterThan(0);
    });
  });

  describe('getExternalStateChange', () => {
    it('isPlaying=trueを返す', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeDefined();
      expect(change.isPlaying).toBe(true);
    });
  });
});

describe('PlayWithToyAction Integration Tests', () => {
  let action: PlayWithToyAction;

  beforeEach(() => {
    action = new PlayWithToyAction();
  });

  it('シナリオ: おもちゃを追いかけて捕まえるまでの流れ', () => {
    // 初期位置: 猫(100, 100)、おもちゃ(300, 200) - 遠い
    const context1 = new ActionContext(100, 100, 300, 200);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(200);
    expect(result1.animationCommands[0].animationKey).toBe('chase');

    // 移動中: 猫(200, 150)、おもちゃ(300, 200) - まだ遠い
    const context2 = new ActionContext(200, 150, 300, 200);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(200);
    expect(result2.animationCommands[0].animationKey).toBe('chase');

    // 到着: 猫(280, 190)、おもちゃ(300, 200) - 近い
    const context3 = new ActionContext(280, 190, 300, 200);
    const result3 = action.execute(context3);

    expect(result3.speed).toBe(0);
    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('play');
  });

  it('シナリオ: おもちゃが消えた場合の挙動', () => {
    // おもちゃがある状態
    const context1 = new ActionContext(100, 100, 300, 200);
    const result1 = action.execute(context1);

    expect(result1.animationCommands[0].animationKey).toBe('chase');

    // おもちゃが消えた
    const context2 = new ActionContext(200, 150);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBe(0);
    expect(result2.deltaY).toBe(0);
    expect(result2.animationCommands[0].animationKey).toBe('idle');
  });

  it('シナリオ: 対角線方向のおもちゃを追いかける', () => {
    // 左上から右下へ
    const context1 = new ActionContext(50, 50, 350, 350);
    const result1 = action.execute(context1);

    expect(result1.deltaX).toBeGreaterThan(0);
    expect(result1.deltaY).toBeGreaterThan(0);
    expect(result1.flipX).toBe(true);

    // 右下から左上へ
    const context2 = new ActionContext(350, 350, 50, 50);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBeLessThan(0);
    expect(result2.deltaY).toBeLessThan(0);
    expect(result2.flipX).toBe(false);
  });
});
