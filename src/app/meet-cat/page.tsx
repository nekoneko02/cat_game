'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { CatMaster } from '@/types/CatMaster';
import Image from 'next/image';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

export default function MeetCatPage() {
  const [catMasters, setCatMasters] = useState<CatMaster[]>([]);
  const [selectedCat, setSelectedCat] = useState<CatMaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading) {
      if (!session.authenticated) {
        router.push('/signup');
        return;
      }
      if (session.catName) {
        router.push('/');
        return;
      }
    }
  }, [session, sessionLoading, router]);

  useEffect(() => {
    fetchCatMasters();
  }, []);

  const fetchCatMasters = async () => {
    try {
      const response = await fetch('/api/cat-masters');
      const data = await response.json();

      if (response.ok) {
        setCatMasters(data.catMasters);
      } else {
        setError(data.error || 'ねこマスタの取得に失敗しました');
      }
    } catch (_error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCatSelect = (cat: CatMaster) => {
    setSelectedCat(cat);
  };

  const handleNext = () => {
    if (selectedCat) {
      router.push(`/cat-profile?catMasterId=${selectedCat.id}`);
    }
  };

  const handleLeave = () => {
    const confirmed = window.confirm(
      'ページを離れると選択した内容は保存されません。本当に戻りますか？'
    );
    if (confirmed) {
      router.push('/');
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <GameIcon imageId={IMAGE_IDS.LOADING_CAT_ICON} size="2xl" fallbackEmoji="🐱" />
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session.authenticated || session.catName) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <div className="mb-4">
            <GameIcon imageId={IMAGE_IDS.CAT_SELECTION_SAD} size="6xl" fallbackEmoji="😿" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            エラーが発生しました
          </h1>
          <p className="text-gray-600 mb-6">
            {error === 'ねこマスタの取得に失敗しました'
              ? '選択可能なねこがいません。システムに不具合が発生している可能性があります。'
              : error}
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ホーム画面へ
          </button>
        </div>
      </div>
    );
  }

  if (catMasters.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
          <div className="mb-4">
            <GameIcon imageId={IMAGE_IDS.CAT_SELECTION_SAD} size="6xl" fallbackEmoji="😿" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            ねこが見つかりません
          </h1>
          <p className="text-gray-600 mb-6">
            選択可能なねこがいません。システムに不具合が発生している可能性があります。
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            ホーム画面へ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              ねこと出会う
            </h1>
            <button
              onClick={handleLeave}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              × 戻る
            </button>
          </div>

          <p className="text-gray-600 mb-6">
            あなたのパートナーとなるねこちゃんを選んでください
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catMasters.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCatSelect(cat)}
                className={`cursor-pointer border-2 rounded-lg p-4 transition-all ${
                  selectedCat?.id === cat.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 relative">
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {cat.description}
                    </p>
                  </div>
                  {selectedCat?.id === cat.id && (
                    <div className="text-blue-500">
                      <GameIcon imageId={IMAGE_IDS.CAT_SELECTION_CHECK} size="md" fallbackEmoji="✓" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedCat && (
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleNext}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
              >
                {selectedCat.name}を選ぶ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}