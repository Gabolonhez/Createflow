import { NextRequest, NextResponse } from 'next/server';
import { getOAuthUrl } from '@/lib/instagram';
import { getConnectionsConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const isLocal = req.nextUrl.host.includes('localhost') || req.nextUrl.host.includes('127.0.0.1');
  const appUrl = isLocal
    ? `${req.nextUrl.protocol}//${req.nextUrl.host}`
    : (process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`);
  const isAutoDmAlias = req.nextUrl.pathname.includes('/instagram/');
  const redirectUri = `${appUrl}${isAutoDmAlias ? '/api/instagram/callback' : '/api/oauth/callback'}`;

  try {
    const connections = await getConnectionsConfig();
    const clientId =
      connections.instagram_client_id ||
      process.env.INSTAGRAM_APP_ID ||
      process.env.INSTAGRAM_CLIENT_ID ||
      '1750226409653397';

    const scope = [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'instagram_business_manage_insights',
    ].join(',');

    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_reauth=true&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code`;

    return NextResponse.redirect(authUrl);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao iniciar autorização do Instagram';
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, req.url));
  }
}
