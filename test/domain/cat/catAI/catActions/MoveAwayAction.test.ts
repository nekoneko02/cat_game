import { MoveAwayAction } from '@/domain/cat/catAI/catActions/MoveAwayAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('MoveAwayAction', () => {
  let action: MoveAwayAction;

  beforeEach(() => {
    action = new MoveAwayAction();
  });

  describe('constructor', () => {
    it('アクション名が"moveAway"で初期化される', () => {
      expect(action.getName()).toBe('moveAway');
    });
  });

  describe('execute', () => {
    describe('ユーザー位置(toy)から離れる方向に移動', () => {
      it('ユーザーが左にいる場合、右方向に移動', () => {
        const context = ActionContext.withToy(400, 300, 350, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('ユーザーが右にいる場合、左方向に移動', () => {
        const context = ActionContext.withToy(400, 300, 450, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('ユーザーが上にいる場合、下方向に移動', () => {
        const context = ActionContext.withToy(400, 300, 400, 250, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaY).toBeGreaterThan(0);
      });

      it('ユーザーが下にいる場合、上方向に移動', () => {
        const context = ActionContext.withToy(400, 300, 400, 350, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaY).toBeLessThan(0);
      });
    });

    describe('ユーザーとの距離による動作', () => {
      it('ユーザーとの距離が200px未満の場合: walkで離れる', () => {
        // 距離100px
        const context = ActionContext.withToy(400, 300, 300, 300, false, false);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
      });

      it('ユーザーとの距離がちょうど200pxの場合: idleで停止', () => {
        // 距離200px
        const context = ActionContext.withToy(400, 300, 200, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
      });

      it('ユーザーとの距離が250pxの場合: idleで停止', () => {
        // 距離250px
        const context = ActionContext.withToy(400, 300, 150, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
      });
    });

    describe('おもちゃ(toy)がない場合', () => {
      it('移動せずidleアニメーション', () => {
        const context = ActionContext.withoutToy(400, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
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

      it('停止時のflipX判定: 右方向に離れて停止', () => {
        // ユーザー(150, 300)から距離250pxで停止
        const context = ActionContext.withToy(400, 300, 150, 300, false, false);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.flipX).toBe(true);
      });

      it('停止時のflipX判定: 左方向に離れて停止', () => {
        // ユーザー(650, 300)から距離250pxで停止
        const context = ActionContext.withToy(400, 300, 650, 300, false, false);

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

describe('MoveAwayAction Integration Tests', () => {
  let action: MoveAwayAction;

  beforeEach(() => {
    action = new MoveAwayAction();
  });

  it('シナリオ: ユーザーから離れて停止する完全な流れ', () => {
    // 開始: ユーザー(300, 300)の近く(400, 300)で離れ始める (距離100px)
    const context1 = ActionContext.withToy(400, 300, 300, 300, false, false);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(80);
    expect(result1.animationCommands[0].animationKey).toBe('walk');
    expect(result1.deltaX).toBeGreaterThan(0); // 右方向

    // 移動中: ユーザーとの距離が150px
    const context2 = ActionContext.withToy(450, 300, 300, 300, false, false);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(80);
    expect(result2.animationCommands[0].animationKey).toBe('walk');

    // 到着: ユーザーとの距離が200px以上で停止
    const context3 = ActionContext.withToy(500, 300, 300, 300, false, false);
    const result3 = action.execute(context3);

    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.speed).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('idle');
  });

  it('シナリオ: ユーザーが近づいてきたら再び離れる', () => {
    // 距離250pxで停止している
    const context1 = ActionContext.withToy(550, 300, 300, 300, false, false);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(0);
    expect(result1.animationCommands[0].animationKey).toBe('idle');

    // ユーザーが近づいてきた(距離150px)
    const context2 = ActionContext.withToy(550, 300, 400, 300, false, false);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(80);
    expect(result2.animationCommands[0].animationKey).toBe('walk');
  });

  it('シナリオ: ユーザーの位置が変わると移動方向も変わる', () => {
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
    expect(actionResult.movement?.speed).toBe(80);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('walk');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(Object.keys(actionResult.internalStateChange!).length).toBe(0);

    expect(actionResult.externalStateChange).toBeUndefined();
  });
});
