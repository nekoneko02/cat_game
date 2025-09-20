'use client';

import React from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { useSession } from '@/hooks/useSession';

export default function Home() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <Layout>
        <div className="text-center space-y-8">
          <div className="text-2xl">🐱</div>
          <p className="mt-2 text-gray-600">読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (session.authenticated && session.catName) {
    return (
      <Layout>
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">
              🐱 たぬきねこ
            </h1>
            <p className="text-lg text-gray-600">
              おかえりなさい、{session.username}さん！
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">😸</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {session.catName}ちゃんが待っています
            </h2>
            <p className="text-gray-600 mb-6">
              一緒に遊んで、特別な時間を過ごしましょう！
            </p>
            <Link
              href="/play"
              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-full transition-colors inline-block"
            >
              {session.catName}ちゃんと遊ぶ
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-3">🎾</div>
              <h3 className="font-semibold text-gray-800 mb-2">おもちゃで遊ぶ</h3>
              <p className="text-gray-600 text-sm">
                様々なおもちゃを使って{session.catName}ちゃんと遊びましょう
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-3">❤️</div>
              <h3 className="font-semibold text-gray-800 mb-2">なつき度システム</h3>
              <p className="text-gray-600 text-sm">
                一緒に過ごすことで{session.catName}ちゃんとの絆が深まります
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-3">🧠</div>
              <h3 className="font-semibold text-gray-800 mb-2">ねこAI学習</h3>
              <p className="text-gray-600 text-sm">
                {session.catName}ちゃんはあなたとの関わりから学習します
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-800">
            🐱 たぬきねこ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            あなただけのバーチャル猫と過ごす、癒しの時間。
            <br />
            ねこと遊んで、愛でて、特別な絆を育みましょう。
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            ねこちゃんがあなたを待っています
          </h2>
          <p className="text-gray-600 mb-6">
            一緒に遊んで、なつき度を上げて、特別な関係を築きましょう。
          </p>
          <Link
            href="/signup"
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-full transition-colors inline-block"
          >
            ゲームを始める
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🎾</div>
            <h3 className="font-semibold text-gray-800 mb-2">おもちゃで遊ぶ</h3>
            <p className="text-gray-600 text-sm">
              様々なおもちゃを使ってねこちゃんと遊びましょう
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">❤️</div>
            <h3 className="font-semibold text-gray-800 mb-2">なつき度システム</h3>
            <p className="text-gray-600 text-sm">
              一緒に過ごすことでねこちゃんとの絆が深まります
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-3">🧠</div>
            <h3 className="font-semibold text-gray-800 mb-2">ねこAI学習</h3>
            <p className="text-gray-600 text-sm">
              ねこちゃんはあなたとの関わりから学習します
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
