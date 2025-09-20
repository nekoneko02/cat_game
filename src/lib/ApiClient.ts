import { CatState } from './session';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ToyData {
  id: string; // 'toy_ball' などの完全なアセットキー
  name: string;
  attributes: {
    appearance: string;
    material: string;
    sound: string;
    color: string;
  };
}

export class ApiClient {
  private static instance: ApiClient | null = null;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = '';
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '通信エラーが発生しました',
      };
    }
  }

  async getCatState(): Promise<ApiResponse<{ catState: CatState | null; catName: string | null }>> {
    return this.request<{ catState: CatState | null; catName: string | null }>('/api/cat-state', {
      method: 'GET',
    });
  }

  async saveCatState(catState: CatState): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/api/cat-state', {
      method: 'POST',
      body: JSON.stringify({ catState }),
    });
  }

  async signUp(username: string, catName: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ username, catName }),
    });
  }

  async logout(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/api/auth/logout', {
      method: 'POST',
    });
  }

  async getToys(): Promise<ApiResponse<{ toys: ToyData[] }>> {
    return this.request<{ toys: ToyData[] }>('/api/toys', {
      method: 'GET',
    });
  }
}

export const apiClient = ApiClient.getInstance();