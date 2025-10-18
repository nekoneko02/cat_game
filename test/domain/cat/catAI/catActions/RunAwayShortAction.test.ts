import { RunAwayShortAction } from '@/domain/cat/catAI/catActions/RunAwayShortAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('RunAwayShortAction', () => {
  let action: RunAwayShortAction;

  beforeEach(() => {
    action = new RunAwayShortAction();
  });

  describe('constructor', () => {
    it('アクション名が"runAwayShort"で初期化される', () => {
      expect(action.getName()).toBe('runAwayShort');
    });
  });

  describe('execute', () => {
    describe('ユーザー位置(toy)から離れる方向に移動', () => {
      it('ユーザーが左にいる場合、右方向に逃げる', () => {
        const context = ActionContext.withToy(400, 300, 350, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('ユーザーが右にいる場合、左方向に逃げる', () => {
        const context = ActionContext.withToy(400, 300, 450, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('ユーザーが上にいる場合、下方向に逃げる', () => {
        const context = ActionContext.withToy(400, 300, 400, 250, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaY).toBeGreaterThan(0);
      });

      it('ユーザーが下にいる場合、上方向に逃げる', () => {
        const context = ActionContext.withToy(400, 300, 400, 350, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaY).toBeLessThan(0);
      });
    });

    describe('ユーザーとの距離による動作', () => {
      it('ユーザーとの距離が300px以下の場合: escapeで逃げる', () => {
        // 距離80px
        const context = ActionContext.withToy(400, 300, 320, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('ユーザーとの距離がちょうど300pxの場合: escapeで逃げる', () => {
        // 距離300px
        const context = ActionContext.withToy(400, 300, 100, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(120);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('ユーザーとの距離が301pxの場合: shrinkBackで停止', () => {
        // 距離301px
        const context = ActionContext.withToy(400, 300, 99, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('shrinkBack');
      });

      it('ユーザーとの距離が400pxの場合: shrinkBackで停止', () => {
        // 距離400px（画面端近く）
        const context = ActionContext.withToy(600, 300, 200, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('shrinkBack');
      });
    });

    describe('flipX判定', () => {
      it('右向き移動の場合flipX=true', () => {
        const context = ActionContext.withToy(400, 300, 350, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('左向き移動の場合flipX=false', () => {
        const context = ActionContext.withToy(400, 300, 450, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('停止時のflipX判定: 右方向から逃げて停止', () => {
        // ユーザー(50, 300)から距離350pxで停止
        const context = ActionContext.withToy(400, 300, 50, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.flipX).toBe(true);
      });

      it('停止時のflipX判定: 左方向から逃げて停止', () => {
        // ユーザー(750, 300)から距離350pxで停止
        const context = ActionContext.withToy(400, 300, 750, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.flipX).toBe(false);
      });
    });
  });

  describe('getInternalStateChange', () => {
    it('空のオブジェクトを返す（状態を変更しない）', () => {
      const change = action.getInternalStateChange();

      expect(change).toBeDefined();
      expect(Object.keys(change).length).toBe(0);
    });
  });

  describe('getExternalStateChange', () => {
    it('undefinedを返す（外部状態を変更しない）', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeUndefined();
    });
  });
});

describe('RunAwayShortAction Integration Tests', () => {
  let action: RunAwayShortAction;

  beforeEach(() => {
    action = new RunAwayShortAction();
  });

  it('シナリオ: ユーザーから逃げて縮こまる完全な流れ', () => {
    // 開始: ユーザー(200, 300)から近い位置(300, 300)で逃げ始める (距離100px)
    const context1 = ActionContext.withToy(300, 300, 200, 300, false, false);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(120);
    expect(result1.animationCommands[0].animationKey).toBe('escape');
    expect(result1.deltaX).toBeGreaterThan(0); // 右方向

    // 移動中: ユーザーとの距離が200px
    const context2 = ActionContext.withToy(400, 300, 200, 300, false, false);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(120);
    expect(result2.animationCommands[0].animationKey).toBe('escape');

    // 到着: ユーザーとの距離が350pxで停止・縮こまる
    const context3 = ActionContext.withToy(550, 300, 200, 300, false, false);
    const result3 = action.execute(context3);

    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.speed).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('shrinkBack');
  });

  it('シナリオ: ユーザーが追いかけてきたら再び逃げる', () => {
    // 距離350pxで縮こまっている
    const context1 = ActionContext.withToy(550, 300, 200, 300, false, false);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(0);
    expect(result1.animationCommands[0].animationKey).toBe('shrinkBack');

    // ユーザーが近づいてきた(距離250px)
    const context2 = ActionContext.withToy(550, 300, 300, 300, false, false);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(120);
    expect(result2.animationCommands[0].animationKey).toBe('escape');
  });

  it('シナリオ: ユーザーの位置が変わると逃げる方向も変わる', () => {
    // ユーザーが左にいる
    const context1 = ActionContext.withToy(400, 300, 350, 300, false, false);
    const result1 = action.execute(context1);

    expect(result1.deltaX).toBeGreaterThan(0);

    // ユーザーが右に移動
    const context2 = ActionContext.withToy(400, 300, 450, 300, false, false);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBeLessThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = ActionContext.withToy(400, 300, 350, 300, false, false);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.speed).toBe(120);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('escape');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(Object.keys(actionResult.internalStateChange!).length).toBe(0);

    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 他のアクションとの比較（内部状態変化なし）', () => {
    const context = ActionContext.withToy(400, 300, 350, 300, false, false);

    const actionResult = action.createActionResult(context);
    const stateChange = action.getInternalStateChange();

    expect(stateChange).toEqual({});
    expect(actionResult.internalStateChange).toEqual({});
  });
});
