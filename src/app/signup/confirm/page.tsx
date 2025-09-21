'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

export const dynamic = 'force-dynamic';

function SignupConfirmContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const username = searchParams.get('username');
  const { session, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && session.authenticated) {
      router.push('/');
      return;
    }

    if (!username) {
      router.push('/signup');
    }
  }, [session, sessionLoading, username, router]);

  const handleConfirm = async () => {
    if (!username) {
      setError('ユーザー名が設定されていません');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/meet-cat');
      } else {
        setError(data.error || 'サインアップに失敗しました');
      }
    } catch (_error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/signup');
  };

  if (sessionLoading || !username) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <GameIcon imageId={IMAGE_IDS.LOADING_CAT_ICON} size="2xl" fallbackEmoji="🐱" />
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (session.authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          サインアップ確認
        </h1>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              ユーザー名
            </h2>
            <p className="text-gray-600 text-lg">
              {username}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              このユーザー名でサインアップしますか？<br />
              続行すると、ねこちゃんとの出会いが始まります。
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              戻る
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {loading ? '登録中...' : '確認'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupConfirmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupConfirmContent />
    </Suspense>
  );
}