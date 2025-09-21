'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/ApiClient';
import { logError } from '@/lib/log';
import { useSession } from '@/hooks/useSession';
import LogoutConfirmDialog from '@/components/LogoutConfirmDialog';

export default function LogoutPage() {
  const router = useRouter();
  const { checkSession } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await apiClient.getCatState();
        if (!response.success || !response.data?.catState) {
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  const handleLogoutConfirm = async () => {
    try {
      const response = await apiClient.logout();
      if (response.success) {
        setShowLogoutConfirm(false);
        await checkSession();
        router.push('/');
      } else {
        logError('Logout failed', { error: response.error });
        setShowLogoutConfirm(false);
        await checkSession();
        router.push('/');
      }
    } catch (error) {
      logError('Logout failed', { error: error instanceof Error ? error.message : String(error) });
      setShowLogoutConfirm(false);
      await checkSession();
      router.push('/');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-pink-50">
      <LogoutConfirmDialog
        isOpen={showLogoutConfirm}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
}