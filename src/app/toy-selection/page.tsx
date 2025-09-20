'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { apiClient, type ToyData } from '@/lib/ApiClient';
import { GameIcon } from '@/components/GameIcon';
import { ToyImage } from '@/components/ToyImage';
import { IMAGE_IDS } from '@/constants/images';
import { getToysForApiClient } from '@/constants/toys';

// toys.tsから自動生成されるフォールバックおもちゃデータ
const fallbackToys: ToyData[] = getToysForApiClient();

export default function ToySelectionPage() {
  const [toys, setToys] = useState<ToyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadToys();
  }, []);

  const loadToys = async () => {
    try {
      console.log('Loading toys from API...');
      const response = await apiClient.getToys();
      console.log('API response:', response);

      if (response.success && response.data?.toys) {
        console.log('Successfully loaded toys:', response.data.toys);
        setToys(response.data.toys);
      } else {
        console.warn('API failed or no toys data, using fallback:', response.error);
        setError('おもちゃの情報を正しく読み込めませんでした。組み込みのおもちゃを表示します。');
        setToys(fallbackToys);
      }
    } catch (err) {
      console.error('Failed to load toys:', err);
      setError('おもちゃの情報を正しく読み込めませんでした。組み込みのおもちゃを表示します。');
      setToys(fallbackToys);
    } finally {
      setLoading(false);
    }
  };

  const handleToySelect = async (toy: ToyData) => {
    try {
      const catStateResponse = await apiClient.getCatState();

      if (!catStateResponse.success) {
        if (catStateResponse.error?.includes('認証')) {
          router.push('/signup');
          return;
        }
        setError('ねこの情報が取得できませんでした。');
        return;
      }

      router.push(`/play?toy=${toy.id}`);
    } catch (err) {
      console.error('Failed to start game:', err);
      setError('ゲームを開始できませんでした。');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">おもちゃを読み込んでいます...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <GameIcon imageId={IMAGE_IDS.HOME_FEATURE_TOY} size="3xl" fallbackEmoji="🎾" />
            おもちゃ選択
          </h1>
          <p className="text-gray-600">
            ねこちゃんと遊ぶおもちゃを選んでください
          </p>
        </div>

        {error && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {toys.map((toy) => (
            <button
              key={toy.id}
              onClick={() => handleToySelect(toy)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-2 hover:border-pink-300"
            >
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <ToyImage toyId={toy.id} size="6xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {toy.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>色: {toy.attributes.color}</p>
                  <p>素材: {toy.attributes.material}</p>
                  <p>音: {toy.attributes.sound}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">おもちゃについて</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• それぞれのおもちゃは異なる特徴を持っています</li>
            <li>• ねこちゃんの性格や好みによって反応が変わります</li>
            <li>• いろいろなおもちゃで遊んでみてください</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}