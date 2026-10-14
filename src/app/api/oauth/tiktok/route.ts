import { NextRequest, NextResponse } from 'next/server';
import { getConnectionsConfig, saveConnectionsConfig } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const isLocal = req.nextUrl.host.includes('localhost') || req.nextUrl.host.includes('127.0.0.1');
    const appUrl = isLocal
      ? `${req.nextUrl.protocol}//${req.nextUrl.host}`
      : (process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`);
    const redirectUri = `${appUrl}/api/oauth/tiktok`;

    if (error) {
      console.error('[TikTok OAuth] Erro de autorização:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    const connections = await getConnectionsConfig();
    const clientKey = searchParams.get('client_key')?.trim() || connections.tiktok_client_key || process.env.TIKTOK_CLIENT_KEY;
    const clientSecret = searchParams.get('client_secret')?.trim() || connections.tiktok_client_secret || process.env.TIKTOK_CLIENT_SECRET;

    // 1. INICIAÇÃO: Sem código, redireciona para tela de login do TikTok
    if (!code) {
      if (!clientKey) {
        return NextResponse.redirect(
          new URL('/?error=Configure_o_Client_Key_do_TikTok_nas_Conexoes', req.url)
        );
      }

      const scope = 'user.info.basic,user.info.profile,user.info.stats,video.list';
      const state = `tt_${Date.now()}`;
      const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${encodeURIComponent(
        scope
      )}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&state=${state}`;

      const res = NextResponse.redirect(authUrl);
      if (clientKey || clientSecret) {
        res.cookies.set('cf_tt_oauth_creds', JSON.stringify({ clientKey, clientSecret }), {
          httpOnly: true,
          maxAge: 600,
          path: '/api/oauth/tiktok',
        });
      }
      return res;
    }

    // 2. CALLBACK: Troca código por token
    let effectiveKey = clientKey;
    let effectiveSecret = clientSecret;

    try {
      const cookieVal = req.cookies.get('cf_tt_oauth_creds')?.value;
      if (cookieVal) {
        const parsed = JSON.parse(cookieVal);
        effectiveKey = effectiveKey || parsed.clientKey;
        effectiveSecret = effectiveSecret || parsed.clientSecret;
      }
    } catch (ignore) {}

    if (!effectiveKey || !effectiveSecret) {
      throw new Error('TikTok Client Key e Client Secret são necessários para concluir a autenticação.');
    }

    const tokenParams = new URLSearchParams();
    tokenParams.append('client_key', effectiveKey);
    tokenParams.append('client_secret', effectiveSecret);
    tokenParams.append('code', code);
    tokenParams.append('grant_type', 'authorization_code');
    tokenParams.append('redirect_uri', redirectUri);

    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: tokenParams.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error) {
      throw new Error(`Falha ao obter token do TikTok: ${tokenData.error_description || tokenData.message || JSON.stringify(tokenData)}`);
    }

    const accessToken = tokenData.access_token || tokenData.data?.access_token;
    const openId = tokenData.open_id || tokenData.data?.open_id;

    // Buscar perfil básico
    let username = 'tiktok_user';
    let displayName = '';
    try {
      const profileRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (profileRes.ok) {
        const pData = await profileRes.json();
        displayName = pData.data?.user?.display_name || '';
        username = displayName || username;
      }
    } catch (ignore) {}

    // Salvar configurações
    await supabase.from('config').upsert({
      id: 'tiktok_config',
      tiktok_open_id: openId,
      tiktok_username: username,
      access_token: accessToken,
      updated_at: new Date().toISOString(),
    });

    await saveConnectionsConfig({
      ...connections,
      tiktok_connected: true,
      tiktok_username: username,
      tiktok_user_id: openId,
      tiktok_access_token: accessToken,
      tiktok_client_key: effectiveKey,
      tiktok_client_secret: effectiveSecret,
    });

    return NextResponse.redirect(new URL('/?connected=tiktok', req.url));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha desconhecida no login do TikTok';
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(message)}`, req.url));
  }
}
