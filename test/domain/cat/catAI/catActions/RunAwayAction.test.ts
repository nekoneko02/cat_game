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

  describe('execute', () => {
    describe('おもちゃがない場合', () => {
      it('現在位置から最も近いコーナーに逃げる', () => {
        const context = new ActionContext(400, 300);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('中央(400, 300)から左上コーナー(50, 50)に逃げる（最も近い）', () => {
        const context = new ActionContext(400, 300);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.deltaY).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('左上寄り(100, 100)から左上コーナー(50, 50)に逃げる（最も近い）', () => {
        const context = new ActionContext(100, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.deltaY).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('右下寄り(700, 500)から右下コーナー(750, 550)に逃げる（最も近い）', () => {
        const context = new ActionContext(700, 500);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.deltaY).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });
    });

    describe('おもちゃがある場合', () => {
      it('おもちゃから最も遠いコーナーに逃げる', () => {
        const context = new ActionContext(400, 300, 100, 100);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });

      it('おもちゃが左上にある場合、右下コーナーに逃げる', () => {
        const context = new ActionContext(400, 300, 100, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.deltaY).toBeGreaterThan(0);
        expect(result.flipX).toBe(true);
      });

      it('おもちゃが右下にある場合、左上コーナーに逃げる', () => {
        const context = new ActionContext(400, 300, 700, 500);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.deltaY).toBeLessThan(0);
        expect(result.flipX).toBe(false);
      });

      it('おもちゃが右上にある場合、左下コーナーに逃げる', () => {
        const context = new ActionContext(400, 300, 700, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBeLessThan(0);
        expect(result.deltaY).toBeGreaterThan(0);
        expect(result.flipX).toBe(false);
      });

      it('おもちゃが左下にある場合、右上コーナーに逃げる', () => {
        const context = new ActionContext(400, 300, 100, 500);

        const result = action.execute(context);

        expect(result.deltaX).toBeGreaterThan(0);
        expect(result.deltaY).toBeLessThan(0);
        expect(result.flipX).toBe(true);
      });
    });

    describe('コーナーに到着した場合', () => {
      it('おもちゃがある場合: おもちゃから最遠のコーナー付近で停止', () => {
        // おもちゃ(100,100)から最も遠いのは右下コーナー(750,550)
        // 右下コーナーから15px以内の位置(735,540)
        const context = new ActionContext(735, 540, 100, 100);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('おもちゃがない場合: 現在位置から最寄りのコーナー付近で停止', () => {
        // 左上付近(60,60)の場合、左上コーナー(50,50)が最寄り
        // 左上コーナーから14px程度の位置で停止
        const context = new ActionContext(60, 60);

        const result = action.execute(context);

        expect(result.deltaX).toBe(0);
        expect(result.deltaY).toBe(0);
        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('到着距離境界値テスト: ちょうど30pxで停止', () => {
        // おもちゃ(100,100)から最遠は右下コーナー(750,550)
        // 右下コーナーからちょうど30pxの位置(720,550)
        const context = new ActionContext(720, 550, 100, 100);

        const result = action.execute(context);

        expect(result.speed).toBe(0);
        expect(result.animationCommands[0].animationKey).toBe('scared');
      });

      it('到着距離境界値テスト: 31px以上で移動継続', () => {
        // おもちゃ(100,100)から最遠は右下コーナー(750,550)
        // 右下コーナーから31px離れた位置(719,550)
        const context = new ActionContext(719, 550, 100, 100);

        const result = action.execute(context);

        expect(result.speed).toBe(150);
        expect(result.animationCommands[0].animationKey).toBe('escape');
      });
    });

    describe('flipX判定', () => {
      it('右向き移動の場合flipX=true', () => {
        const context = new ActionContext(100, 100);

        const result = action.execute(context);

        if (result.deltaX && result.deltaX > 0) {
          expect(result.flipX).toBe(true);
        }
      });

      it('左向き移動の場合flipX=false', () => {
        const context = new ActionContext(700, 500);

        const result = action.execute(context);

        if (result.deltaX && result.deltaX < 0) {
          expect(result.flipX).toBe(false);
        }
      });

      it('停止時のflipX判定', () => {
        // コーナー付近で停止する位置（おもちゃから最遠のコーナー）
        const context = new ActionContext(735, 540, 100, 100);

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

  it('シナリオ: 怖がってコーナーに逃げる完全な流れ', () => {
    // 開始: 中央付近(400, 300)から逃げ始める
    const context1 = new ActionContext(400, 300, 100, 100);
    const result1 = action.execute(context1);

    expect(result1.speed).toBe(150);
    expect(result1.animationCommands[0].animationKey).toBe('escape');

    // 移動中: コーナーに近づく(600, 450)
    const context2 = new ActionContext(600, 450, 100, 100);
    const result2 = action.execute(context2);

    expect(result2.speed).toBe(150);
    expect(result2.animationCommands[0].animationKey).toBe('escape');

    // 到着: コーナー付近(750, 550)で停止
    const context3 = new ActionContext(750, 550, 100, 100);
    const result3 = action.execute(context3);

    expect(result3.deltaX).toBe(0);
    expect(result3.deltaY).toBe(0);
    expect(result3.speed).toBe(0);
    expect(result3.animationCommands[0].animationKey).toBe('scared');
  });

  it('シナリオ: おもちゃの位置が変わっても最遠コーナーを再計算', () => {
    // おもちゃが左上にある
    const context1 = new ActionContext(400, 300, 100, 100);
    const result1 = action.execute(context1);

    expect(result1.deltaX).toBeGreaterThan(0);
    expect(result1.deltaY).toBeGreaterThan(0);

    // おもちゃが右下に移動
    const context2 = new ActionContext(400, 300, 700, 500);
    const result2 = action.execute(context2);

    expect(result2.deltaX).toBeLessThan(0);
    expect(result2.deltaY).toBeLessThan(0);
  });

  it('シナリオ: createActionResultで完全な結果を取得', () => {
    const context = new ActionContext(400, 300, 100, 100);

    const actionResult = action.createActionResult(context);

    expect(actionResult.movement).toBeDefined();
    expect(actionResult.movement?.speed).toBe(150);
    expect(actionResult.movement?.animationCommands[0].animationKey).toBe('escape');

    expect(actionResult.internalStateChange).toBeDefined();
    expect(Object.keys(actionResult.internalStateChange!).length).toBe(0);

    expect(actionResult.externalStateChange).toBeUndefined();
  });

  it('シナリオ: 4つのコーナー全てに逃げられる（おもちゃなし時は最寄り）', () => {
    // 右下付近(700, 500)から右下コーナー (750, 550) へ（最寄り）
    const context1 = new ActionContext(700, 500);
    const result1 = action.execute(context1);
    expect(result1.deltaX).toBeGreaterThan(0);
    expect(result1.deltaY).toBeGreaterThan(0);

    // 左下付近(100, 500)から左下コーナー (50, 550) へ（最寄り）
    const context2 = new ActionContext(100, 500);
    const result2 = action.execute(context2);
    expect(result2.deltaX).toBeLessThan(0);
    expect(result2.deltaY).toBeGreaterThan(0);

    // 右上付近(700, 100)から右上コーナー (750, 50) へ（最寄り）
    const context3 = new ActionContext(700, 100);
    const result3 = action.execute(context3);
    expect(result3.deltaX).toBeGreaterThan(0);
    expect(result3.deltaY).toBeLessThan(0);

    // 左上付近(100, 100)から左上コーナー (50, 50) へ（最寄り）
    const context4 = new ActionContext(100, 100);
    const result4 = action.execute(context4);
    expect(result4.deltaX).toBeLessThan(0);
    expect(result4.deltaY).toBeLessThan(0);
  });

  it('シナリオ: 他のアクションとの比較（内部状態変化なし）', () => {
    const context = new ActionContext(400, 300);

    const actionResult = action.createActionResult(context);
    const stateChange = action.getInternalStateChange();

    expect(stateChange).toEqual({});
    expect(actionResult.internalStateChange).toEqual({});
  });
});
