'use client';

import Link from 'next/link';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';
import { apiClient } from '@/lib/ApiClient';
import { logError } from '@/lib/log';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();

  const checkSession = useCallback(async () => {
    try {
      const response = await apiClient.getCatState();
      if (!response.success || !response.data?.catState) {
        if (window.location.pathname !== '/' && window.location.pathname !== '/signup') {
          router.push('/');
        }
      }
    } catch {
      if (window.location.pathname !== '/' && window.location.pathname !== '/signup') {
        router.push('/');
      }
    }
  }, [router]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleLogout = async () => {
    try {
      const response = await apiClient.logout();
      if (response.success) {
        router.push('/');
      } else {
        logError('Logout failed', { error: response.error });
      }
    } catch (error) {
      logError('Logout failed', { error: error instanceof Error ? error.message : String(error) });
      router.push('/');
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
          
          <button
            onClick={handleLogout}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            ログアウト
          </button>
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