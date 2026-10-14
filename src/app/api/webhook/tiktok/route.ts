import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { addDmLog, getDmCampaigns } from '@/lib/db';

export const dynamic = 'force-dynamic';

// 1. TikTok Webhook Handshake / Verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('challenge');
  const verifyToken = searchParams.get('verify_token');

  console.log('[TikTok Webhook] GET Handshake recebido:', { challenge, verifyToken });

  if (challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('Challenge accepted', { status: 200 });
}

// 2. TikTok Event Receiver (POST)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody || '{}');

    // Tratar verificação via POST (algumas versões do portal enviam challenge via POST)
    if (payload.challenge || payload.type === 'url_verification') {
      const challengeVal = (payload.challenge || payload.data?.challenge || 'ok').toString();
      console.log('[TikTok Webhook] POST Handshake recebido:', challengeVal);
      return new Response(challengeVal, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Salvar evento no histórico
    try {
      await supabase.from('events').insert([{ payload, platform: 'tiktok' }]);
    } catch (ignore) {}

    // Eventos de comentário ou mensagem direta do TikTok
    const event = (payload.event || payload.type || '').toString().toLowerCase();
    
    // Extrair texto (suporta formatos de comentário e de chat/DM do TikTok)
    const incomingText = (
      payload.content ||
      payload.text ||
      payload.data?.comment_text ||
      payload.data?.text ||
      payload.message?.text ||
      payload.entry?.[0]?.changes?.[0]?.value?.text ||
      ''
    ).toString().trim();

    const commenterUsername =
      payload.user?.unique_id ||
      payload.user?.nickname ||
      payload.sender?.nickname ||
      payload.sender?.username ||
      'tiktok_user';

    const commenterId =
      payload.user?.open_id ||
      payload.user?.id ||
      payload.sender?.open_id ||
      payload.sender_id ||
      `tt_${Date.now()}`;

    const isDirectMessage =
      event.includes('message') ||
      event.includes('im.') ||
      event.includes('chat') ||
      Boolean(payload.conversation_id || payload.chat_id || payload.message);

    if (incomingText) {
      console.log(
        `[TikTok Webhook] Novo evento (${isDirectMessage ? 'DM' : 'Comentário'}): "${incomingText}" por @${commenterUsername}`
      );

      const campaigns = await getDmCampaigns();
      const matched = campaigns.find((c) => {
        if (!c.isActive) return false;
        if (c.platform !== 'tiktok' && c.platform !== 'both') return false;
        const normalized = incomingText.toLowerCase();
        return c.keywords.some((kw) => {
          const cleanKw = kw.toLowerCase().trim().replace(/^#/, '');
          return c.matchType === 'exact'
            ? normalized === cleanKw || normalized === `#${cleanKw}`
            : normalized.includes(cleanKw);
        });
      });

      if (matched) {
        console.log(
          `[TikTok Webhook] Disparando campanha Auto-DM: ${matched.name} | Tipo: ${
            isDirectMessage ? 'Entrega de Link na DM' : 'Resposta Pública no Comentário'
          }`
        );

        // Grava no log de auditoria
        await addDmLog({
          campaignId: matched.id,
          campaignName: matched.name,
          platform: 'tiktok',
          commenterId,
          commenterUsername,
          commentText: incomingText,
          status: 'SENT',
          publicReplySent: !isDirectMessage && matched.publicReplyEnabled,
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
