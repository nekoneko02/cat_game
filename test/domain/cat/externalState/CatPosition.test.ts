import { CatPosition } from '@/domain/cat/externalState/CatPosition';

describe('CatPosition', () => {
  describe('constructor', () => {
    it('正常系: x, y座標を指定して作成できる', () => {
      const position = new CatPosition(100, 200);

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });

    it('境界値: 0座標でも作成できる', () => {
      const position = new CatPosition(0, 0);

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });

    it('境界値: 負の座標でも作成できる', () => {
      const position = new CatPosition(-100, -200);

      expect(position.x).toBe(-100);
      expect(position.y).toBe(-200);
    });
  });

  describe('move', () => {
    it('正常系: 位置を移動した新しいインスタンスを返す', () => {
      const position = new CatPosition(100, 200);
      const newPosition = position.move(50, 30);

      expect(newPosition.x).toBe(150);
      expect(newPosition.y).toBe(230);
    });

    it('正常系: 元のインスタンスは変更されない（Immutable）', () => {
      const position = new CatPosition(100, 200);
      const newPosition = position.move(50, 30);

      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
      expect(newPosition).not.toBe(position);
    });

    it('境界値: 0移動でも新しいインスタンスを返す', () => {
      const position = new CatPosition(100, 200);
      const newPosition = position.move(0, 0);

      expect(newPosition.x).toBe(100);
      expect(newPosition.y).toBe(200);
      expect(newPosition).not.toBe(position);
    });

    it('境界値: 負の移動量でも正しく計算される', () => {
      const position = new CatPosition(100, 200);
      const newPosition = position.move(-50, -30);

      expect(newPosition.x).toBe(50);
      expect(newPosition.y).toBe(170);
    });

    it('境界値: 移動結果が負になる場合も正しく計算される', () => {
      const position = new CatPosition(50, 30);
      const newPosition = position.move(-100, -100);

      expect(newPosition.x).toBe(-50);
      expect(newPosition.y).toBe(-70);
    });
  });

  describe('createDefault', () => {
    it('正常系: デフォルト位置(400, 300)を作成できる', () => {
      const position = CatPosition.createDefault();

      expect(position.x).toBe(400);
      expect(position.y).toBe(300);
    });
  });

  describe('create', () => {
    it('正常系: 指定座標の位置を作成できる', () => {
      const position = CatPosition.create(150, 250);

      expect(position.x).toBe(150);
      expect(position.y).toBe(250);
    });

    it('境界値: 0座標でも作成できる', () => {
      const position = CatPosition.create(0, 0);

      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe('境界制御付きmove', () => {
    const gameWidth = 800;
    const gameHeight = 600;
    const margin = 50;

    it('左端(x=50)を超えないようにクランプされる', () => {
      const position = new CatPosition(100, 300);
      const newPosition = position.move(-100, 0, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(margin); // 50
      expect(newPosition.y).toBe(300);
    });

    it('右端(x=750)を超えないようにクランプされる', () => {
      const position = new CatPosition(700, 300);
      const newPosition = position.move(100, 0, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(gameWidth - margin); // 750
      expect(newPosition.y).toBe(300);
    });

    it('上端(y=50)を超えないようにクランプされる', () => {
      const position = new CatPosition(400, 100);
      const newPosition = position.move(0, -100, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(400);
      expect(newPosition.y).toBe(margin); // 50
    });

    it('下端(y=550)を超えないようにクランプされる', () => {
      const position = new CatPosition(400, 500);
      const newPosition = position.move(0, 100, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(400);
      expect(newPosition.y).toBe(gameHeight - margin); // 550
    });

    it('境界内の移動は通常通り', () => {
      const position = new CatPosition(400, 300);
      const newPosition = position.move(50, 50, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(450);
      expect(newPosition.y).toBe(350);
    });

    it('右下隅を超えようとした場合、両軸ともクランプされる', () => {
      const position = new CatPosition(730, 530);
      const newPosition = position.move(50, 50, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(750);
      expect(newPosition.y).toBe(550);
    });

    it('左上隅を超えようとした場合、両軸ともクランプされる', () => {
      const position = new CatPosition(70, 70);
      const newPosition = position.move(-50, -50, gameWidth, gameHeight, margin);

      expect(newPosition.x).toBe(50);
      expect(newPosition.y).toBe(50);
    });

    it('境界パラメータを省略した場合は従来通りの動作（クランプなし）', () => {
      const position = new CatPosition(100, 200);
      const newPosition = position.move(-200, -300);

      expect(newPosition.x).toBe(-100);
      expect(newPosition.y).toBe(-100);
    });
  });

  describe('Integration Test', () => {
    it('シナリオ: デフォルト位置から複数回移動する', () => {
      const position = CatPosition.createDefault();
      const position1 = position.move(50, 0);
      const position2 = position1.move(0, 100);
      const position3 = position2.move(-25, -50);

      expect(position.x).toBe(400);
      expect(position.y).toBe(300);
      expect(position1.x).toBe(450);
      expect(position1.y).toBe(300);
      expect(position2.x).toBe(450);
      expect(position2.y).toBe(400);
      expect(position3.x).toBe(425);
      expect(position3.y).toBe(350);
    });

    it('シナリオ: 境界制御付きで端まで移動', () => {
      const gameWidth = 800;
      const gameHeight = 600;
      const margin = 50;

      const position = CatPosition.createDefault(); // (400, 300)
      const position1 = position.move(-500, 0, gameWidth, gameHeight, margin); // 左端へ
      const position2 = position1.move(0, -500, gameWidth, gameHeight, margin); // 上端へ
      const position3 = position2.move(1000, 0, gameWidth, gameHeight, margin); // 右端へ
      const position4 = position3.move(0, 1000, gameWidth, gameHeight, margin); // 下端へ

      expect(position1.x).toBe(50);
      expect(position1.y).toBe(300);
      expect(position2.x).toBe(50);
      expect(position2.y).toBe(50);
      expect(position3.x).toBe(750);
      expect(position3.y).toBe(50);
      expect(position4.x).toBe(750);
      expect(position4.y).toBe(550);
    });
  });
});
