import { NextResponse } from 'next/server';

/**
 * Health check endpoint voor performance en portability tests
 * Returns HTTP 200 met basic status info
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    { status: 200 }
  );
}




