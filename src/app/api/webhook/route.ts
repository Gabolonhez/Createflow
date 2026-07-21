import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';
import { drainQueue } from '@/lib/queue-processor';
import { after } from 'next/server';

function verifySignature(body: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;

  const [algorithm, signature] = signatureHeader.split('=');
  if (algorithm !== 'sha256' || !signature) return false;

  const appSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  if (!appSecret) {
    console.error('INSTAGRAM_CLIENT_SECRET is not configured');
    return false;
  }

  const hmac = crypto.createHmac('sha256', appSecret);
  hmac.update(body);
  const digest = hmac.digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch (e) {
    return false;
  }
}

function matchKeywords(text: string, keywords: string[], matchType: string): boolean {
  if (matchType === 'any') return true;
  if (!text || !keywords || keywords.length === 0) return false;

  const normalizedText = text.toLowerCase().trim();

  if (matchType === 'exact') {
    return keywords.some((k) => normalizedText === k.toLowerCase().trim());
  }

  if (matchType === 'contains') {
    return keywords.some((k) => normalizedText.includes(k.toLowerCase().trim()));
  }

  return false;
}

// 1. Handshake do Webhook (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook] Handshake bem sucedido!');
    return new Response(challenge, { status: 200 });
  }

  console.warn('[Webhook] Falha no handshake. Token inválido.');
  return new Response('Forbidden', { status: 403 });
}

// 2. Recebimento de Eventos (POST)
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');

    // Validar assinatura da Meta
    if (!verifySignature(rawBody, signature)) {
      console.warn('[Webhook] Assinatura inválida detectada.');
      return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(rawBody);

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

              // Enfileirar DM Privada de Boas-Vindas
              const privatePayload = {
                recipient: { comment_id: commentId },
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
