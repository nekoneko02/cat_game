import Link from 'next/link';
import Layout from '@/components/Layout';

export default function Home() {
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
            href="/play"
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-6 rounded-full transition-colors inline-block"
          >
            ねこと遊ぶ
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
