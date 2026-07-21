import { supabase } from './supabase';
import { sendMetaMessage, sendCommentReply } from './instagram';

export async function drainQueue() {
  try {
    // 1. Limite prático: no máximo 200 DMs por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { count, error: countErr } = await supabase
      .from('queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent')
      .in('message_type', ['private_reply', 'welcome', 'link', 'reminder'])
      .gt('updated_at', oneHourAgo);

    if (countErr) throw countErr;

    if (count !== null && count >= 200) {
      console.log(`[Queue Worker] Limite de 200 DMs/hora atingido (Enviadas na última hora: ${count}). Abortando.`);
      return;
    }

    // Calcular quantos itens podemos processar nesta execução (ex: máximo 10 por rodada)
    const limit = Math.min(10, 200 - (count || 0));
    if (limit <= 0) return;

    // 2. Trava atômica: Reivindicar itens pendentes
    const { data: items, error: claimErr } = await supabase.rpc('claim_queue_items', {
      max_items: limit,
    });

    if (claimErr) {
      console.error('[Queue Worker] Erro ao reivindicar itens da fila:', claimErr);
      return;
    }

    if (!items || items.length === 0) {
      return;
    }

    console.log(`[Queue Worker] Processando ${items.length} itens da fila...`);

    // Obter credenciais do Instagram
    const { data: config, error: configErr } = await supabase
      .from('config')
      .select('access_token, instagram_user_id')
      .eq('id', 'instagram_config')
      .single();

    if (configErr || !config) {
      console.error('[Queue Worker] Erro ao obter credenciais do Instagram:', configErr);
      
      // Marcar os itens de volta como pending se não pudermos processar
      const ids = items.map((i: any) => i.id);
      await supabase.from('queue').update({ status: 'pending', claimed_at: null }).in('id', ids);
      return;
    }

    const { access_token, instagram_user_id } = config;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Espaçamento para respeitar o limite de 2 envios por segundo
      if (i > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      try {
        // Buscar informações do contato para checar a janela de 24h
        const { data: contact, error: contactErr } = await supabase
          .from('contacts')
          .select('last_response_at')
          .eq('id', item.contact_id)
          .single();

        if (contactErr || !contact) {
          throw new Error(`Contato não encontrado: ${item.contact_id}`);
        }

        // Validação da Janela de 24 Horas
        // Resposta privada (private_reply) para comentários fura a janela de 24h (pode ser enviada em até 7 dias)
        // Public reply é um comentário, não tem janela de 24h
        if (item.message_type === 'link' || item.message_type === 'reminder') {
          const now = new Date();
          const lastResponse = contact.last_response_at ? new Date(contact.last_response_at) : null;
          const isWindowOpen = lastResponse && (now.getTime() - lastResponse.getTime()) < 24 * 60 * 60 * 1000;

          if (!isWindowOpen) {
            console.log(`[Queue Worker] Item ${item.id} pulado. Fora da janela de 24h para o contato.`);
            
            await supabase
              .from('queue')
              .update({
                status: 'skipped',
                error_message: 'Fora da janela de 24h do contato',
                updated_at: new Date().toISOString(),
              })
              .eq('id', item.id);

            // Atualizar status do followup se houver
            const step = item.message_type;
            await supabase
              .from('followups')
              .update({ status: 'cancelled' })
              .eq('contact_id', item.contact_id)
              .eq('automation_id', item.automation_id)
              .eq('step', step)
              .eq('status', 'pending');

            continue;
          }
        }

        // Executar o envio de fato
        if (item.message_type === 'public_reply') {
          // Responder publicamente comentário
          if (!item.comment_id) throw new Error('comment_id ausente para public_reply');
          await sendCommentReply(item.comment_id, item.message_payload.message, access_token);
        } else {
          // Enviar DM (private_reply, welcome, link, reminder)
          await sendMetaMessage(instagram_user_id, item.message_payload, access_token);
        }

        // Atualizar status na fila
        await supabase
          .from('queue')
          .update({
            status: 'sent',
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        // Se for link ou reminder, marcar followup correspondente como concluído
        if (item.message_type === 'link' || item.message_type === 'reminder') {
          await supabase
            .from('followups')
            .update({ status: 'sent' })
            .eq('contact_id', item.contact_id)
            .eq('automation_id', item.automation_id)
            .eq('step', item.message_type)
            .eq('status', 'queued'); // ou pending
        }

      } catch (err: any) {
        console.error(`[Queue Worker] Erro ao processar item ${item.id}:`, err);
        
        await supabase
          .from('queue')
          .update({
            status: 'failed',
            error_message: err.message || JSON.stringify(err),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        if (item.message_type === 'link' || item.message_type === 'reminder') {
          await supabase
            .from('followups')
            .update({ status: 'failed' })
            .eq('contact_id', item.contact_id)
            .eq('automation_id', item.automation_id)
            .eq('step', item.message_type);
        }
      }
    }
  } catch (globalErr) {
    console.error('[Queue Worker] Erro crítico no processador da fila:', globalErr);
  }
}
