
import { BondingUpdateNotification } from '@/domain/cat/catAI/bonding/BondingUpdateNotification';

describe('BondingUpdateNotification', () => {
  describe('constructor and getActionName', () => {
    it('アクション名を設定して取得できる', () => {
      const notification = new BondingUpdateNotification('sit');
      expect(notification.getActionName()).toBe('sit');
    });

    it('空文字列のアクション名も設定できる', () => {
      const notification = new BondingUpdateNotification('');
      expect(notification.getActionName()).toBe('');
    });
  });
});
