import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { refreshLongToken } from '@/lib/instagram';

// Endpoint para renovação semanal do token longo de 60 dias do Instagram
export async function GET(req: NextRequest) {
  // Validar chave de autorização simples para evitar abuso
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron Refresh] Tentativa de acesso não autorizada.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: config, error: configErr } = await supabase
      .from('config')
      .select('access_token')
      .eq('id', 'instagram_config')
      .single();

    if (configErr || !config) {
      console.warn('[Cron Refresh] Nenhuma credencial encontrada para renovar.');
      return NextResponse.json({ message: 'Nenhuma credencial configurada.' }, { status: 200 });
    }

    console.log('[Cron Refresh] Renovando token de longa duração...');
    const refreshData = await refreshLongToken(config.access_token);

    // Calcular data de expiração
    const expiresSeconds = refreshData.expires_in || 60 * 24 * 60 * 60; // 60 dias
    const expiresAt = new Date(Date.now() + expiresSeconds * 1000).toISOString();

    const { error: updateErr } = await supabase
      .from('config')
      .update({
        access_token: refreshData.access_token,
        token_expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'instagram_config');

    if (updateErr) {
      throw new Error(`Erro ao atualizar token no banco: ${updateErr.message}`);
    }

    console.log('[Cron Refresh] Token renovado com sucesso.');
    return NextResponse.json({ success: true, expires_at: expiresAt });
  } catch (err: any) {
    console.error('[Cron Refresh Error] Falha ao renovar o token do Instagram:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
