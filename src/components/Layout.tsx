'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const response = await fetch('/api/cat-state');
      if (response.ok) {
        setIsLoggedIn(true);
        // セッション情報があればユーザー情報も表示したいが、今回は簡単にログイン状態のみチェック
      }
    } catch (_error) {
      setIsLoggedIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-pink-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-pink-600 transition-colors flex items-center gap-2">
            <GameIcon imageId={IMAGE_IDS.HEADER_CAT_ICON} size="lg" fallbackEmoji="🐱" />
            たぬきねこ
          </Link>
          
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
            >
              ログアウト
            </button>
          )}
        </div>
      </header>
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-white border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-wrap gap-4 justify-center text-sm text-gray-600">
            <Link href="/" className="hover:text-pink-600 transition-colors">
              ホーム
            </Link>
            <Link href="/toy-selection" className="hover:text-pink-600 transition-colors">
              ねこと遊ぶ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}