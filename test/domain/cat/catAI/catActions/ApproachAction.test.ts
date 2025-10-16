import { ApproachAction } from '@/domain/cat/catAI/catActions/ApproachAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('ApproachAction', () => {
  let action: ApproachAction;

  beforeEach(() => {
    action = new ApproachAction();
  });

  describe('constructor', () => {
    it('アクション名が"approach"で初期化される', () => {
      expect(action.getName()).toBe('approach');
    });
  });

  describe('execute', () => {
    describe('ユーザー位置(toy)に向かって移動', () => {
      it('ユーザーが右にいる場合、右方向に移動', () => {
        const context = new ActionContext(400, 300, 550, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('ユーザーが左にいる場合、左方向に移動', () => {
        const context = new ActionContext(400, 300, 250, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('ユーザーが上にいる場合、上方向に移動', () => {
        const context = new ActionContext(400, 300, 400, 150);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaY).toBeLessThan(0);
      });

      it('ユーザーが下にいる場合、下方向に移動', () => {
        const context = new ActionContext(400, 300, 400, 550);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
        expect(result.deltaY).toBeGreaterThan(0);
      });
    });

    describe('ユーザーとの距離による動作', () => {
      it('ユーザーとの距離が100pxより大きい場合: walkで近づく', () => {
        // 距離150px
        const context = new ActionContext(400, 300, 550, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
      });

      it('ユーザーとの距離がちょうど100pxの場合: idleで停止', () => {
        // 距離100px
        const context = new ActionContext(400, 300, 500, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
      });

      it('ユーザーとの距離が101pxの場合: walkで近づく', () => {
        // 距離101px
        const context = new ActionContext(400, 300, 501, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(80);
        expect(result.animationCommands[0].animationKey).toBe('walk');
      });

      it('ユーザーとの距離が99pxの場合: idleで停止', () => {
        // 距離99px
        const context = new ActionContext(400, 300, 499, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
      });
    });

    describe('おもちゃ(toy)がない場合', () => {
      it('移動せずidleアニメーション', () => {
        const context = new ActionContext(400, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('idle');
      });
    });

    describe('flipX判定', () => {
      it('右向き移動の場合flipX=true', () => {
        const context = new ActionContext(400, 300, 550, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('左向き移動の場合flipX=false', () => {
        const context = new ActionContext(400, 300, 250, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('停止時のflipX判定: 右方向に近づいて停止', () => {
        // ユーザー(499, 300)に到着して停止 (距離99px)
        const context = new ActionContext(400, 300, 499, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.flipX).toBe(true);
      });

      it('停止時のflipX判定: 左方向に近づいて停止', () => {
        // ユーザー(301, 300)に到着して停止 (距離99px)
        const context = new ActionContext(400, 300, 301, 300);

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

describe('ApproachAction Integration Tests', () => {
  let action: ApproachAction;

  beforeEach(() => {
    action = new ApproachAction();
  });

  it('シナリオ: ユーザーに近づいて停止する完全な流れ', () => {
    // 開始: ユーザー(500, 300)から遠い位置(300, 300)で近づき始める (距離200px)
    const context1 = new ActionContext(300, 300, 500, 300);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(80);
    expect(result1.animationCommands[0].animationKey).toBe('walk');
    expect(result1.deltaX).toBeGreaterThan(0); // 右方向

    // 移動中: ユーザーとの距離が120px
    const context2 = new ActionContext(380, 300, 500, 300);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(80);
    expect(result2.animationCommands[0].animationKey).toBe('walk');

    // 到着: ユーザーとの距離が100px以下で停止 (距離50px)
    const context3 = new ActionContext(450, 300, 500, 300);
    const result3 = action.execute(context3);

    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.speed).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('idle');
  });

  it('シナリオ: ユーザーが離れたら再び近づく', () => {
    // 距離50pxで停止している
    const context1 = new ActionContext(450, 300, 500, 300);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(0);
    expect(result1.animationCommands[0].animationKey).toBe('idle');

    // ユーザーが離れた(距離150px)
    const context2 = new ActionContext(450, 300, 600, 300);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(80);
    expect(result2.animationCommands[0].animationKey).toBe('walk');
  });

  it('シナリオ: ユーザーの位置が変わると移動方向も変わる', () => {
    // ユーザーが右にいる
    const context1 = new ActionContext(400, 300, 550, 300);
    const result1 = action.execute(context1);

    expect(result1.deltaX).toBeGreaterThan(0);

    // ユーザーが左に移動
    const context2 = new ActionContext(400, 300, 250, 300);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBeLessThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = new ActionContext(400, 300, 550, 300);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.speed).toBe(80);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('walk');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(Object.keys(actionResult.internalStateChange!).length).toBe(0);

    expect(actionResult.externalStateChange).toBeUndefined();
  });
});
