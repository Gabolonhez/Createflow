import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { drainQueue } from '@/lib/queue-processor';
import { after } from 'next/server';
import { getDmCampaigns, addDmLog, getConnectionsConfig } from '@/lib/db';
import { checkUserFollowsBusiness } from '@/lib/instagram';
import type { DmCampaign } from '@/types';

export const dynamic = 'force-dynamic';

function verifySignature(body: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const [algorithm, signature] = signatureHeader.split('=');
  if (algorithm !== 'sha256' || !signature) return false;

  const secrets = [
    process.env.FACEBOOK_APP_SECRET,
    process.env.INSTAGRAM_APP_SECRET,
    process.env.INSTAGRAM_CLIENT_SECRET,
  ].filter((s): s is string => Boolean(s));

  if (secrets.length === 0) {
    console.error('[Webhook] Nenhum segredo (FACEBOOK_APP_SECRET, INSTAGRAM_APP_SECRET, INSTAGRAM_CLIENT_SECRET) configurado');
    return false;
  }

  return secrets.some((secret) => {
    try {
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(body);
      const digest = hmac.digest('hex');
      return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
    } catch {
      return false;
    }
  });
}

function matchKeywords(text: string, keywords: string[], matchType: string): boolean {
  if (matchType === 'any') return true;
  if (!text || !keywords || keywords.length === 0) return false;

  const normalizedText = text.toLowerCase().trim();
  const cleanComment = normalizedText.replace(/^#/, '');

  if (matchType === 'exact') {
    return keywords.some((k) => {
      const cleanK = k.toLowerCase().trim().replace(/^#/, '');
      return cleanComment === cleanK || normalizedText === k.toLowerCase().trim();
    });
  }

  if (matchType === 'contains') {
    return keywords.some((k) => {
      const cleanK = k.toLowerCase().trim().replace(/^#/, '');
      return cleanComment.includes(cleanK) || normalizedText.includes(k.toLowerCase().trim());
    });
  }

  return false;
}

// 1. Handshake do Webhook (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // TikTok Handshake (TikTok envia ?challenge=...)
  if (searchParams.has('challenge')) {
    const challenge = searchParams.get('challenge') || 'ok';
    console.log('[Webhook] TikTok Handshake recebido via /api/webhook:', challenge);
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  // Meta / Instagram Handshake
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken =
    process.env.WEBHOOK_VERIFY_TOKEN ||
    process.env.INSTAGRAM_VERIFY_TOKEN;

  if (mode === 'subscribe' && verifyToken && token === verifyToken) {
    console.log('[Webhook] Meta Handshake bem sucedido!');
    return new Response(challenge, { status: 200 });
  }

  // Se for ping de verificação genérico sem parâmetros Meta
  if (!mode && !token) {
    return new Response('OK', { status: 200 });
  }

  console.warn('[Webhook] Falha no handshake. Token inválido.');
  return new Response('Forbidden', { status: 403 });
}

// 2. Recebimento de Eventos (POST)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody || '{}');
    } catch {
      payload = {};
    }

    // Verificação de URL do TikTok (caso configurado nesta URL)
    if (payload.challenge || payload.type === 'url_verification') {
      const challengeVal = (payload.challenge || payload.data?.challenge || 'ok').toString();
      console.log('[Webhook] TikTok POST Handshake recebido:', challengeVal);
      return new Response(challengeVal, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Validar assinatura da Meta
    if (signature && !verifySignature(rawBody, signature)) {
      console.warn('[Webhook] Assinatura inválida detectada.');
      return new Response('Invalid signature', { status: 401 });
    }

    // Se for teste do TikTok ou ping sem assinatura Meta e sem entries da Meta
    if (!payload.entry && !signature) {
      console.log('[Webhook] Evento ou teste TikTok/Ping recebido:', payload);
      try {
        await supabase.from('events').insert([{ payload, platform: 'tiktok' }]);
      } catch {}
      return NextResponse.json({ success: true, message: 'Event received' }, { status: 200 });
    }

    // Salvar o evento bruto no banco de dados para histórico/depuração
    const { data: eventRow, error: eventErr } = await supabase
      .from('events')
      .insert([{ payload }])
      .select('id')
      .single();

    if (eventErr) {
      console.error('[Webhook] Erro ao salvar evento no banco:', eventErr);
    }

    const entryList = payload.entry || [];

    for (const entry of entryList) {
      // PROCESSAR COMENTÁRIOS
      if (entry.changes) {
        for (const change of entry.changes) {
          if (change.field === 'comments') {
            const comment = change.value;
            const commentId = comment.id;
            const commentText = comment.text;
            const commenterId = comment.from?.id;
            const commenterUsername = comment.from?.username;
            const mediaId = comment.media?.id;

            if (!commentId || !commenterId) continue;

            // Evitar duplicidade de processamento para o mesmo comentário
            const { data: existingQueue } = await supabase
              .from('queue')
              .select('id')
              .eq('comment_id', commentId)
              .limit(1);

            if (existingQueue && existingQueue.length > 0) {
              console.log(`[Webhook] Comentário ${commentId} já foi processado.`);
              continue;
            }

            // Buscar automações de comentário ativas
            const { data: automations } = await supabase
              .from('automations')
              .select('*')
              .eq('active', true)
              .eq('trigger_comment', true);

            if (!automations) continue;

            // Filtrar e encontrar automação correspondente
            const matchedAutomation = automations.find((auto) => {
              if (auto.post_id && auto.post_id !== mediaId) return false;
              return matchKeywords(commentText, auto.keywords, auto.match_type);
            });

            if (matchedAutomation) {
              console.log(`[Webhook] Comentário correspondente encontrado! Automação: ${matchedAutomation.name}`);

              // Cadastrar/Atualizar Contato
              let contactId;
              const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('instagram_scoped_id', commenterId)
                .single();

              if (contact) {
                contactId = contact.id;
                await supabase
                  .from('contacts')
                  .update({
                    username: commenterUsername,
                    last_automation_id: matchedAutomation.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', contactId);
              } else {
                const { data: newContact } = await supabase
                  .from('contacts')
                  .insert({
                    instagram_scoped_id: commenterId,
                    username: commenterUsername,
                    last_automation_id: matchedAutomation.id,
                  })
                  .select('id')
                  .single();
                contactId = newContact?.id;
              }

              if (!contactId) continue;

              // Enfileirar DM Privada de Boas-Vindas usando template de botão Meta oficial (AutoDM)
              const privatePayload = matchedAutomation.quick_reply_button
                ? {
                    recipient: { comment_id: commentId },
                    message: {
                      attachment: {
                        type: 'template',
                        payload: {
                          template_type: 'button',
                          text: matchedAutomation.welcome_dm.slice(0, 640),
                          buttons: [
                            {
                              type: 'postback',
                              title: matchedAutomation.quick_reply_button.slice(0, 20),
                              payload: `QR_AUTO_${matchedAutomation.id}`,
                            },
                          ],
                        },
                      },
                    },
                  }
                : {
                    recipient: { comment_id: commentId },
                    message: { text: matchedAutomation.welcome_dm },
                  };

              await supabase.from('queue').insert({
                contact_id: contactId,
                automation_id: matchedAutomation.id,
                message_type: 'private_reply',
                recipient_instagram_id: commentId,
                comment_id: commentId,
                message_payload: privatePayload,
                status: 'pending',
              });

              // Enfileirar resposta pública no comentário se houver
              if (
                matchedAutomation.public_replies &&
                matchedAutomation.public_replies.length > 0
              ) {
                const randomReply =
                  matchedAutomation.public_replies[
                    Math.floor(Math.random() * matchedAutomation.public_replies.length)
                  ];

                await supabase.from('queue').insert({
                  contact_id: contactId,
                  automation_id: matchedAutomation.id,
                  message_type: 'public_reply',
                  recipient_instagram_id: commentId,
                  comment_id: commentId,
                  message_payload: { message: randomReply },
                  status: 'pending',
                });
              }
            } else {
              // Também verificar campanhas registradas no CreateFlow (dm_campaigns)
              const allCampaigns = await getDmCampaigns();
              const matchedDmCamp = allCampaigns.find((c) => {
                if (!c.isActive) return false;
                if (c.scope === 'specific') {
                  if (c.postId && c.postId !== mediaId) {
                    const postRef = (c.postUrl || c.postId || '').toLowerCase();
                    if (mediaId && !postRef.includes(mediaId.toLowerCase())) {
                      if (/^\d+$/.test(c.postId.trim()) && /^\d+$/.test(mediaId.trim())) {
                        return false;
                      }
                    }
                  }
                }
                return matchKeywords(commentText, c.keywords, c.matchType);
              });

              if (matchedDmCamp) {
                console.log(`[Webhook] Comentário correspondente em dm_campaigns: ${matchedDmCamp.name}`);
                await addDmLog({
                  campaignId: matchedDmCamp.id,
                  campaignName: matchedDmCamp.name,
                  platform: 'instagram',
                  commenterId,
                  commenterUsername: commenterUsername || 'instagram_user',
                  commentText,
                  status: 'SENT',
                  publicReplySent: matchedDmCamp.publicReplyEnabled,
                });

                let contactId: string | null = null;
                try {
                  const { data: contact } = await supabase
                    .from('contacts')
                    .select('id')
                    .eq('instagram_scoped_id', commenterId)
                    .single();

                  if (contact) {
                    contactId = contact.id;
                    await supabase
                      .from('contacts')
                      .update({
                        username: commenterUsername,
                        updated_at: new Date().toISOString(),
                      })
                      .eq('id', contactId);
                  } else {
                    const { data: newContact } = await supabase
                      .from('contacts')
                      .insert({
                        instagram_scoped_id: commenterId,
                        username: commenterUsername,
                      })
                      .select('id')
                      .single();
                    contactId = newContact?.id || null;
                  }
                } catch (e) {
                  // Fallback se tabela contacts estiver sem permissão
                }

                const dmBody =
                  matchedDmCamp.openingDmEnabled && matchedDmCamp.openingDmMessage
                    ? matchedDmCamp.openingDmMessage
                    : matchedDmCamp.dmMessage;

                let privatePayload: any;

                if (matchedDmCamp.requireFollow) {
                  // Follow-Gate ATIVO (Estilo AutoDM / ManyChat):
                  // Envia primeiro a mensagem exigindo que siga o perfil com botão interativo para confirmar
                  const followPrompt = (
                    matchedDmCamp.followPromptMessage ||
                    'Ei {username}! Para liberar o link exclusivo, siga nosso perfil @{account} e toque no botão abaixo:'
                  )
                    .replace('{username}', commenterUsername || 'amigo(a)')
                    .replace('{account}', matchedDmCamp.accountUsername || 'gabolonhez');

                  const btnLabel = (matchedDmCamp.followPromptButtonLabel || 'Já segui ✅').slice(0, 20);

                  privatePayload = {
                    recipient: { comment_id: commentId },
                    message: {
                      attachment: {
                        type: 'template',
                        payload: {
                          template_type: 'button',
                          text: followPrompt.slice(0, 640),
                          buttons: [
                            {
                              type: 'postback',
                              title: btnLabel,
                              payload: `QR_CHECK_FOLLOW_${matchedDmCamp.id}`,
                            },
                          ],
                        },
                      },
                    },
                  };
                } else if (matchedDmCamp.openingDmEnabled && matchedDmCamp.openingDmButtonLabel) {
                  privatePayload = {
                    recipient: { comment_id: commentId },
                    message: {
                      attachment: {
                        type: 'template',
                        payload: {
                          template_type: 'button',
                          text: (matchedDmCamp.openingDmMessage || dmBody).slice(0, 640),
                          buttons: [
                            {
                              type: 'postback',
                              title: matchedDmCamp.openingDmButtonLabel.slice(0, 20),
                              payload: `QR_CAMP_${matchedDmCamp.id}`,
                            },
                          ],
                        },
                      },
                    },
                  };
                } else if (matchedDmCamp.targetUrl) {
                  privatePayload = {
                    recipient: { comment_id: commentId },
                    message: {
                      attachment: {
                        type: 'template',
                        payload: {
                          template_type: 'generic',
                          elements: [
                            {
                              title: matchedDmCamp.cardTitle || dmBody,
                              subtitle: matchedDmCamp.cardSubtitle || undefined,
                              image_url: matchedDmCamp.cardImageUrl || undefined,
                              buttons: [
                                {
                                  type: 'web_url',
                                  url: matchedDmCamp.targetUrl,
                                  title: matchedDmCamp.linkButtonLabel || 'Acessar Link',
                                },
                              ],
                            },
                          ],
                        },
                      },
                    },
                  };
                } else {
                  privatePayload = {
                    recipient: { comment_id: commentId },
                    message: { text: dmBody },
                  };
                }

                try {
                  await supabase.from('queue').insert({
                    contact_id: contactId,
                    automation_id: null,
                    message_type: 'private_reply',
                    recipient_instagram_id: commentId,
                    comment_id: commentId,
                    message_payload: privatePayload,
                    status: 'pending',
                  });

                  if (
                    matchedDmCamp.publicReplyEnabled &&
                    matchedDmCamp.publicReplyMessages?.length > 0
                  ) {
                    const randomReply =
                      matchedDmCamp.publicReplyMessages[
                        Math.floor(
                          Math.random() * matchedDmCamp.publicReplyMessages.length
                        )
                      ];
                    await supabase.from('queue').insert({
                      contact_id: contactId,
                      automation_id: null,
                      message_type: 'public_reply',
                      recipient_instagram_id: commentId,
                      comment_id: commentId,
                      message_payload: { message: randomReply },
                      status: 'pending',
                    });
                  }
                } catch (e) {
                  console.error('[Webhook] Erro ao enfileirar no Supabase:', e);
                }
              }
            }
          }
        }
      }

      // PROCESSAR MENSAGENS DIRETAS (DMs, Stories, Botões)
      if (entry.messaging) {
        for (const messaging of entry.messaging) {
          const senderId = messaging.sender?.id;
          const message = messaging.message;
          const postback = messaging.postback;

          if (!senderId) continue;

          // Buscar configurações para não responder a si mesmo
          const { data: config } = await supabase
            .from('config')
            .select('instagram_user_id')
            .eq('id', 'instagram_config')
            .single();

          if (config && senderId === config.instagram_user_id) {
            continue; // Ignorar mensagens enviadas pelo próprio perfil
          }

          // A. Clique em botão de resposta rápida ou postback
          const payloadStr = message?.quick_reply?.payload || postback?.payload;
          if (payloadStr && payloadStr.startsWith('QR_AUTO_')) {
            const automationId = payloadStr.replace('QR_AUTO_', '');

            const { data: auto } = await supabase
              .from('automations')
              .select('*')
              .eq('id', automationId)
              .single();

            if (auto) {
              console.log(`[Webhook] Quick Reply acionada para automação: ${auto.name}`);

              let contactId;
              const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('instagram_scoped_id', senderId)
                .single();

              if (contact) {
                contactId = contact.id;
                await supabase
                  .from('contacts')
                  .update({
                    last_response_at: new Date().toISOString(),
                    last_automation_id: auto.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', contactId);
              } else {
                const { data: newContact } = await supabase
                  .from('contacts')
                  .insert({
                    instagram_scoped_id: senderId,
                    last_response_at: new Date().toISOString(),
                    last_automation_id: auto.id,
                  })
                  .select('id')
                  .single();
                contactId = newContact?.id;
              }

              if (contactId) {
                // Registrar e Enfileirar o Link
                await supabase.from('followups').insert({
                  automation_id: auto.id,
                  contact_id: contactId,
                  step: 'link',
                  scheduled_for: new Date().toISOString(),
                  status: 'queued',
                });

                const linkPayload = {
                  recipient: { id: senderId },
                  message: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: [
                          {
                            title: auto.link_text || 'Aqui está o seu link:',
                            buttons: [
                              {
                                type: 'web_url',
                                url: auto.link_url,
                                title: auto.link_button_label || 'Acessar Link',
                              },
                            ],
                          },
                        ],
                      },
                    },
                  },
                };

                await supabase.from('queue').insert({
                  contact_id: contactId,
                  automation_id: auto.id,
                  message_type: 'link',
                  recipient_instagram_id: senderId,
                  message_payload: linkPayload,
                  status: 'pending',
                });

                // Registrar e Enfileirar o Lembrete (se configurado)
                if (auto.reminder_text && auto.reminder_delay_minutes) {
                  const scheduledFor = new Date(
                    Date.now() + auto.reminder_delay_minutes * 60 * 1000
                  ).toISOString();

                  await supabase.from('followups').insert({
                    automation_id: auto.id,
                    contact_id: contactId,
                    step: 'reminder',
                    scheduled_for: scheduledFor,
                    status: 'pending',
                  });

                  const reminderPayload = {
                    recipient: { id: senderId },
                    message: { text: auto.reminder_text },
                  };

                  await supabase.from('queue').insert({
                    contact_id: contactId,
                    automation_id: auto.id,
                    message_type: 'reminder',
                    recipient_instagram_id: senderId,
                    message_payload: reminderPayload,
                    status: 'pending',
                    scheduled_for: scheduledFor,
                  });
                }
              }
            }
            continue;
          }

          if (payloadStr && (payloadStr.startsWith('QR_CAMP_') || payloadStr.startsWith('QR_CHECK_FOLLOW_'))) {
            const isFollowGateCheck = payloadStr.startsWith('QR_CHECK_FOLLOW_');
            const campId = payloadStr.replace('QR_CHECK_FOLLOW_', '').replace('QR_CAMP_', '');
            const allCamps = await getDmCampaigns();
            const camp = allCamps.find((c) => c.id === campId);

            if (camp) {
              console.log(`[Webhook] Botão acionado para campanha: ${camp.name} (FollowGate: ${isFollowGateCheck})`);

              // Obter access token da conta do Instagram
              let accessToken: string | null = null;
              const { data: config } = await supabase
                .from('config')
                .select('access_token, instagram_user_id')
                .eq('id', 'instagram_config')
                .single();

              if (config?.access_token) {
                accessToken = config.access_token;
              } else {
                const conn = await getConnectionsConfig();
                accessToken = conn.instagram_access_token || null;
              }

              let followerUsername = '';
              let userFollows = true;

              if (isFollowGateCheck && accessToken) {
                // Consultar se o seguidor realmente segue o perfil na Meta Graph API
                const followCheck = await checkUserFollowsBusiness(senderId, accessToken);
                followerUsername = followCheck.username || '';
                userFollows = followCheck.follows;
              }

              // Localizar ou registrar o contato no Supabase (obrigatório para contact_id na fila e para abrir a janela de 24h)
              let contactId: string | null = null;
              try {
                const { data: existingContact } = await supabase
                  .from('contacts')
                  .select('id')
                  .eq('instagram_scoped_id', senderId)
                  .maybeSingle();

                if (existingContact) {
                  contactId = existingContact.id;
                  await supabase
                    .from('contacts')
                    .update({
                      username: followerUsername || undefined,
                      last_response_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq('id', contactId);
                } else {
                  const { data: newContact } = await supabase
                    .from('contacts')
                    .insert({
                      instagram_scoped_id: senderId,
                      username: followerUsername || 'instagram_user',
                      last_response_at: new Date().toISOString(),
                    })
                    .select('id')
                    .single();
                  contactId = newContact?.id || null;
                }
              } catch (contactErr) {
                console.error('[Webhook] Erro ao resolver contato para postback:', contactErr);
              }

              if (!contactId) {
                console.error(`[Webhook] Impossível processar postback para ${senderId}: contact_id não pôde ser resolvido.`);
                continue;
              }

              if (isFollowGateCheck && accessToken && !userFollows) {
                console.log(`[Webhook-FollowGate] Usuário ${senderId} (@${followerUsername}) ainda NÃO segue @${camp.accountUsername}. Enviando aviso.`);

                const notFollowingMsg = `Opa ${followerUsername ? `@${followerUsername}` : ''}! Verifiquei aqui e você ainda não está seguindo o nosso perfil @${camp.accountUsername || 'gabolonhez'}. 😅\n\nBasta tocar em "Seguir" no topo desta conversa e depois tocar no botão abaixo para liberar seu link:`;
                const retryBtnLabel = (camp.followPromptButtonLabel || 'Já segui ✅').slice(0, 20);

                const retryPayload = {
                  recipient: { id: senderId },
                  message: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'button',
                        text: notFollowingMsg.slice(0, 640),
                        buttons: [
                          {
                            type: 'postback',
                            title: retryBtnLabel,
                            payload: `QR_CHECK_FOLLOW_${camp.id}`,
                          },
                        ],
                      },
                    },
                  },
                };

                try {
                  await supabase.from('queue').insert({
                    contact_id: contactId,
                    automation_id: null,
                    message_type: 'private_reply',
                    recipient_instagram_id: senderId,
                    message_payload: retryPayload,
                    status: 'pending',
                  });
                } catch (e) {
                  console.error('[Webhook] Erro ao enfileirar aviso de seguidor:', e);
                }
                continue;
              }

              if (isFollowGateCheck) {
                console.log(`[Webhook-FollowGate] Usuário ${senderId} confirmado como seguidor ativo! Entregando material.`);
              }

              // Entregar o link / material (Generic Card Template ou texto)
              if (camp.targetUrl) {
                const buttons: any[] = [
                  {
                    type: 'web_url',
                    url: camp.targetUrl,
                    title: (camp.linkButtonLabel || 'Acessar Link').slice(0, 20),
                  },
                ];

                if (camp.secondaryTargetUrl) {
                  buttons.push({
                    type: 'web_url',
                    url: camp.secondaryTargetUrl,
                    title: (camp.secondaryButtonLabel || 'Segundo Link').slice(0, 20),
                  });
                }

                const deliverablePayload = {
                  recipient: { id: senderId },
                  message: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: [
                          {
                            title: (camp.cardTitle || camp.dmMessage || camp.name)
                              .replace('{username}', followerUsername ? `@${followerUsername}` : '')
                              .replace('{link}', camp.targetUrl || '')
                              .slice(0, 80),
                            subtitle: camp.cardSubtitle
                              ? camp.cardSubtitle
                                  .replace('{username}', followerUsername ? `@${followerUsername}` : '')
                                  .replace('{link}', camp.targetUrl || '')
                                  .slice(0, 80)
                              : undefined,
                            image_url: camp.cardImageUrl || undefined,
                            buttons,
                          },
                        ],
                      },
                    },
                  },
                };

                try {
                  await supabase.from('queue').insert({
                    contact_id: contactId,
                    automation_id: null,
                    message_type: 'link',
                    recipient_instagram_id: senderId,
                    message_payload: deliverablePayload,
                    status: 'pending',
                  });
                } catch (e) {
                  console.error('[Webhook] Erro ao enfileirar entrega de link:', e);
                }
              } else {
                const textMsg = (camp.dmMessage || 'Aqui está o seu link!')
                  .replace('{username}', followerUsername ? `@${followerUsername}` : '')
                  .replace('{link}', camp.targetUrl || '');

                const textPayload = {
                  recipient: { id: senderId },
                  message: { text: textMsg },
                };

                try {
                  await supabase.from('queue').insert({
                    contact_id: contactId,
                    automation_id: null,
                    message_type: 'private_reply',
                    recipient_instagram_id: senderId,
                    message_payload: textPayload,
                    status: 'pending',
                  });
                } catch (e) {
                  console.error('[Webhook] Erro ao enfileirar texto:', e);
                }
              }

              // Registrar envio de sucesso no log
              await addDmLog({
                campaignId: camp.id,
                campaignName: camp.name,
                platform: 'instagram',
                commenterId: senderId,
                commenterUsername: followerUsername || 'instagram_user',
                commentText: isFollowGateCheck ? 'Follow-Gate: Confirmado ✅' : 'Botão: Iniciar',
                status: 'SENT',
                publicReplySent: false,
              });
            }
            continue;
          }

          // B. DM normal ou resposta a Stories
          const messageText = message?.text;
          if (messageText) {
            const isStoryReply = !!message.reply_to?.story;

            const { data: automations } = await supabase
              .from('automations')
              .select('*')
              .eq('active', true);

            if (!automations) continue;

            const matchedAutomation = automations.find((auto) => {
              if (isStoryReply && !auto.trigger_story) return false;
              if (!isStoryReply && !auto.trigger_dm) return false;
              return matchKeywords(messageText, auto.keywords, auto.match_type);
            });

            if (matchedAutomation) {
              console.log(`[Webhook] DM/Story casou com automação: ${matchedAutomation.name}`);

              let contactId;
              const { data: contact } = await supabase
                .from('contacts')
                .select('id')
                .eq('instagram_scoped_id', senderId)
                .single();

              if (contact) {
                contactId = contact.id;
                await supabase
                  .from('contacts')
                  .update({
                    last_response_at: new Date().toISOString(),
                    last_automation_id: matchedAutomation.id,
                    updated_at: new Date().toISOString(),
                  })
                  .eq('id', contactId);
              } else {
                const { data: newContact } = await supabase
                  .from('contacts')
                  .insert({
                    instagram_scoped_id: senderId,
                    last_response_at: new Date().toISOString(),
                    last_automation_id: matchedAutomation.id,
                  })
                  .select('id')
                  .single();
                contactId = newContact?.id;
              }

              if (contactId) {
                // Enfileirar Boas-vindas
                const welcomePayload = {
                  recipient: { id: senderId },
                  message: matchedAutomation.quick_reply_button
                    ? {
                        text: matchedAutomation.welcome_dm,
                        quick_replies: [
                          {
                            content_type: 'text',
                            title: matchedAutomation.quick_reply_button,
                            payload: `QR_AUTO_${matchedAutomation.id}`,
                          },
                        ],
                      }
                    : {
                        text: matchedAutomation.welcome_dm,
                      },
                };

                await supabase.from('queue').insert({
                  contact_id: contactId,
                  automation_id: matchedAutomation.id,
                  message_type: 'welcome',
                  recipient_instagram_id: senderId,
                  message_payload: welcomePayload,
                  status: 'pending',
                });
              }
            }
          }
        }
      }
    }

    // Atualizar evento como processado
    if (eventRow) {
      await supabase.from('events').update({ processed: true }).eq('id', eventRow.id);
    }

    // Disparar o esvaziamento da fila em background (after)
    after(async () => {
      console.log('[Webhook-After] Disparando drenagem imediata da fila...');
      await drainQueue();
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[Webhook Error] Falha ao processar webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
