'use use-server'; // Note: Next.js Server Actions standard directive is 'use server', but wait, the project uses ES Modules

'use server';

import { supabase } from '@/lib/supabase';
import { getOAuthUrl, getMediaList, publishInstagramMedia } from '@/lib/instagram';
import { getLinkedInOAuthUrl, publishToLinkedIn } from '@/lib/linkedin';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { generateJson, generateText } from '@/lib/gemini';

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

// ==========================================
// CREATOR STUDIO ACTIONS
// ==========================================

export async function saveCreatorProfileAction(formData: any) {
  const { niche, target_audience, objectives, voice_tone, content_pillars } = formData;
  if (!niche || !target_audience || !objectives || !voice_tone) {
    throw new Error('Todos os campos obrigatórios do perfil de marca devem ser preenchidos.');
  }
  
  const pillarsArray = typeof content_pillars === 'string'
    ? content_pillars.split(',').map((p: string) => p.trim()).filter((p: string) => p.length > 0)
    : content_pillars || [];

  const payload = {
    id: 'creator_config',
    niche,
    target_audience,
    objectives,
    voice_tone,
    content_pillars: pillarsArray,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('creator_profiles').upsert(payload);
  if (error) {
    throw new Error(`Erro ao salvar perfil do criador: ${error.message}`);
  }
  revalidatePath('/');
}

export async function saveIdeaAction(formData: any) {
  const { id, title, description, reference_url, pillar, status } = formData;
  if (!title) {
    throw new Error('Título da ideia é obrigatório.');
  }

  const payload = {
    title,
    description: description || null,
    reference_url: reference_url || null,
    pillar: pillar || null,
    status: status || 'idea',
    updated_at: new Date().toISOString()
  };

  if (id) {
    const { error } = await supabase.from('ideas').update(payload).eq('id', id);
    if (error) throw new Error(`Erro ao atualizar ideia: ${error.message}`);
  } else {
    const { error } = await supabase.from('ideas').insert([payload]);
    if (error) throw new Error(`Erro ao criar ideia: ${error.message}`);
  }
  revalidatePath('/');
}

export async function deleteIdeaAction(id: string) {
  const { error } = await supabase.from('ideas').delete().eq('id', id);
  if (error) {
    throw new Error(`Erro ao deletar ideia: ${error.message}`);
  }
  revalidatePath('/');
}

export async function saveDraftAction(formData: any) {
  const { id, title, platform, format, content, visual_script, status, idea_id, media_url, scheduled_at } = formData;
  if (!title || !platform || !format || !content) {
    throw new Error('Título, plataforma, formato e conteúdo são obrigatórios.');
  }

  const payload: any = {
    title,
    platform,
    format,
    content,
    visual_script: visual_script || null,
    status: status || 'draft',
    idea_id: idea_id || null,
    media_url: media_url || null,
    scheduled_at: scheduled_at || null,
    updated_at: new Date().toISOString()
  };

  if (id) {
    const { error } = await supabase.from('content_drafts').update(payload).eq('id', id);
    if (error) throw new Error(`Erro ao atualizar rascunho: ${error.message}`);
  } else {
    const { error } = await supabase.from('content_drafts').insert([payload]);
    if (error) throw new Error(`Erro ao criar rascunho: ${error.message}`);
    
    // Se o rascunho veio de uma ideia, atualiza o status da ideia para 'drafted'
    if (idea_id) {
      await supabase.from('ideas').update({ status: 'drafted' }).eq('id', idea_id);
    }
  }
  revalidatePath('/');
}

export async function deleteDraftAction(id: string) {
  const { error } = await supabase.from('content_drafts').delete().eq('id', id);
  if (error) {
    throw new Error(`Erro ao deletar rascunho: ${error.message}`);
  }
  revalidatePath('/');
}

export async function publishScheduledDraftsAction() {
  const now = new Date().toISOString();
  
  // Buscar rascunhos agendados para publicação até o horário atual
  const { data: scheduledDrafts, error } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('status', 'ready')
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', now);

  if (error || !scheduledDrafts || scheduledDrafts.length === 0) {
    return { publishedCount: 0 };
  }

  let publishedCount = 0;

  for (const draft of scheduledDrafts) {
    try {
      if (draft.platform === 'linkedin') {
        await publishToLinkedInAction(draft.id);
        publishedCount++;
      } else if (draft.platform === 'instagram') {
        await publishToInstagramAction(draft.id);
        publishedCount++;
      }
    } catch (e: any) {
      console.error(`Falha ao publicar rascunho agendado ${draft.id}:`, e.message);
    }
  }

  return { publishedCount };
}

export async function generateIdeasAction() {
  const { data: profile, error } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', 'creator_config')
    .maybeSingle();

  if (error || !profile) {
    throw new Error('Configure sua marca e nicho antes de gerar ideias com IA.');
  }

  const systemInstruction = `Você é um estrategista de conteúdo sênior especialista em LinkedIn, Instagram e TikTok.
O usuário fornecerá dados de seu nicho, público-alvo, objetivos da marca, tom de voz e pilares de conteúdo.
Sua missão é sugerir 5 ideias inovadoras de posts que convertam e gerem valor real.
Retorne um objeto JSON contendo um array de ideias exatamente no seguinte formato:
{
  "ideas": [
    {
      "title": "Título atrativo e instigante do post",
      "description": "Explicação detalhada do conceito do post, incluindo qual o gancho/hook e qual a estrutura que o criador deve usar.",
      "platform": "linkedin" | "instagram" | "tiktok",
      "format": "text" | "carousel" | "reels" | "post",
      "pillar": "Pilar de conteúdo correspondente"
    }
  ]
}`;

  const prompt = `Aqui estão os detalhes do meu perfil para basear as ideias:
- Nicho: ${profile.niche}
- Público-alvo: ${profile.target_audience}
- Objetivos: ${profile.objectives}
- Tom de Voz: ${profile.voice_tone}
- Pilares de Conteúdo: ${profile.content_pillars?.join(', ') || 'Geral'}

Gere 5 ideias altamente engajadoras de posts.`;

  try {
    const result = await generateJson<{ ideas: any[] }>(prompt, systemInstruction);
    return result.ideas;
  } catch (e: any) {
    throw new Error(`Erro ao gerar ideias com IA: ${e.message}`);
  }
}

export async function generateScriptAction(data: {
  title: string;
  description?: string;
  platform: 'linkedin' | 'instagram' | 'tiktok';
  format: 'reels' | 'carousel' | 'post' | 'text';
  customPrompt?: string;
}) {
  const { title, description, platform, format, customPrompt } = data;
  
  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', 'creator_config')
    .maybeSingle();

  const nicheContext = profile 
    ? `Meu Nicho: ${profile.niche}
Meu Público-alvo: ${profile.target_audience}
Meus Objetivos: ${profile.objectives}
Meu Tom de Voz: ${profile.voice_tone}
Pilares de Conteúdo: ${profile.content_pillars?.join(', ') || 'Geral'}`
    : 'Use um tom profissional, direto e agregador de valor.';

  const systemInstruction = `Você é um redator de conteúdo especialista em redes sociais de alta performance.
Você criará rascunhos de posts completos, prontos para copiar e colar, otimizados para a plataforma e formato especificados pelo usuário.
Você deve respeitar o contexto de nicho, público-alvo, objetivos e tom de voz fornecidos.
Retorne um objeto JSON contendo:
- "content": O texto principal / legenda do post (ou roteiro falado formatado).
- "visual_script": Instruções visuais detalhadas (cenas, transições, ou slides).

Formatos de resposta exigidos:
1. Se a plataforma for 'linkedin':
   - O 'content' deve ser um texto persuasivo de alta legibilidade, com parágrafos curtos, linhas espaçadas, gancho forte nas primeiras linhas, desenvolvimento claro, emojis sutis (sem exagero), hashtags e um Call to Action (CTA) claro no final.
   - O 'visual_script' pode ser vazio ou conter sugestões de imagens/gráficos complementares.
2. Se a plataforma for 'instagram' e o formato for 'carousel':
   - O 'content' deve ser a legenda que vai no post do Instagram (copy atraente, hashtags, CTA).
   - O 'visual_script' deve ser a divisão exata de slides de 1 a N, detalhando o TÍTULO de cada slide e o TEXTO EXPLICATIVO que vai na imagem.
3. Se o formato for 'reels' (Instagram ou TikTok):
   - O 'content' deve ser a LEGENDA do Reels (copy curta, hashtags, CTA).
   - O 'visual_script' deve conter o roteiro do vídeo dividido em cenas (Cena 1, Cena 2, etc.), especificando a "Ação Visual" (o que aparece na tela) e a "Fala/Áudio" (o que o criador fala no vídeo).
4. Se o formato for 'post' (imagem única no Instagram):
   - O 'content' deve ser a legenda detalhada do post.
   - O 'visual_script' deve descrever o que deve estar escrito ou desenhado na imagem única (Design do Post).`;

  const prompt = `Contexto da minha marca:
${nicheContext}

Instruções para o post:
- Título do Post: ${title}
- Conceito/Ideia Básica: ${description || 'Nenhum conceito adicional fornecido'}
- Plataforma de Destino: ${platform.toUpperCase()}
- Formato: ${format.toUpperCase()}
${customPrompt ? `- Diretrizes extras do usuário: ${customPrompt}` : ''}

Por favor, gere o post de alta com versão estruturado conforme as instruções do sistema.`;

  try {
    const result = await generateJson<{ content: string; visual_script?: string }>(prompt, systemInstruction);
    return result;
  } catch (e: any) {
    throw new Error(`Erro ao gerar roteiro com IA: ${e.message}`);
  }
}

export async function getLinkedInOAuthUrlAction() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
  const redirectUri = `${appUrl}/api/oauth/linkedin`;
  
  return getLinkedInOAuthUrl(redirectUri);
}

export async function publishToLinkedInAction(draftId: string) {
  const { data: draft, error: draftErr } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (draftErr || !draft) {
    throw new Error('Rascunho não encontrado.');
  }

  const { data: config, error: configErr } = await supabase
    .from('config')
    .select('linkedin_access_token, linkedin_profile_id')
    .eq('id', 'instagram_config')
    .single();

  if (configErr || !config || !config.linkedin_access_token || !config.linkedin_profile_id) {
    throw new Error('Conecte sua conta do LinkedIn nas configurações antes de publicar.');
  }

  try {
    const result = await publishToLinkedIn(
      config.linkedin_access_token,
      config.linkedin_profile_id,
      draft.content,
      draft.media_url || undefined
    );

    if (result.success) {
      await supabase
        .from('content_drafts')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', draftId);
    }

    revalidatePath('/');
    return { success: true, postId: result.postId };
  } catch (err: any) {
    throw new Error(`Erro na publicação do LinkedIn: ${err.message}`);
  }
}

export async function publishToInstagramAction(draftId: string) {
  const { data: draft, error: draftErr } = await supabase
    .from('content_drafts')
    .select('*')
    .eq('id', draftId)
    .single();

  if (draftErr || !draft) {
    throw new Error('Rascunho não encontrado.');
  }

  if (!draft.media_url) {
    throw new Error('Mídias do Instagram exigem uma URL de imagem ou vídeo válida.');
  }

  const { data: config, error: configErr } = await supabase
    .from('config')
    .select('access_token, instagram_user_id')
    .eq('id', 'instagram_config')
    .single();

  if (configErr || !config || !config.access_token || !config.instagram_user_id) {
    throw new Error('Conecte sua conta profissional do Instagram antes de publicar.');
  }

  try {
    const mediaType = draft.format === 'reels' ? 'REELS' : 'IMAGE';
    const postId = await publishInstagramMedia(
      config.instagram_user_id,
      config.access_token,
      draft.media_url,
      draft.content,
      mediaType
    );

    await supabase
      .from('content_drafts')
      .update({
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', draftId);

    revalidatePath('/');
    return { success: true, postId };
  } catch (err: any) {
    throw new Error(`Erro na publicação do Instagram: ${err.message}`);
  }
}

export async function createChatSessionAction(title: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert([{ title, updated_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar sessão de chat: ${error.message}`);
  }
  revalidatePath('/');
  return data;
}

export async function deleteChatSessionAction(id: string) {
  const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
  if (error) {
    throw new Error(`Erro ao deletar sessão: ${error.message}`);
  }
  revalidatePath('/');
}

export async function sendMessageAction(sessionId: string, messageText: string) {
  const { error: userMsgErr } = await supabase
    .from('chat_messages')
    .insert([{ session_id: sessionId, role: 'user', content: messageText }]);

  if (userMsgErr) {
    throw new Error(`Erro ao salvar mensagem: ${userMsgErr.message}`);
  }

  const { data: profile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', 'creator_config')
    .maybeSingle();

  const nicheContext = profile
    ? `Meu Perfil Estratégico de Conteúdo:
- Nicho: ${profile.niche}
- Público-Alvo: ${profile.target_audience}
- Objetivos principais: ${profile.objectives}
- Tom de Voz: ${profile.voice_tone}
- Pilares de Conteúdo: ${profile.content_pillars?.join(', ') || 'Geral'}`
    : 'Use um tom profissional, direto e aglutinador de valor.';

  const { data: history } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  const systemInstruction = `Você é um estrategista digital de elite e o "Segundo Cérebro" do criador de conteúdo.
Sua missão é ajudar o usuário a ter ideias de posts, estruturar roteiros de vídeo, revisar copies e planejar posts de LinkedIn, Instagram e TikTok.
Você deve responder sempre com textos HUMANIZADOS, sem clichês típicos de IA (ex: "Prepare-se para", "No ecossistema de", "Descubra o fascinante mundo", etc.).
Escreva de forma conversacional, autêntica, como se fosse um colega ou ghostwriter experiente.
Respeite rigorosamente a identidade e nicho do usuário abaixo:

${nicheContext}

Mantenha formatação limpa e de fácil leitura.`;

  const formattedHistory = history 
    ? history.slice(-10).map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n')
    : '';
    
  const prompt = `${formattedHistory}\n\nResponda à última mensagem do Usuário de forma humana e direta.`;

  try {
    const responseText = await generateText(prompt, systemInstruction);

    const { error: modelMsgErr } = await supabase
      .from('chat_messages')
      .insert([{ session_id: sessionId, role: 'model', content: responseText }]);

    if (modelMsgErr) {
      throw new Error(`Erro ao salvar resposta da IA: ${modelMsgErr.message}`);
    }

    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    revalidatePath('/');
    return { content: responseText };
  } catch (err: any) {
    throw new Error(`Erro ao obter resposta do Gemini: ${err.message}`);
  }
}

export async function analyzeTrendAction(content: string) {
  const systemInstruction = `Você é um especialista em engenharia reversa de posts virais e de alta performance.
Sua missão é desconstruir o post de referência enviado pelo usuário.
Você deve analisar:
1. O GANCHO (Hook): Por que funciona, qual o gatilho psicológico.
2. A ESTRUTURA: A linha de raciocínio passo a passo (problema, dados, lição, CTA).
3. LIÇÕES CHAVE: Melhores práticas observadas nesse post.
4. MODELO DE TEMPLATE REUTILIZÁVEL: Reescreva o post substituindo as partes específicas por placeholders como [Dificuldade], [Solução], [Resultado] para que o usuário possa preencher com seu próprio nicho.

Retorne um objeto JSON estritamente no seguinte formato:
{
  "title": "Frase resumindo o tema do post",
  "hook": "Análise do gancho em poucas frases",
  "structure": "Explicação passo a passo da estrutura",
  "key_takeaways": "Lições de conversão do post",
  "reusable_template": "O template pronto com placeholders entre colchetes"
}`;

  const prompt = `Por favor, desconstrua o seguinte post de sucesso:\n\n${content}`;

  try {
    const result = await generateJson<{
      title: string;
      hook: string;
      structure: string;
      key_takeaways: string;
      reusable_template: string;
    }>(prompt, systemInstruction);

    return result;
  } catch (err: any) {
    throw new Error(`Erro ao analisar tendência com IA: ${err.message}`);
  }
}

export async function saveAnalyzedTemplateAction(formData: any) {
  const { title, original_content, hook, structure, key_takeaways, reusable_template } = formData;
  if (!title || !original_content || !reusable_template) {
    throw new Error('Título, conteúdo original e template reutilizável são obrigatórios.');
  }

  const payload = {
    title,
    original_content,
    hook: hook || null,
    structure: structure || null,
    key_takeaways: key_takeaways || null,
    reusable_template,
  };

  const { error } = await supabase.from('analyzed_templates').insert([payload]);
  if (error) {
    throw new Error(`Erro ao salvar modelo analisado: ${error.message}`);
  }
  revalidatePath('/');
}

export async function deleteAnalyzedTemplateAction(id: string) {
  const { error } = await supabase.from('analyzed_templates').delete().eq('id', id);
  if (error) {
    throw new Error(`Erro ao deletar modelo: ${error.message}`);
  }
  revalidatePath('/');
}

export async function refineDraftAction(data: {
  content: string;
  refinementType: 'humanize' | 'shorten' | 'simplify' | 'engagement';
}) {
  const { content, refinementType } = data;
  
  const systemInstruction = `Você é um copywriter humano sênior e ghostwriter de executivos e criadores de conteúdo.
Sua tarefa é refinar e reescrever o rascunho de texto enviado pelo usuário.
Elimine todos os clichês e marcadores de inteligência artificial (como "Prepare-se para", "No mundo de hoje", "Em suma", "Entenda a importância", "Descubra", "Potencialize").
Escreva de forma extremamente natural, humana, com frases curtas, tom de conversa sincera e ritmo dinâmico.
Tipo de refinamento solicitado:
- 'humanize': Tom mais natural, empático, autêntico, como se uma pessoa real estivesse falando ou escrevendo de forma espontânea.
- 'shorten': Texto mais enxuto e direto, removendo enrolação e mantendo o soco e ganchos fortes.
- 'simplify': Linguagem simples, acessível e direta, eliminando qualquer jargão pedante ou rebuscado.
- 'engagement': Ajustado para gerar reações, discussões saudáveis nos comentários e compartilhamentos.

Retorne um objeto JSON contendo o texto refinado:
{
  "content": "O texto refinado aqui"
}`;

  const prompt = `Aplique o refinamento '${refinementType}' neste texto:\n\n${content}`;

  try {
    const result = await generateJson<{ content: string }>(prompt, systemInstruction);
    return result.content;
  } catch (err: any) {
    throw new Error(`Erro ao refinar com IA: ${err.message}`);
  }
}

export async function getChatMessagesAction(sessionId: string) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar mensagens: ${error.message}`);
  }
  return data || [];
}

