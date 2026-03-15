import { ActionContext } from '@/domain/cat/catAI/catActions/ActionContext';

describe('ActionContext', () => {
  describe('constructor', () => {
    it('すべてのパラメータを正しく設定できる', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 150,
        toyY: 250,
        flipX: true,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.currentX).toBe(100);
      expect(context.currentY).toBe(200);
      expect(context.toyX).toBe(150);
      expect(context.toyY).toBe(250);
      expect(context.flipX).toBe(true);
      expect(context.toyPresence).toBe(true);
      expect(context.userPresence).toBe(true);
      expect(context.isPlaying).toBe(false);
    });

    it('オプションパラメータを省略できる', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.toyX).toBeUndefined();
      expect(context.toyY).toBeUndefined();
      expect(context.flipX).toBe(false);
    });
  });

  describe('hasToy', () => {
    it('toyX と toyY が両方定義されている場合 true を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 150,
        toyY: 250,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.hasToy()).toBe(true);
    });

    it('toyX のみ定義されている場合 false を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 150,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.hasToy()).toBe(false);
    });

    it('toyY のみ定義されている場合 false を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyY: 250,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.hasToy()).toBe(false);
    });

    it('toyX と toyY が両方未定義の場合 false を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.hasToy()).toBe(false);
    });
  });

  describe('getToyDistance', () => {
    it('おもちゃが存在する場合、距離を計算する', () => {
      const context = new ActionContext({
        currentX: 0,
        currentY: 0,
        toyX: 3,
        toyY: 4,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.getToyDistance()).toBe(5);
    });

    it('おもちゃが存在しない場合、Number.MAX_VALUE を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.getToyDistance()).toBe(Number.MAX_VALUE);
    });
  });

  describe('getToyDirection', () => {
    it('おもちゃが存在する場合、正規化された方向ベクトルを返す', () => {
      const context = new ActionContext({
        currentX: 0,
        currentY: 0,
        toyX: 3,
        toyY: 4,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      const direction = context.getToyDirection();
      expect(direction).not.toBeNull();
      expect(direction!.x).toBeCloseTo(0.6);
      expect(direction!.y).toBeCloseTo(0.8);
    });

    it('おもちゃと同じ位置の場合、ゼロベクトルを返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 100,
        toyY: 200,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      const direction = context.getToyDirection();
      expect(direction).toEqual({ x: 0, y: 0 });
    });

    it('おもちゃが存在しない場合、null を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyPresence: false,
        userPresence: true,
        isPlaying: false
      });

      expect(context.getToyDirection()).toBeNull();
    });
  });

  describe('static factory methods', () => {
    it('withoutToy でおもちゃなしのコンテキストを作成できる', () => {
      const context = ActionContext.withoutToy(100, 200, true, false, false);

      expect(context.currentX).toBe(100);
      expect(context.currentY).toBe(200);
      expect(context.flipX).toBe(false);
      expect(context.toyX).toBeUndefined();
      expect(context.toyY).toBeUndefined();
      expect(context.hasToy()).toBe(false);
      expect(context.userPresence).toBe(true);
      expect(context.isPlaying).toBe(false);
    });

    it('withToy でおもちゃありのコンテキストを作成できる', () => {
      const context = ActionContext.withToy(100, 200, 150, 250, true, false, false);

      expect(context.currentX).toBe(100);
      expect(context.currentY).toBe(200);
      expect(context.toyX).toBe(150);
      expect(context.toyY).toBe(250);
      expect(context.flipX).toBe(false);
      expect(context.hasToy()).toBe(true);
      expect(context.userPresence).toBe(true);
      expect(context.isPlaying).toBe(false);
    });
  });

  describe('position helpers', () => {
    it('isToyAboveCatOnScreen はおもちゃが上にあるとき true を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 100,
        toyY: 100, // 上（Y座標が小さい）
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.isToyAboveCatOnScreen()).toBe(true);
    });

    it('isToyBelowCatOnScreen はおもちゃが下にあるとき true を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 100,
        toyY: 300, // 下（Y座標が大きい）
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.isToyBelowCatOnScreen()).toBe(true);
    });

    it('isToyRightOfCatOnScreen はおもちゃが右にあるとき true を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 200, // 右（X座標が大きい）
        toyY: 200,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.isToyRightOfCatOnScreen()).toBe(true);
    });

    it('isToyLeftOfCatOnScreen はおもちゃが左にあるとき true を返す', () => {
      const context = new ActionContext({
        currentX: 100,
        currentY: 200,
        toyX: 50, // 左（X座標が小さい）
        toyY: 200,
        toyPresence: true,
        userPresence: true,
        isPlaying: false
      });

      expect(context.isToyLeftOfCatOnScreen()).toBe(true);
    });
  });
});
