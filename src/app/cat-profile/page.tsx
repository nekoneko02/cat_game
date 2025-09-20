'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { CatMaster } from '@/types/CatMaster';
import Image from 'next/image';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

export default function CatProfilePage() {
  const [catMaster, setCatMaster] = useState<CatMaster | null>(null);
  const [catName, setCatName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const catMasterId = searchParams.get('catMasterId');
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

    if (!catMasterId) {
      router.push('/meet-cat');
      return;
    }
  }, [session, sessionLoading, catMasterId, router]);

  const fetchCatMaster = useCallback(async () => {
    try {
      const response = await fetch('/api/cat-masters');
      const data = await response.json();

      if (response.ok) {
        const foundCat = data.catMasters.find((cat: CatMaster) => cat.id === catMasterId);
        if (foundCat) {
          setCatMaster(foundCat);
        } else {
          setError('選択されたねこが見つかりません');
        }
      } else {
        setError(data.error || 'ねこマスタの取得に失敗しました');
      }
    } catch (_error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [catMasterId]);

  useEffect(() => {
    if (catMasterId) {
      fetchCatMaster();
    }
  }, [catMasterId, fetchCatMaster]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = catName.trim();

    if (trimmedName.length === 0) {
      setError('ねこちゃんの名前を入力してください');
      return;
    }

    if (trimmedName.length > 10) {
      setError('ねこちゃんの名前は10文字以内で入力してください');
      return;
    }

    if (!catMaster) {
      setError('ねこが選択されていません');
      return;
    }

    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/cat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          catMasterId: catMaster.id,
          catName: trimmedName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/registration-complete');
      } else {
        setError(data.error || 'ねこの保存に失敗しました。もう一度お試しください。');
      }
    } catch (_error) {
      setError('ねこの保存に失敗しました。ネットワーク接続を確認してもう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = () => {
    const confirmed = window.confirm(
      'ページを離れると入力した内容は保存されません。本当に戻りますか？'
    );
    if (confirmed) {
      router.push('/meet-cat');
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

  if (!session.authenticated || session.catName || !catMaster) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              ねこプロフィール設定
            </h1>
            <button
              onClick={handleLeave}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              × 戻る
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <Image
                src={catMaster.imageUrl}
                alt={catMaster.name}
                fill
                className="object-contain"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              {catMaster.name}
            </h2>
            <p className="text-gray-600">
              {catMaster.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="catName" className="block text-sm font-medium text-gray-700 mb-2">
                ねこちゃんの名前を決めてください
              </label>
              <input
                type="text"
                id="catName"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="例：たぬきねこ、みけちゃん など"
                maxLength={10}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={saving}
              />
              <p className="text-xs text-gray-500 mt-1">
                ※ゲーム中に表示される名前です。10文字以内で入力してください。
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleLeave}
                disabled={saving}
                className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                戻る
              </button>
              <button
                type="submit"
                disabled={saving || !catName.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                {saving ? '保存中...' : '決定'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}