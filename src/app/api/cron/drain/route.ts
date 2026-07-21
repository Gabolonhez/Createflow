import { NextRequest, NextResponse } from 'next/server';
import { drainQueue } from '@/lib/queue-processor';

// Endpoint para processamento periódico da fila de DMs
export async function GET(req: NextRequest) {
  // Validar chave de autorização simples se estiver configurada para evitar abuso
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.warn('[Cron Drain] Tentativa de acesso não autorizada.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await drainQueue();
    return NextResponse.json({ success: true, message: 'Fila drenada com sucesso.' });
  } catch (err: any) {
    console.error('[Cron Drain Error] Falha ao drenar a fila:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Também aceitar POST para flexibilidade
export async function POST(req: NextRequest) {
  return GET(req);
}
