import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { addDmLog, getDmCampaigns } from '@/lib/db';

// 1. TikTok Webhook Handshake / Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('challenge');
  const verifyToken = searchParams.get('verify_token');

  const configuredToken = process.env.TIKTOK_VERIFY_TOKEN || process.env.INSTAGRAM_VERIFY_TOKEN;

  if (verifyToken === configuredToken && challenge) {
    console.log('[TikTok Webhook] Handshake bem-sucedido!');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Challenge accepted', { status: 200 });
}

// 2. TikTok Event Receiver (POST)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody || '{}');

    // Salvar evento no histórico
    try {
      await supabase.from('events').insert([{ payload, platform: 'tiktok' }]);
    } catch (ignore) {}

    // Eventos de comentário do TikTok: type === 'comment.create' ou 'comment'
    const event = payload.event || payload.type;
    const commentText = payload.content || payload.text || payload.data?.comment_text;
    const commenterUsername = payload.user?.unique_id || payload.user?.nickname || 'tiktok_user';
    const commenterId = payload.user?.open_id || payload.user?.id || `tt_${Date.now()}`;

    if (commentText) {
      console.log(`[TikTok Webhook] Novo comentário recebido: "${commentText}" por @${commenterUsername}`);

      const campaigns = await getDmCampaigns();
      const matched = campaigns.find((c) => {
        if (!c.isActive || c.platform !== 'tiktok') return false;
        const normalized = commentText.toLowerCase();
        return c.keywords.some((kw) =>
          c.matchType === 'exact'
            ? normalized === kw.toLowerCase().trim()
            : normalized.includes(kw.toLowerCase().trim())
        );
      });

      if (matched) {
        console.log(`[TikTok Webhook] Disparando campanha Auto-DM: ${matched.name}`);

        // Grava no log de auditoria
        await addDmLog({
          campaignId: matched.id,
          campaignName: matched.name,
          platform: 'tiktok',
          commenterId,
          commenterUsername,
          commentText,
          status: 'SENT',
          publicReplySent: matched.publicReplyEnabled,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[TikTok Webhook] Erro ao processar:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
