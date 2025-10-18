/**
 * なつき度更新通知
 *
 * アクション実行結果として、なつき度更新に渡される通知オブジェクト
 *
 * @package ねこ.ねこAI.なつき
 */
export class BondingUpdateNotification {
  /**
   * 実行されたねこアクション名
   */
  private readonly actionName: string;

  constructor(actionName: string) {
    this.actionName = actionName;
  }

  getActionName(): string {
    return this.actionName;
  }
}
