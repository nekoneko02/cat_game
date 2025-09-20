'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/useSession';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

export default function RegistrationCompletePage() {
  const router = useRouter();
  const { session, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading) {
      if (!session.authenticated || !session.catName) {
        router.push('/signup');
        return;
      }
    }
  }, [session, sessionLoading, router]);

  const handleGoToHome = () => {
    router.push('/');
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <GameIcon imageId={IMAGE_IDS.LOADING_CAT_ICON} size="2xl" fallbackEmoji="🐱" />
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!session.authenticated || !session.catName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-pink-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md text-center">
        <div className="mb-6">
          <GameIcon imageId={IMAGE_IDS.REGISTRATION_CELEBRATION} size="6xl" fallbackEmoji="🎉" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          登録完了！
        </h1>

        <div className="bg-pink-50 rounded-lg p-4 mb-6">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">{session.username}</span>さん、ようこそ！
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">{session.catName}</span>ちゃんがあなたを待っています
          </p>
        </div>

        <p className="text-gray-600 mb-6">
          これからたくさん遊んで、特別な絆を育みましょう！
        </p>

        <button
          onClick={handleGoToHome}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
        >
          ホーム画面へ
        </button>
      </div>
    </div>
  );
}