import { NextRequest, NextResponse } from 'next/server';
import { withPublicApi, ApiContext } from '@/lib/apiCommon';

async function sessionHandler(request: NextRequest, context: ApiContext) {
  if (context.session.username) {
    return NextResponse.json({
      authenticated: true,
      username: context.session.username,
      catName: context.session.catName || null
    });
  }

  return NextResponse.json({ authenticated: false });
}

export const GET = withPublicApi(sessionHandler);