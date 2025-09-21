import { NextRequest, NextResponse } from 'next/server';
import { withPublicApi, ApiContext } from '@/lib/apiCommon';

async function logoutHandler(request: NextRequest, context: ApiContext) {
  context.session.destroy();
  return NextResponse.json({ success: true });
}

export const POST = withPublicApi(logoutHandler);