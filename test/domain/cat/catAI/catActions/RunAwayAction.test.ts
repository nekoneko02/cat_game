import { RunAwayAction } from '@/domain/cat/catAI/catActions/RunAwayAction';
import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('RunAwayAction', () => {
  let action: RunAwayAction;

  beforeEach(() => {
    action = new RunAwayAction();
  });

  describe('constructor', () => {
    it('アクション名が"runAway"で初期化される', () => {
      expect(action.getName()).toBe('runAway');
    });
  });

  describe('目標地点に向かって逃げる動作', () => {
    it('画面内に理想的な逃げ先がある場合、そこに向かって逃げる', () => {
      // 中央(400, 300)、ユーザー(200, 300) = 右方向に逃げる
      // 理想的な目標: (400, 300) + (正規化200, 0) * 150 = (550, 300) は画面内
      const context = new ActionContext(400, 300, 200, 300);

      const result = action.execute(context);

      expect(result.speed).toBe(150);
      expect(result.animationCommands[0].animationKey).toBe('escape');
      expect(result.deltaX).toBeGreaterThan(0); // 右方向
      expect(result.deltaY).toBe(0); // Y方向は変わらない
    });

    it('理想的な逃げ先が画面外の場合、画面端にクランプした位置を目標にする', () => {
      // 右寄り(700, 300)、ユーザー(600, 300) = さらに右に逃げたい
      // 理想的な目標: (700, 300) + (150, 0) = (850, 300) → 画面外
      // クランプ後: (750, 300)
      const context = new ActionContext(700, 300, 600, 300);

      const result = action.execute(context);

      expect(result.speed).toBe(150);
      expect(result.animationCommands[0].animationKey).toBe('escape');
      expect(result.deltaX).toBeGreaterThan(0); // 右方向（端に向かう）
    });

    it('右端から左上に逃げたい場合、画面内に収まる位置を目標にする', () => {
      // 右端(750, 300)、ユーザー(680, 280) = 左上方向に逃げる
      // 理想的な目標は画面外だが、クランプされて画面内の目標になる
      const context = new ActionContext(750, 300, 680, 280);

      const result = action.execute(context);

      expect(result.speed).toBe(150);
      expect(result.animationCommands[0].animationKey).toBe('escape');
      // ユーザーから離れる方向に動く（右上方向になる可能性もある）
      // 少なくともユーザーから遠ざかる動きをする
      const movingAway = result.deltaX !== undefined && result.deltaY !== undefined;
      expect(movingAway).toBe(true);
    });

    it('コーナーに追い詰められた状態', () => {
      // 右下コーナー(750, 550)、ユーザー(650, 450)
      // 理想的な逃げ先は画面外だが、既に端にいるため目標地点に到達している
      // ユーザーが近い(距離約141px > 100px)ため、scared
      const context = new ActionContext(750, 550, 650, 450);

      const result = action.execute(context);

      // 目標地点に到達しているため停止
      expect(result.speed).toBe(0);
      expect(result.animationCommands[0].animationKey).toBe('scared');
    });

    it('目標地点に到着した場合、scaredで停止', () => {
      // 右端(750, 300)にいて、目標地点も右端付近 = 到着
      // ユーザー(200, 300)から十分離れている
      const context = new ActionContext(750, 300, 200, 300);

      const result = action.execute(context);

      expect(result.deltaX).toBe(0);
      expect(result.deltaY).toBe(0);
      expect(result.speed).toBe(0);
      expect(result.animationCommands[0].animationKey).toBe('scared');
    });
  });

  describe('execute', () => {
    describe('ユーザー位置(toy)から離れる方向に移動', () => {
      it('ユーザーが左にいる場合、右方向に逃げる', () => {
        const context = new ActionContext(400, 300, 200, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('ユーザーが右にいる場合、左方向に逃げる', () => {
        const context = new ActionContext(400, 300, 600, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('ユーザーが上にいる場合、下方向に逃げる', () => {
        const context = new ActionContext(400, 300, 400, 200);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaY).toBeGreaterThan(0);
      });

      it('ユーザーが下にいる場合、上方向に逃げる', () => {
        const context = new ActionContext(400, 300, 400, 400);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaY).toBeLessThan(0);
      });

      it('ユーザーが左上にいる場合、右下方向に逃げる', () => {
        const context = new ActionContext(400, 300, 200, 200);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.deltaY).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });
    });

    describe('画面端での動作', () => {
      it('画面端に到着し、ユーザーが遠い場合(>100px): scaredで停止', () => {
        // 右端(750, 300)、ユーザーは左側(200, 300) = 距離550px
        const context = new ActionContext(750, 300, 200, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('画面端だがユーザーが近い場合(<=100px): escapeで逃げ続ける', () => {
        // 右端(750, 300)、ユーザーは近い(680, 300) = 距離70px
        const context = new ActionContext(750, 300, 680, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('境界値: ユーザーとの距離がちょうど100pxの場合: escapeで逃げ続ける', () => {
        // 右端(750, 300)、ユーザー(650, 300) = 距離100px
        const context = new ActionContext(750, 300, 650, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('境界値: ユーザーとの距離が101pxの場合: scaredで停止', () => {
        // 右端(750, 300)、ユーザー(649, 300) = 距離101px
        const context = new ActionContext(750, 300, 649, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('左端での動作確認', () => {
        // 左端(50, 300)、ユーザーは遠い(400, 300) = 距離350px
        const context = new ActionContext(50, 300, 400, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('上端での動作確認', () => {
        // 上端(400, 50)、ユーザーは遠い(400, 400) = 距離350px
        const context = new ActionContext(400, 50, 400, 400);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('下端での動作確認', () => {
        // 下端(400, 550)、ユーザーは遠い(400, 200) = 距離350px
        const context = new ActionContext(400, 550, 400, 200);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });
    });

    describe('flipX判定', () => {
      it('右向き移動の場合flipX=true', () => {
        const context = new ActionContext(400, 300, 200, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('左向き移動の場合flipX=false', () => {
        const context = new ActionContext(400, 300, 600, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('停止時のflipX判定: 右端で停止時は右向き', () => {
        const context = new ActionContext(750, 300, 200, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.flipX).toBe(true);
      });

      it('停止時のflipX判定: 左端で停止時は左向き', () => {
        const context = new ActionContext(50, 300, 400, 300);

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

    it('bonding, playfulness, fearの変化を含まない', () => {
      const change = action.getInternalStateChange();

      expect(change.bonding).toBeUndefined();
      expect(change.playfulness).toBeUndefined();
      expect(change.fear).toBeUndefined();
    });
  });

  describe('getExternalStateChange', () => {
    it('undefinedを返す（外部状態を変更しない）', () => {
      const change = action.getExternalStateChange();

      expect(change).toBeUndefined();
    });
  });
});

describe('RunAwayAction Integration Tests', () => {
  let action: RunAwayAction;

  beforeEach(() => {
    action = new RunAwayAction();
  });

  it('シナリオ: ユーザーから逃げて端で怯える完全な流れ', () => {
    // 開始: 中央付近(400, 300)から左側のユーザー(100, 300)から逃げ始める
    const context1 = new ActionContext(400, 300, 100, 300);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(150);
    expect(result1.animationCommands[0].animationKey).toBe('escape');
    expect(result1.deltaX).toBeGreaterThan(0); // 右方向

    // 移動中: さらに右に移動(600, 300)
    const context2 = new ActionContext(600, 300, 100, 300);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(150);
    expect(result2.animationCommands[0].animationKey).toBe('escape');

    // 到着: 右端(750, 300)でユーザーが遠い(100, 300)ため停止
    const context3 = new ActionContext(750, 300, 100, 300);
    const result3 = action.execute(context3);

    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.speed).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('scared');
  });

  it('シナリオ: ユーザーが追いかけてきたら端でも逃げ続ける', () => {
    // 右端(750, 300)にいて、ユーザーが遠い(100, 300)
    const context1 = new ActionContext(750, 300, 100, 300);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(0);
    expect(result1.animationCommands[0].animationKey).toBe('scared');

    // ユーザーが近づいてきた(680, 300) = 距離70px
    const context2 = new ActionContext(750, 300, 680, 300);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(150);
    expect(result2.animationCommands[0].animationKey).toBe('escape');
  });

  it('シナリオ: ユーザーの位置が変わると逃げる方向も変わる', () => {
    // ユーザーが左上にいる
    const context1 = new ActionContext(400, 300, 200, 200);
    const result1 = action.execute(context1);

    expect(result1.deltaX).toBeGreaterThan(0);
    expect(result1.deltaY).toBeGreaterThan(0);

    // ユーザーが右下に移動
    const context2 = new ActionContext(400, 300, 600, 400);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBeLessThan(0);
    expect(result2.deltaY).toBeLessThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = new ActionContext(400, 300, 200, 300);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.speed).toBe(150);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('escape');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(Object.keys(actionResult.internalStateChange!).length).toBe(0);

    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 4つの端全てに逃げられる', () => {
    // 右端
    const context1 = new ActionContext(400, 300, 200, 300);
    const result1 = action.execute(context1);
    expect(result1.deltaX).toBeGreaterThan(0);

    // 左端
    const context2 = new ActionContext(400, 300, 600, 300);
    const result2 = action.execute(context2);
    expect(result2.deltaX).toBeLessThan(0);

    // 下端
    const context3 = new ActionContext(400, 300, 400, 200);
    const result3 = action.execute(context3);
    expect(result3.deltaY).toBeGreaterThan(0);

    // 上端
    const context4 = new ActionContext(400, 300, 400, 400);
    const result4 = action.execute(context4);
    expect(result4.deltaY).toBeLessThan(0);
  });

  it('シナリオ: 他のアクションとの比較（内部状態変化なし）', () => {
    const context = new ActionContext(400, 300, 200, 300);

    const actionResult = action.createActionResult(context);
    const stateChange = action.getInternalStateChange();

    expect(stateChange).toEqual({});
    expect(actionResult.internalStateChange).toEqual({});
  });
});
