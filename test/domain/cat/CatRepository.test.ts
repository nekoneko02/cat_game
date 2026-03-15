import { CatRepository } from '@/domain/cat/CatRepository';
import { Cat } from '@/domain/cat/Cat';
import { ApiClient, ApiResponse } from '@/lib/ApiClient';
import { CatState } from '@/lib/session';

// モックApiClient
class MockApiClient extends ApiClient {
  private mockCatState: CatState | null = null;
  private mockCatName: string | null = null;

  setMockData(catState: CatState | null, catName: string | null) {
    this.mockCatState = catState;
    this.mockCatName = catName;
  }

  async getCatState(): Promise<ApiResponse<{ catState: CatState | null; catName: string | null }>> {
    return {
      success: true,
      data: {
        catState: this.mockCatState,
        catName: this.mockCatName
      }
    };
  }
}

describe('CatRepository', () => {
  let repository: CatRepository;
  let mockApiClient: MockApiClient;

  beforeEach(() => {
    mockApiClient = new MockApiClient();
    repository = new CatRepository(mockApiClient);
  });

  describe('getCatByUserId', () => {
    it('ユーザーIDからCatインスタンスを取得できること', async () => {
      const userId = 'user123';
      mockApiClient.setMockData(
        { bonding: { level: 2, gauge: 0.5 } },
        'たまねこ'
      );

      const cat = await repository.getCatByUserId(userId);

      expect(cat).toBeInstanceOf(Cat);
      expect(cat.id).toBe('cat-user123');
      expect(cat.name).toBe('たまねこ');
      expect(cat.getBonding().getLevel()).toBe(2);
      expect(cat.getBonding().getGauge()).toBe(0.5);
    });

    it('初期位置が画面中央に設定されること', async () => {
      const userId = 'user123';
      mockApiClient.setMockData(
        { bonding: { level: 0, gauge: 0 } },
        'たまねこ'
      );

      const cat = await repository.getCatByUserId(userId);
      const position = cat.getPosition();

      // GameConfigから取得した画面サイズの中央
      expect(position.x).toBe(400); // 800 / 2
      expect(position.y).toBe(300); // 600 / 2
    });
  });

  describe('createCat', () => {
    it('新しいCatインスタンスを作成できること', () => {
      const name = 'みけねこ';

      const cat = repository.createCat(name);

      expect(cat).toBeInstanceOf(Cat);
      expect(cat.name).toBe('みけねこ');
      expect(cat.getBonding().getLevel()).toBe(1);
      expect(cat.getBonding().getGauge()).toBe(0);
    });
  });
});
