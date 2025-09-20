import { NextResponse } from 'next/server';
import { getToysForApiClient } from '@/constants/toys';
import { logInfo, logError } from '@/lib/log';

export async function GET() {
  try {
    logInfo('Toys API request', {
      url: '/api/toys',
      method: 'GET',
    });

    const toys = getToysForApiClient();

    logInfo('Toys API successful', {
      toysCount: toys.length,
    });

    return NextResponse.json({
      toys: toys
    });
  } catch (error) {
    logError('Error fetching toys', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({
      toys: []
    }, { status: 500 });
  }
}