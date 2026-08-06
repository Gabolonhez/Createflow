'use server';

import {
  setDocData,
  addDocData,
  updateDocData,
  deleteDocData,
  getDocById,
  getCollectionData,
} from '@/lib/db';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where, addDoc } from 'firebase/firestore';
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
  await deleteDocData('config', 'instagram_config');
  revalidatePath('/');
}

export async function toggleAutomationAction(id: string, active: boolean) {
  await updateDocData('automations', id, { active });
  revalidatePath('/');
}

export async function deleteAutomationAction(id: string) {
  await deleteDocData('automations', id);
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

  const keywordsArray = typeof keywords === 'string' 
    ? keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
    : keywords || [];

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
  };

  if (id) {
    await updateDocData('automations', id, payload);
  } else {
    await addDocData('automations', payload);
  }

  revalidatePath('/');
}

export async function fetchInstagramMediaAction() {
  const config = await getDocById('config', 'instagram_config');
  if (!config || !config.access_token || !config.instagram_user_id) {
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
// CREATOR STUDIO ACTIONS (FIRESTORE)
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
    niche,
    target_audience,
    objectives,
    voice_tone,
    content_pillars: pillarsArray,
  };

  await setDocData('creator_profiles', 'creator_config', payload);
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
  };

  if (id) {
    await updateDocData('ideas', id, payload);
  } else {
    await addDocData('ideas', payload);
  }
  revalidatePath('/');
}

export async function deleteIdeaAction(id: string) {
  await deleteDocData('ideas', id);
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
  };

  if (id) {
    await updateDocData('content_drafts', id, payload);
  } else {
    await addDocData('content_drafts', payload);
    
    if (idea_id) {
      await updateDocData('ideas', idea_id, { status: 'drafted' });
    }
  }
  revalidatePath('/');
}

export async function deleteDraftAction(id: string) {
  await deleteDocData('content_drafts', id);
  revalidatePath('/');
}

export async function publishScheduledDraftsAction() {
  const now = new Date().toISOString();
  const drafts = await getCollectionData('content_drafts');
  
  const scheduledDrafts = drafts.filter(
    (d: any) => d.status === 'ready' && d.scheduled_at && d.scheduled_at <= now
  );

  if (!scheduledDrafts.length) {
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
  try {
    const profile = await getDocById('creator_profiles', 'creator_config');

    if (!profile) {
      return { error: 'Configure sua marca e nicho no Perfil de Marca antes de gerar ideias com IA.' };
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

    const result = await generateJson<{ ideas: any[] }>(prompt, systemInstruction);
    return result.ideas;
  } catch (e: any) {
    console.error('Erro ao gerar ideias:', e);
    return { error: e.message || 'Erro ao gerar ideias com IA.' };
  }
}

export async function generateSchedulePlanAction() {
  try {
    const profile = await getDocById('creator_profiles', 'creator_config');

    if (!profile) {
      return { error: 'Configure seu Perfil de Marca (nicho, objetivos, público-alvo) antes de gerar o Cronograma Estratégico.' };
    }

    const systemInstruction = `Você é o estrategista chefe de mídias sociais e especialista em cronogramas de publicação para criadores de conteúdo e negócios.
Sua missão é criar o Cronograma Semanal Estratégico Ideal para o usuário baseado rigorosamente no seu nicho, objetivos de negócios e público-alvo.

Análise exigida:
1. Determine a Frequência Semanal Ideal (ex: 3 a 5 posts por semana) para evitar overposting e maximizar conversão.
2. Defina a Ordem Sequencial dos Conteúdos na semana (ex: Começar a semana com Gancho/Atração, meio da semana com Autoridade/Educação, final da semana com Conversão/Venda ou Prova Social).
3. Especifique Dias, Horários de Pico recomendados, Plataformas e Formatos de maior alcance.

Retorne um objeto JSON estritamente no seguinte formato:
{
  "weeklyFrequency": "4 posts por semana",
  "strategySummary": "Resumo da estratégia semanal explicando por que essa ordem e formatos foram escolhidos para os objetivos do criador.",
  "items": [
    {
      "dayOfWeek": "Segunda-feira",
      "recommendedTime": "08:30",
      "platform": "linkedin",
      "format": "text",
      "pillar": "Atração & Tendências",
      "suggestedTopic": "Título / Tema recomendado para este dia",
      "reasoning": "Por que publicar este tema neste dia e horário"
    }
  ]
}`;

    const prompt = `Crie o cronograma semanal ideal para o meu perfil:
- Nicho: ${profile.niche}
- Público-alvo: ${profile.target_audience}
- Objetivos principais: ${profile.objectives}
- Tom de Voz: ${profile.voice_tone}
- Pilares de Conteúdo: ${profile.content_pillars?.join(', ') || 'Geral'}

Gere a estrutura completa do cronograma semanal estratégico.`;

    const result = await generateJson<{
      weeklyFrequency: string;
      strategySummary: string;
      items: Array<{
        dayOfWeek: string;
        recommendedTime: string;
        platform: string;
        format: string;
        pillar: string;
        suggestedTopic: string;
        reasoning: string;
      }>;
    }>(prompt, systemInstruction);

    return result;
  } catch (e: any) {
    console.error('Erro ao gerar cronograma:', e);
    return { error: e.message || 'Erro ao gerar Cronograma Estratégico com IA.' };
  }
}

export async function generateScriptAction(data: {
  title: string;
  description?: string;
  platform: 'linkedin' | 'instagram' | 'tiktok';
  format: 'reels' | 'carousel' | 'post' | 'text';
  customPrompt?: string;
}) {
  try {
    const { title, description, platform, format, customPrompt } = data;
    
    const profile = await getDocById('creator_profiles', 'creator_config');

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
- "visual_script": Instruções visuais detalhadas (cenas, transições, ou slides).`;

    const prompt = `Contexto da minha marca:
${nicheContext}

Instruções para o post:
- Título do Post: ${title}
- Conceito/Ideia Básica: ${description || 'Nenhum conceito adicional fornecido'}
- Plataforma de Destino: ${platform.toUpperCase()}
- Formato: ${format.toUpperCase()}
${customPrompt ? `- Diretrizes extras do usuário: ${customPrompt}` : ''}

Por favor, gere o post de alta conversão estruturado conforme as instruções do sistema.`;

    const result = await generateJson<{ content: string; visual_script?: string }>(prompt, systemInstruction);
    return result;
  } catch (e: any) {
    console.error('Erro ao gerar roteiro:', e);
    return { error: e.message || 'Erro ao gerar roteiro com IA.' };
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
  const draft = await getDocById('content_drafts', draftId);
  if (!draft) {
    throw new Error('Rascunho não encontrado.');
  }

  const config = await getDocById('config', 'instagram_config');
  if (!config || !config.linkedin_access_token || !config.linkedin_profile_id) {
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
      await updateDocData('content_drafts', draftId, {
        status: 'published',
        published_at: new Date().toISOString()
      });
    }

    revalidatePath('/');
    return { success: true, postId: result.postId };
  } catch (err: any) {
    throw new Error(`Erro na publicação do LinkedIn: ${err.message}`);
  }
}

export async function publishToInstagramAction(draftId: string) {
  const draft = await getDocById('content_drafts', draftId);
  if (!draft) {
    throw new Error('Rascunho não encontrado.');
  }

  if (!draft.media_url) {
    throw new Error('Mídias do Instagram exigem uma URL de imagem ou vídeo válida.');
  }

  const config = await getDocById('config', 'instagram_config');
  if (!config || !config.access_token || !config.instagram_user_id) {
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

    await updateDocData('content_drafts', draftId, {
      status: 'published',
      published_at: new Date().toISOString()
    });

    revalidatePath('/');
    return { success: true, postId };
  } catch (err: any) {
    throw new Error(`Erro na publicação do Instagram: ${err.message}`);
  }
}

export async function createChatSessionAction(title: string) {
  try {
    const data = await addDocData('chat_sessions', { title });
    revalidatePath('/');
    return { success: true, ...data };
  } catch (err: any) {
    console.error('Erro ao criar sessão:', err);
    return { error: err.message || 'Erro ao criar sessão no banco de dados.' };
  }
}

export async function deleteChatSessionAction(id: string) {
  try {
    await deleteDocData('chat_sessions', id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function sendMessageAction(sessionId: string, messageText: string) {
  try {
    const messagesColRef = collection(db, `chat_sessions/${sessionId}/messages`);
    const now = new Date().toISOString();
    
    await addDoc(messagesColRef, {
      role: 'user',
      content: messageText,
      created_at: now
    });

    const profile = await getDocById('creator_profiles', 'creator_config');

    const nicheContext = profile
      ? `Meu Perfil Estratégico de Conteúdo:
- Nicho: ${profile.niche}
- Público-Alvo: ${profile.target_audience}
- Objetivos principais: ${profile.objectives}
- Tom de Voz: ${profile.voice_tone}
- Pilares de Conteúdo: ${profile.content_pillars?.join(', ') || 'Geral'}`
      : 'Use um tom profissional, direto e aglutinador de valor.';

    const q = query(messagesColRef, orderBy('created_at', 'asc'));
    const historySnap = await getDocs(q);
    const history = historySnap.docs.map((d) => d.data());

    const systemInstruction = `Você é um estrategista digital de elite e o "Segundo Cérebro" do criador de conteúdo.
Sua missão é ajudar o usuário a ter ideias de posts, estruturar roteiros de vídeo, revisar copies e planejar posts de LinkedIn, Instagram e TikTok.
Você deve responder sempre com textos HUMANIZADOS, sem clichês típicos de IA.
Escreva de forma conversacional, autêntica, como se fosse um colega ou ghostwriter experiente.
Respeite rigorosamente a identidade e nicho do usuário abaixo:

${nicheContext}

Mantenha formatação limpa e de fácil leitura.`;

    const formattedHistory = history.slice(-10).map((m: any) => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`).join('\n\n');
    const prompt = `${formattedHistory}\n\nResponda à última mensagem do Usuário de forma humana e direta.`;

    const responseText = await generateText(prompt, systemInstruction);

    await addDoc(messagesColRef, {
      role: 'model',
      content: responseText,
      created_at: new Date().toISOString()
    });

    await updateDocData('chat_sessions', sessionId, { updated_at: new Date().toISOString() });

    revalidatePath('/');
    return { success: true, content: responseText };
  } catch (err: any) {
    console.error('Erro ao obter resposta do Gemini:', err);
    return { error: err.message || 'Erro ao comunicar com o Gemini.' };
  }
}

export async function analyzeTrendAction(content: string) {
  const systemInstruction = `Você é um especialista em engenharia reversa de posts virais e de alta performance.
Sua missão é desconstruir o post de referência enviado pelo usuário.
Você deve analisar:
1. O GANCHO (Hook): Por que funciona, qual o gatilho psicológico.
2. A ESTRUTURA: A linha de raciocínio passo a passo.
3. LIÇÕES CHAVE: Melhores práticas observadas nesse post.
4. MODELO DE TEMPLATE REUTILIZÁVEL: Reescreva o post substituindo as partes específicas por placeholders como [Dificuldade], [Solução], [Resultado].

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

    return { success: true, ...result };
  } catch (err: any) {
    console.error('Erro ao analisar tendência:', err);
    return { error: err.message || 'Erro ao analisar tendência com IA.' };
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

  await addDocData('analyzed_templates', payload);
  revalidatePath('/');
}

export async function deleteAnalyzedTemplateAction(id: string) {
  await deleteDocData('analyzed_templates', id);
  revalidatePath('/');
}

export async function refineDraftAction(data: {
  content: string;
  refinementType: 'humanize' | 'shorten' | 'simplify' | 'engagement';
}) {
  try {
    const { content, refinementType } = data;
    
    const systemInstruction = `Você é um copywriter humano sênior e ghostwriter de executivos e criadores de conteúdo.
Sua tarefa é refinar e reescrever o rascunho de texto enviado pelo usuário.
Elimine todos os clichês e marcadores de inteligência artificial.
Escreva de forma extremamente natural, humana, com frases curtas, tom de conversa sincera e ritmo dinâmico.
Tipo de refinamento solicitado:
- 'humanize': Tom mais natural, empático, autêntico.
- 'shorten': Texto mais enxuto e direto.
- 'simplify': Linguagem simples, acessível.
- 'engagement': Ajustado para gerar reações e comentários.

Retorne um objeto JSON contendo o texto refinado:
{
  "content": "O texto refinado aqui"
}`;

    const prompt = `Aplique o refinamento '${refinementType}' neste texto:\n\n${content}`;

    const result = await generateJson<{ content: string }>(prompt, systemInstruction);
    return { success: true, content: result.content };
  } catch (err: any) {
    console.error('Erro ao refinar rascunho:', err);
    return { error: err.message || 'Erro ao refinar texto com IA.' };
  }
}

export async function getChatMessagesAction(sessionId: string) {
  const messagesColRef = collection(db, `chat_sessions/${sessionId}/messages`);
  const q = query(messagesColRef, orderBy('created_at', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}
