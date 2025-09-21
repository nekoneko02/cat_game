'use client';

import React from 'react';
import { GameIcon } from '@/components/GameIcon';
import { IMAGE_IDS } from '@/constants/images';

interface LogoutConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmDialog({ isOpen, onConfirm, onCancel }: LogoutConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
        <div className="text-center space-y-6">
          <div className="mb-4">
            <GameIcon imageId={IMAGE_IDS.HOME_CAT_PAW} size="3xl" fallbackEmoji="🐾" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800">
            ログアウトしますか？
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ ログアウトすると、再度ログインすることができません。
              <br />
              ゲームを続ける場合は「ゲームに戻る」を選択してください。
            </p>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
            >
              ゲームに戻る
            </button>
            <button
              onClick={onConfirm}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}