import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForShortToken,
  exchangeShortTokenForLongToken,
  getProfile,
  subscribeApp,
} from '@/lib/instagram';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('[OAuth Callback] Erro na autorização:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    if (!code) {
      console.warn('[OAuth Callback] Código de autorização ausente.');
      return NextResponse.redirect(new URL('/?error=Codigo_ausente', req.url));
    }

    // Construir o redirect_uri utilizado na autorização original
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const redirectUri = `${appUrl}/api/oauth/callback`;

    console.log('[OAuth Callback] Trocando código por token curto...');
    const shortTokenData = await exchangeCodeForShortToken(code, redirectUri);

    console.log('[OAuth Callback] Obtendo token de longa duração (60 dias)...');
    const longTokenData = await exchangeShortTokenForLongToken(shortTokenData.access_token);

    console.log('[OAuth Callback] Buscando informações de perfil...');
    const profile = await getProfile(longTokenData.access_token);

    // Calcular data de expiração
    const expiresSeconds = longTokenData.expires_in || 60 * 24 * 60 * 60; // 60 dias por padrão
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000).toISOString();

    console.log('[OAuth Callback] Salvando configurações no banco de dados...');
    const { error: upsertErr } = await supabase.from('config').upsert({
      id: 'instagram_config',
      instagram_user_id: profile.user_id,
      instagram_username: profile.username,
      instagram_name: profile.name || null,
      profile_picture_url: profile.profile_picture_url || null,
      access_token: longTokenData.access_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });

    if (upsertErr) {
      throw new Error(`Erro ao salvar configurações: ${upsertErr.message}`);
    }

    console.log('[OAuth Callback] Registrando assinatura de Webhook para a conta...');
    const subSuccess = await subscribeApp(profile.user_id, longTokenData.access_token);
    if (!subSuccess) {
      console.warn('[OAuth Callback] Aviso: A assinatura do Webhook retornou falso, mas prosseguindo.');
    }

    console.log('[OAuth Callback] Login e configurações concluídos com sucesso!');
    return NextResponse.redirect(new URL('/?connected=true', req.url));
  } catch (err: any) {
    console.error('[OAuth Callback Error] Ocorreu uma falha no callback:', err);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'Falha desconhecida')}`, req.url)
    );
  }
}
