import { Cat } from './Cat';
import { ExternalState } from '../gameLogic/environment/ExternalState';
import { GameTimeManager } from '@/game/GameTimeManager';
import { GameConfig } from '../global/GameConfig';
import { CatPosition } from './externalState/CatPosition';

/**
 * ねこRepository
 *
 * Catエンティティの生成・取得を管理するRepositoryパターンの実装。
 * シーケンス図の設計に基づき、Cat初期化の責務を集約する。
 *
 * @package ねこ
 */
export class CatRepository {
  private readonly gameTimeManager: GameTimeManager;
  private readonly gameConfig: GameConfig;

  constructor(gameTimeManager: GameTimeManager) {
    this.gameTimeManager = gameTimeManager;
    this.gameConfig = GameConfig.getInstance();
  }

  /**
   * ユーザーIDからCatを取得
   *
   * シーケンス図に基づく初期化フロー:
   * 1. API経由でcat_dataを取得（引数で受け取る）
   * 2. GameConfigから画面サイズを取得
   * 3. 画面中央の初期位置を計算
   * 4. BondingFactoryでBondingを生成
   * 5. Catインスタンスを生成して返す
   *
   * @param userId ユーザーID
   * @param catData APIから取得したねこデータ
   * @returns Catインスタンス
   */
  getCatByUserId(
    userId: string,
    catData: {
      id: string;
      name: string;
      bonding: { level: number; gauge: number };
    }
  ): Cat {
    // GameConfigから画面サイズを取得
    const { width: maxWidth, height: maxHeight } = this.gameConfig.getGameScreenSize();

    // 初期位置を画面中央に設定
    const initialPosition = new CatPosition(maxWidth / 2, maxHeight / 2);

    // Catインスタンスを生成
    return new Cat(
      catData.id,
      catData.name,
      ExternalState.createDefault(),
      0, // lastUpdateTime
      this.gameTimeManager,
      catData.bonding,
      initialPosition
    );
  }

  /**
   * 新しいCatを作成
   *
   * @param name ねこの名前
   * @returns 新しいCatインスタンス
   */
  createCat(name: string): Cat {
    // GameConfigから画面サイズを取得
    const { width: maxWidth, height: maxHeight } = this.gameConfig.getGameScreenSize();

    // 初期位置を画面中央に設定
    const initialPosition = new CatPosition(maxWidth / 2, maxHeight / 2);

    // 一意のIDを生成
    const id = 'cat-' + performance.now();

    // Catインスタンスを生成
    return new Cat(
      id,
      name,
      ExternalState.createDefault(),
      0, // lastUpdateTime
      this.gameTimeManager,
      { level: 0, gauge: 0 }, // bondingContext
      initialPosition
    );
  }
}
