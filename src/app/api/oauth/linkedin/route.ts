import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken, fetchLinkedInProfile } from '@/lib/linkedin';
import { supabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('[LinkedIn OAuth] Erro:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, req.url)
      );
    }

    if (!code) {
      console.warn('[LinkedIn OAuth] Código de autorização ausente.');
      return NextResponse.redirect(new URL('/?error=Codigo_ausente_linkedin', req.url));
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`;
    const redirectUri = `${appUrl}/api/oauth/linkedin`;

    console.log('[LinkedIn OAuth] Trocando código por token...');
    const tokenData = await exchangeCodeForToken(code, redirectUri);

    console.log('[LinkedIn OAuth] Buscando perfil do usuário...');
    const profile = await fetchLinkedInProfile(tokenData.access_token);

    // Calcular expiração (padrão do LinkedIn é 60 dias = 5184000 segundos)
    const expiresSeconds = tokenData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000).toISOString();

    // Obter dados existentes para não apagar a conexão do Instagram
    const { data: existingConfig } = await supabase
      .from('config')
      .select('*')
      .eq('id', 'instagram_config')
      .maybeSingle();

    const payload = {
      id: 'instagram_config',
      access_token: existingConfig?.access_token || 'pending_instagram', // Valor temporário para satisfazer o NOT NULL se o Instagram ainda não estiver conectado
      ...existingConfig,
      linkedin_access_token: tokenData.access_token,
      linkedin_profile_id: profile.id,
      linkedin_name: profile.name,
      linkedin_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    };

    console.log('[LinkedIn OAuth] Salvando credenciais no banco...');
    const { error: upsertErr } = await supabase.from('config').upsert(payload);

    if (upsertErr) {
      throw new Error(`Erro ao salvar perfil do LinkedIn: ${upsertErr.message}`);
    }

    console.log('[LinkedIn OAuth] Sucesso!');
    return NextResponse.redirect(new URL('/?connected=true', req.url));
  } catch (err: any) {
    console.error('[LinkedIn OAuth Error] Falha no callback:', err);
    return NextResponse.redirect(
      new URL(`/?error=${encodeURIComponent(err.message || 'Falha no LinkedIn')}`, req.url)
    );
  }
}
