import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('tiktok-developers-site-verification=v5mpVFenrlYf6w0MpnDZWhqDcqLXl1M9', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
