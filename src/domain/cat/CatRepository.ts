import { Cat } from './Cat';
import { GameConfig } from '../global/GameConfig';
import { CatPosition } from './externalState/CatPosition';
import { ApiClient } from '@/lib/ApiClient';

/**
 * ねこRepository
 *
 * Catエンティティの生成・取得を管理するRepositoryパターンの実装。
 * シーケンス図の設計に基づき、Cat初期化の責務を集約する。
 *
 * @package ねこ
 */
export class CatRepository {
  private readonly gameConfig: GameConfig;
  private readonly apiClient: ApiClient;

  constructor(apiClient?: ApiClient) {
    this.gameConfig = GameConfig.getInstance();
    this.apiClient = apiClient || ApiClient.getInstance();
  }

  /**
   * ユーザーIDからCatを取得
   *
   * シーケンス図に基づく初期化フロー:
   * 1. API経由でcat_dataを取得
   * 2. GameConfigから画面サイズを取得
   * 3. 画面中央の初期位置を計算
   * 4. BondingFactoryでBondingを生成
   * 5. Catインスタンスを生成して返す
   *
   * @param userId ユーザーID
   * @returns Catインスタンス
   * @throws Error API呼び出しが失敗した場合
   */
  async getCatByUserId(userId: string): Promise<Cat> {
    // 1. API経由でcat_dataを取得
    const response = await this.apiClient.getCatState();

    if (!response.success || !response.data?.catState) {
      throw new Error('Failed to fetch cat data from API');
    }

    const catData = {
      id: `cat-${userId}`, // userIdからcat_idを生成
      name: response.data.catName || 'ねこ',
      bonding: response.data.catState.bonding
    };

    // 2. GameConfigから画面サイズを取得
    const { width: maxWidth, height: maxHeight } = this.gameConfig.getGameScreenSize();

    // 3. 初期位置を画面中央に設定
    const initialPosition = new CatPosition(maxWidth / 2, maxHeight / 2);

    // 4-5. Catインスタンスを生成（Cat内でBondingFactoryを使用）
    return new Cat(
      catData.id,
      catData.name,
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
      { level: 1, gauge: 0 }, // bondingContext
      initialPosition
    );
  }
}
