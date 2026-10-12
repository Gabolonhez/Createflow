import { NextRequest, NextResponse } from 'next/server';
import { getLinkedInOAuthUrl, exchangeCodeForToken, fetchLinkedInProfile } from '@/lib/linkedin';
import { getConnectionsConfig, saveConnectionsConfig } from '@/lib/db';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const redirectUri = `${appUrl}/api/oauth/linkedin`;

    // 1. Tratamento de erro retornado pelo LinkedIn
    if (error) {
      console.error('[LinkedIn OAuth] Erro retornado pelo LinkedIn:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    // 2. INICIAÇÃO: Se a rota foi chamada sem código, redireciona o usuário para login no LinkedIn
    if (!code) {
      console.log('[LinkedIn OAuth] Iniciando autorização. Redirecionando para LinkedIn...');
      try {
        const authUrl = await getLinkedInOAuthUrl(redirectUri);
        return NextResponse.redirect(authUrl);
      } catch (err: any) {
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(err.message || 'Configure o Client ID primeiro')}`, req.url)
        );
      }
    }

    // 3. CALLBACK: LinkedIn enviou de volta o código de autorização
    console.log('[LinkedIn OAuth] Trocando código por access token...');
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    console.log('[LinkedIn OAuth] Buscando perfil do usuário...');
    const profile = await fetchLinkedInProfile(tokenData.access_token);

    // Calcular data de expiração do token (padrão LinkedIn: 60 dias)
    const expiresSeconds = tokenData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000).toISOString();

    console.log('[LinkedIn OAuth] Salvando credenciais no sistema...');
    const currentConnections = await getConnectionsConfig();
    await saveConnectionsConfig({
      ...currentConnections,
      linkedin_connected: true,
      linkedin_name: profile.name,
      linkedin_profile_id: profile.id,
      linkedin_access_token: tokenData.access_token,
      linkedin_expires_at: expiresAt,
      linkedin_publish_mode: 'automatic',
    });

    // Compatibilidade com tabela legacy config se ela existir
    try {
      await supabase.from('config').upsert({
        id: 'instagram_config',
        access_token: 'connected',
        linkedin_access_token: tokenData.access_token,
        linkedin_profile_id: profile.id,
        linkedin_name: profile.name,
        linkedin_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      });
    } catch (ignore) {
      // Falhas no schema legacy não bloqueiam a conexão ativa
    }

    console.log(`[LinkedIn OAuth] Conexão bem-sucedida para "${profile.name}" (ID: ${profile.id})`);
    return NextResponse.redirect(new URL('/?connected=true', req.url));
  } catch (err: any) {
    console.error('[LinkedIn OAuth Error] Falha na autenticação:', err);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'Falha no login do LinkedIn')}`, req.url)
    );
  }
}

