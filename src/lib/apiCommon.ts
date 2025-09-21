import { NextRequest, NextResponse } from 'next/server';
import { getIronSession, IronSession } from 'iron-session';
import { sessionOptions, SessionData } from './session';
import { logWithRequest, ensureAnonymousUuidCookie } from './log';

/**
 * ログイン不要APIのホワイトリスト
 */
const AUTH_WHITELIST = [
  '/api/auth/session',
  '/api/auth/signup',
  '/api/auth/logout',
  '/api/cat-masters',
  '/api/toys'
];

/**
 * APIメソッド種別
 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * API共通処理の設定
 */
export interface ApiConfig {
  requireAuth?: boolean;  // 認証必須かどうか（デフォルト: true）
  logAccess?: boolean;    // アクセスログを出力するか（デフォルト: true）
  ensureCookie?: boolean; // 匿名UUIDクッキーを確保するか（デフォルト: true）
}

/**
 * APIハンドラー関数の型
 */
export type ApiHandler = (
  request: NextRequest,
  context: ApiContext
) => Promise<NextResponse>;

/**
 * APIコンテキスト（認証情報等を含む）
 */
export interface ApiContext {
  session: IronSession<SessionData>;
  isAuthenticated: boolean;
  anonymousUuid: string;
  url: string;
  method: string;
  userAgent?: string;
}

/**
 * API共通ラッパー
 * シーケンス図に従った共通処理を実行
 */
export function withApiCommon(
  handler: ApiHandler,
  config: ApiConfig = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const url = request.url;
    const method = request.method;
    const userAgent = request.headers.get('user-agent') || undefined;

    // デフォルト設定
    const {
      requireAuth = true,
      logAccess = true,
      ensureCookie = true
    } = config;

    try {
      // 2. ホワイトリストチェック
      const pathname = new URL(url).pathname;
      const isWhitelisted = AUTH_WHITELIST.includes(pathname);
      const shouldCheckAuth = requireAuth && !isWhitelisted;

      // 共有レスポンスでセッション取得
      const sharedResponse = NextResponse.json({ success: true });
      const session = await getIronSession<SessionData>(request, sharedResponse, sessionOptions);
      const isAuthenticated = !!session.username;

      // 1. 匿名UUIDクッキーの確保（必要な場合）
      let anonymousUuid = 'server-unknown';
      if (ensureCookie) {
        anonymousUuid = ensureAnonymousUuidCookie(request, sharedResponse);
      }

      // 3. 認証チェック（必要な場合）
      if (shouldCheckAuth && !isAuthenticated) {
        const endTime = Date.now();

        // アクセスログ（認証失敗）
        if (logAccess) {
          logWithRequest(request, 'warn', 'API access denied: authentication required', {
            url: pathname,
            method,
            statusCode: 401,
            latencyMs: endTime - startTime,
            userAgent,
            reason: 'authentication_required'
          });
        }

        return NextResponse.json(
          { error: '認証が必要です' },
          { status: 401 }
        );
      }

      // 4. アクセスログ送信（非同期）
      if (logAccess) {
        // 非同期でアクセスログを送信（処理をブロックしない）
        setImmediate(() => {
          logWithRequest(request, 'info', 'API access', {
            url: pathname,
            method,
            isAuthenticated,
            userAgent,
            anonymousUuid
          });
        });
      }

      // 5. APIコンテキスト作成
      const context: ApiContext = {
        session,
        isAuthenticated,
        anonymousUuid,
        url: pathname,
        method,
        userAgent
      };

      // 6. メインAPI実行
      const apiResponse = await handler(request, context);
      const endTime = Date.now();

      // セッションクッキーを保持するため、共有レスポンスのクッキーを保持
      const sessionCookies = sharedResponse.headers.getSetCookie();
      console.log('Session cookies from shared response:', sessionCookies);
      sessionCookies.forEach(cookie => {
        apiResponse.headers.append('Set-Cookie', cookie);
      });

      // 成功時のアクセスログ（非同期）
      if (logAccess) {
        setImmediate(() => {
          logWithRequest(request, 'info', 'API completed successfully', {
            url: pathname,
            method,
            statusCode: apiResponse.status,
            latencyMs: endTime - startTime,
            userAgent,
            anonymousUuid
          });
        });
      }

      return apiResponse;

    } catch (error) {
      const endTime = Date.now();

      // エラーログ
      logWithRequest(request, 'error', 'API error occurred', {
        url: new URL(url).pathname,
        method,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        latencyMs: endTime - startTime,
        userAgent
      });

      return NextResponse.json(
        { error: 'サーバーエラーが発生しました' },
        { status: 500 }
      );
    }
  };
}

/**
 * 認証必須APIのラッパー
 */
export function withAuthApi(handler: ApiHandler) {
  return withApiCommon(handler, {
    requireAuth: true,
    logAccess: true,
    ensureCookie: true
  });
}

/**
 * 認証不要APIのラッパー
 */
export function withPublicApi(handler: ApiHandler) {
  return withApiCommon(handler, {
    requireAuth: false,
    logAccess: true,
    ensureCookie: true
  });
}

/**
 * 認証APIのラッパー（サインアップ、ログイン等）
 */
export function withAuthEndpoint(handler: ApiHandler) {
  return withApiCommon(handler, {
    requireAuth: false,
    logAccess: true,
    ensureCookie: true
  });
}