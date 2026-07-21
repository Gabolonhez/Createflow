'use use-server'; // Note: Next.js Server Actions standard directive is 'use server', but wait, the project uses ES Modules

'use server';

import { supabase } from '@/lib/supabase';
import { getOAuthUrl, getMediaList } from '@/lib/instagram';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export async function getInstagramOAuthUrlAction() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/oauth/callback`;
  
  return getOAuthUrl(redirectUri);
}

export async function disconnectInstagramAction() {
  const { error } = await supabase.from('config').delete().eq('id', 'instagram_config');
  if (error) {
    throw new Error(`Erro ao desconectar: ${error.message}`);
  }
  revalidatePath('/');
}

export async function toggleAutomationAction(id: string, active: boolean) {
  const { error } = await supabase
    .from('automations')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', id);
    
  if (error) {
    throw new Error(`Erro ao alterar status: ${error.message}`);
  }
  revalidatePath('/');
}

export async function deleteAutomationAction(id: string) {
  const { error } = await supabase.from('automations').delete().eq('id', id);
  if (error) {
    throw new Error(`Erro ao deletar automação: ${error.message}`);
  }
  revalidatePath('/');
}

export async function saveAutomationAction(formData: any) {
  const {
    id,
    name,
    active,
    trigger_comment,
    trigger_story,
    trigger_dm,
    keywords,
    match_type,
    post_id,
    post_permalink,
    post_media_url,
    public_replies,
    welcome_dm,
    quick_reply_button,
    link_text,
    link_button_label,
    link_url,
    reminder_text,
    reminder_delay_minutes,
  } = formData;

  if (!name || !welcome_dm) {
    throw new Error('Nome da automação e DM de boas-vindas são obrigatórios.');
  }

  // Tratar palavras-chave (string separada por vírgula -> array)
  const keywordsArray = typeof keywords === 'string' 
    ? keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
    : keywords || [];

  // Tratar respostas públicas (string com quebras de linha -> array)
  const publicRepliesArray = typeof public_replies === 'string'
    ? public_replies.split('\n').map((r: string) => r.trim()).filter((r: string) => r.length > 0)
    : public_replies || [];

  const payload: any = {
    name,
    active: active ?? true,
    trigger_comment: trigger_comment ?? false,
    trigger_story: trigger_story ?? false,
    trigger_dm: trigger_dm ?? false,
    keywords: keywordsArray,
    match_type: match_type || 'contains',
    post_id: post_id || null,
    post_permalink: post_permalink || null,
    post_media_url: post_media_url || null,
    public_replies: publicRepliesArray,
    welcome_dm,
    quick_reply_button: quick_reply_button || null,
    link_text: link_text || null,
    link_button_label: link_button_label || null,
    link_url: link_url || null,
    reminder_text: reminder_text || null,
    reminder_delay_minutes: reminder_delay_minutes ? parseInt(reminder_delay_minutes, 10) : null,
    updated_at: new Date().toISOString(),
  };

  if (id) {
    const { error } = await supabase.from('automations').update(payload).eq('id', id);
    if (error) throw new Error(`Erro ao atualizar automação: ${error.message}`);
  } else {
    const { error } = await supabase.from('automations').insert([payload]);
    if (error) throw new Error(`Erro ao criar automação: ${error.message}`);
  }

  revalidatePath('/');
}

export async function fetchInstagramMediaAction() {
  const { data: config, error } = await supabase
    .from('config')
    .select('access_token, instagram_user_id')
    .eq('id', 'instagram_config')
    .single();

  if (error || !config) {
    return [];
  }

  try {
    return await getMediaList(config.instagram_user_id, config.access_token);
  } catch (err) {
    console.error('Erro ao carregar mídias do Instagram:', err);
    return [];
  }
}
