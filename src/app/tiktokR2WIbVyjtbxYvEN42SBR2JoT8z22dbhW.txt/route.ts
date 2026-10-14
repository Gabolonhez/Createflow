import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('tiktok-developers-site-verification=R2WIbVyjtbxYvEN42SBR2JoT8z22dbhW', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
