import { NextRequest, NextResponse } from 'next/server';
import { getToysForApiClient } from '@/constants/toys';
import { withPublicApi, ApiContext } from '@/lib/apiCommon';

async function getToysHandler(_request: NextRequest, _context: ApiContext) {
  const toys = getToysForApiClient();

  return NextResponse.json({
    toys: toys
  });
}

export const GET = withPublicApi(getToysHandler);