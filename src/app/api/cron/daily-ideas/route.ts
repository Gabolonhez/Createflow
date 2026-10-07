import { NextResponse } from 'next/server';
import { generateIdeasWithAiAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

/**
 * Daily cron job to generate 3-5 fresh creator ideas automatically.
 * Can be triggered by Vercel Cron or any scheduled background runner.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Se houver CRON_SECRET configurado, valida a autorização
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get('key');
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    const result = await generateIdeasWithAiAction(4);

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      count: result.ideas?.length || 0,
      ideas: result.ideas,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
