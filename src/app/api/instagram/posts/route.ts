import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Obter token ativo do Instagram no Supabase
    let accessToken: string | null = null;

    const { data: config } = await supabase
      .from('config')
      .select('access_token, instagram_user_id')
      .eq('id', 'instagram_config')
      .single();

    if (config?.access_token) {
      accessToken = config.access_token;
    } else {
      const { getConnectionsConfig } = await import('@/lib/db');
      const conn = await getConnectionsConfig();
      if (conn?.instagram_access_token) {
        accessToken = conn.instagram_access_token;
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Instagram não está conectado. Conecte sua conta em Conexões.' },
        { status: 400 }
      );
    }

    const limit = req.nextUrl.searchParams.get('limit') || '60';

    // Campos essenciais suportados por todas as contas Instagram Graph API
    const fields = 'id,caption,media_type,media_url,thumbnail_url,timestamp,permalink';
    const url = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[Instagram Posts API] Falha ao listar posts:', err);
      return NextResponse.json(
        { success: false, error: err.error?.message || 'Falha ao buscar posts do Instagram' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      data: data.data || [],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[Instagram Posts API] Erro inesperado:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
