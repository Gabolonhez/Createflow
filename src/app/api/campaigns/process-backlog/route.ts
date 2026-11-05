import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getDmCampaigns, getDmLogs, addDmLog, getConnectionsConfig } from '@/lib/db';
import { checkUserFollowsBusiness } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { campaignId, batchLimit = 15 } = body;

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'ID da campanha é obrigatório.' },
        { status: 400 }
      );
    }

    // 1. Obter campanha
    const campaigns = await getDmCampaigns();
    const campaign = campaigns.find((c) => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campanha não encontrada.' },
        { status: 404 }
      );
    }

    // 2. Obter token de acesso do Instagram
    let accessToken: string | null = null;
    let instagramUserId: string | null = null;

    const { data: config } = await supabase
      .from('config')
      .select('access_token, instagram_user_id')
      .eq('id', 'instagram_config')
      .single();

    if (config?.access_token) {
      accessToken = config.access_token;
      instagramUserId = config.instagram_user_id;
    } else {
      const conn = await getConnectionsConfig();
      if (conn?.instagram_access_token) {
        accessToken = conn.instagram_access_token;
        instagramUserId = conn.instagram_user_id || null;
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Instagram não está conectado. Conecte sua conta em Conexões.',
        },
        { status: 400 }
      );
    }

    // 3. Determinar o post a ser varrido
    let targetPostId = campaign.postId;

    // Se postId for uma URL ou não for ID numérico puro, resolver via permalink/shortcode
    if (!targetPostId || !/^\d+$/.test(targetPostId.trim())) {
      const urlToMatch = (campaign.postUrl || campaign.postId || '').trim().toLowerCase();
      const recentRes = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,permalink&limit=25&access_token=${accessToken}`
      );
      if (recentRes.ok) {
        const recentData = await recentRes.json();
        const mediaList: any[] = recentData?.data || [];
        if (urlToMatch) {
          const shortcodeMatch = urlToMatch.match(/reel(?:s)?\/([A-Za-z0-9_-]+)/);
          const shortcode = shortcodeMatch ? shortcodeMatch[1] : '';

          const matched = mediaList.find((m) => {
            const permalink = (m.permalink || '').toLowerCase();
            return (
              (shortcode && permalink.includes(shortcode)) ||
              permalink.includes(urlToMatch) ||
              urlToMatch.includes(permalink)
            );
          });
          targetPostId = matched?.id || mediaList[0]?.id || null;
        } else {
          targetPostId = mediaList[0]?.id || null;
        }
      }
    }

    if (!targetPostId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nenhum post vinculado ou encontrado para varrer comentários.',
        },
        { status: 400 }
      );
    }

    // 4. Buscar comentários do post via Instagram Graph API
    const commentsUrl = `https://graph.instagram.com/${targetPostId}/comments?fields=id,text,timestamp,from,username&limit=50&access_token=${accessToken}`;
    const commentsRes = await fetch(commentsUrl);

    if (!commentsRes.ok) {
      const err = await commentsRes.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: err.error?.message || 'Falha ao buscar comentários do post.',
        },
        { status: commentsRes.status }
      );
    }

    const commentsData = await commentsRes.json();
    const rawComments: any[] = commentsData.data || [];

    // 5. Filtros Rígidos de Segurança Anti-Spam / Anti-Ban
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const safeLimit = Math.min(Math.max(batchLimit, 1), 20); // Limite rígido de max 20 por execução

    // Obter logs existentes para evitar qualquer duplicidade de envio
    const existingLogs = await getDmLogs();
    const alreadyMessagedUsers = new Set(
      existingLogs
        .filter((l) => l.campaignId === campaign.id && l.status === 'SENT')
        .map((l) => l.commenterId || l.commenterUsername)
    );

    let skippedOld = 0;
    let skippedSelf = 0;
    let skippedDuplicate = 0;
    let skippedNoMatch = 0;
    const eligibleComments: any[] = [];

    for (const comment of rawComments) {
      const commentTime = new Date(comment.timestamp).getTime();
      const commenterId = comment.from?.id || comment.username || '';
      const commenterUsername = comment.from?.username || comment.username || 'usuario';
      const commentText = (comment.text || '').toLowerCase().trim();

      // Regra 1: Janela de 7 dias (Meta bloqueia mais que 7 dias)
      if (now - commentTime > SEVEN_DAYS_MS) {
        skippedOld++;
        continue;
      }

      // Regra 2: Não enviar para o próprio autor do post
      if (
        (instagramUserId && commenterId === instagramUserId) ||
        commenterUsername.toLowerCase() === 'gabolonhez'
      ) {
        skippedSelf++;
        continue;
      }

      // Regra 3: Match de Palavra-chave da campanha
      const matchedKeyword = campaign.keywords.some((kw) => {
        const cleanKw = kw.toLowerCase().trim().replace(/^#/, '');
        return campaign.matchType === 'exact'
          ? commentText === cleanKw || commentText === `#${cleanKw}`
          : commentText.includes(cleanKw);
      });

      if (!matchedKeyword) {
        skippedNoMatch++;
        continue;
      }

      // Regra 4: Deduplicação de usuário (não incomodar quem já recebeu)
      if (alreadyMessagedUsers.has(commenterId) || alreadyMessagedUsers.has(commenterUsername)) {
        skippedDuplicate++;
        continue;
      }

      // Adiciona à lista de elegíveis
      eligibleComments.push({
        id: comment.id,
        commenterId,
        commenterUsername,
        commentText: comment.text,
      });

      // Registra no conjunto para não repetir se a mesma pessoa comentou 2 vezes
      alreadyMessagedUsers.add(commenterId);
      alreadyMessagedUsers.add(commenterUsername);

      if (eligibleComments.length >= safeLimit) {
        break;
      }
    }

    // 6. Envio com Throttling e Jitter (Pausas Humanizadas de 2.5s a 4.5s)
    let processedCount = 0;

    for (const item of eligibleComments) {
      try {
        // Pausa preventiva entre envios (Anti-Flood)
        const jitterMs = 2500 + Math.floor(Math.random() * 2000);
        await sleep(jitterMs);

        // Disparo da Private Reply via Graph API
        // Observação importante da Meta: Resposta privada direta para comentário (recipient: { comment_id })
        // suporta EXCLUSIVAMENTE mensagens de texto com links. Templates de botões (postback) causam erro 500 na Meta.
        let userFollows = true;
        let followRequested = false;

        if (campaign.requireFollow && accessToken) {
          const followCheck = await checkUserFollowsBusiness(item.commenterId, accessToken);
          userFollows = followCheck.follows;
          followRequested = !userFollows;
        }

        let textToSend = '';

        if (campaign.requireFollow && !userFollows) {
          // Follow-Gate Ativo e Usuário NÃO segue: Envia APENAS solicitação para seguir (NUNCA O LINK!)
          const followPrompt = (
            campaign.followPromptMessage ||
            'Me segue pra eu te mandar!'
          )
            .replace('{username}', item.commenterUsername ? `@${item.commenterUsername}` : '')
            .replace('{account}', campaign.accountUsername || 'gabolonhez');

          const btnText = campaign.followPromptButtonLabel || 'Já segui ✅';
          textToSend = `${followPrompt}\n\n👉 Assim que me seguir, me responde aqui com "${btnText}" para eu te enviar o link!`;
        } else {
          // Usuário já segue (ou Follow-Gate desligado): Entrega o link diretamente!
          textToSend = campaign.dmMessage || 'Aqui está o seu link!';
          textToSend = textToSend
            .replace('{username}', item.commenterUsername ? `@${item.commenterUsername}` : '')
            .replace('{link}', campaign.targetUrl || '');

          if (campaign.targetUrl && !textToSend.includes(campaign.targetUrl)) {
            textToSend = `${textToSend}\n\n👉 ${campaign.targetUrl}`;
          }
        }

        const messagePayload = { text: textToSend };

        const sendRes = await fetch(
          `https://graph.instagram.com/v21.0/me/messages?access_token=${accessToken}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipient: { comment_id: item.id },
              message: messagePayload,
            }),
          }
        );

        const isSuccess = sendRes.ok;

        // Resposta Pública ao Comentário no Instagram
        let publicReplySent = false;
        if (campaign.publicReplyEnabled && campaign.publicReplyMessages && campaign.publicReplyMessages.length > 0) {
          try {
            const randomReply =
              campaign.publicReplyMessages[
                Math.floor(Math.random() * campaign.publicReplyMessages.length)
              ];

            const pubRes = await fetch(
              `https://graph.instagram.com/v25.0/${item.id}/replies?access_token=${accessToken}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: randomReply }),
              }
            );
            publicReplySent = pubRes.ok;
          } catch (pubErr) {
            console.error('[Backlog Processor] Erro ao responder publicamente comentário:', item.id, pubErr);
          }
        }

        // Registrar no log de auditoria
        await addDmLog({
          campaignId: campaign.id,
          campaignName: campaign.name,
          platform: 'instagram',
          commenterId: item.commenterId,
          commenterUsername: item.commenterUsername || 'instagram_user',
          commentText: followRequested
            ? `${item.commentText} [Follow-Gate: Pedido de Follow]`
            : `${item.commentText} [Link Entregue]`,
          status: isSuccess ? 'SENT' : 'FAILED',
          publicReplySent,
          errorMessage: isSuccess ? null : 'Falha na Graph API ao disparar mensagem',
        });

        if (isSuccess) {
          processedCount++;
        }
      } catch (err) {
        console.error('[Backlog Processor] Erro ao enviar para comentário:', item.id, err);
      }
    }

    return NextResponse.json({
      success: true,
      totalFound: rawComments.length,
      processed: processedCount,
      eligibleFound: eligibleComments.length,
      skippedOld,
      skippedDuplicate,
      skippedSelf,
      skippedNoMatch,
      message: `Lote seguro concluído: ${processedCount} DM(s) enviada(s) com proteção anti-flood.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[Backlog Processor] Erro crítico:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
