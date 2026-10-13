'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import {
  saveCreatorPost,
  deleteCreatorPost,
  getCreatorPostById,
  getCreatorPosts,
  saveIdea,
  deleteIdea,
  getIdeas,
  getTopics,
  saveTopic,
  deleteTopic,
  saveFact,
  deleteFact,
  saveReference,
  deleteReference,
  getReferences,
  getVoiceProfile,
  saveVoiceProfile,
  getAiLearnings,
  addAiLearning,
  deleteAiLearning,
  getFacts,
  getConnectionsConfig,
  saveConnectionsConfig,
  getPostSlots,
  savePostSlots,
} from '@/lib/db';
import {
  generateCreatorPost,
  rewriteInVoice,
  checkVoiceClichés,
  generateTopicsForCreator,
  analyzeReferencePost,
  generateBrainstormIdeas,
  generateSprayPackage,
  generateAiVisualPrompt,
  translateAndLocalizePost,
} from '@/lib/ai-assistant';
import { publishToX, publishXThread } from '@/lib/twitter';
import { publishToLinkedIn } from '@/lib/linkedin';
import { nextFreeSlot, formatScheduleDatePtBr } from '@/lib/schedule';
import type {
  CreatorPost,
  PostIdea,
  Topic,
  Fact,
  Reference,
  VoiceProfile,
  ConnectionsConfig,
  Platform,
  ThreadStyle,
  SprayVariant,
  SprayResult,
  MediaAsset,
  AiVisualArchetype,
  GenerateAiImageParams,
  TranslatePostParams,
} from '@/types';

// ==========================================
// POST MANAGEMENT & WORKFLOW ACTIONS
// ==========================================

export async function savePostAction(postData: Partial<CreatorPost>) {
  try {
    const voiceProfile = await getVoiceProfile();
    let voiceCheck = postData.voiceCheck;

    if (postData.text) {
      voiceCheck = await checkVoiceClichés(postData.text, voiceProfile);
    }

    const saved = await saveCreatorPost({
      ...postData,
      voiceCheck,
    });

    revalidatePath('/');
    return { success: true, post: saved };
  } catch (err: any) {
    console.error('Erro ao salvar post:', err);
    return { error: err.message || 'Falha ao salvar post.' };
  }
}

export async function deletePostAction(id: string) {
  try {
    await deleteCreatorPost(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao excluir post.' };
  }
}

export async function approvePostAction(postId: string, scheduledFor?: string) {
  try {
    const post = await getCreatorPostById(postId);
    if (!post) throw new Error('Post não encontrado.');

    let finalScheduled = scheduledFor;

    // Se nenhuma data foi fornecida, calcula o próximo horário de slot do perfil
    if (!finalScheduled) {
      const slots = await getPostSlots();
      const allPosts = await getCreatorPosts();
      const takenDates = allPosts
        .filter((p) => p.status === 'SCHEDULED' && p.scheduledFor && p.id !== postId)
        .map((p) => p.scheduledFor as string);
      const nextSlot = nextFreeSlot(slots, takenDates);
      finalScheduled = nextSlot.toISOString();
    }

    const updated = await saveCreatorPost({
      ...post,
      status: 'SCHEDULED',
      scheduledFor: finalScheduled,
      updated_at: new Date().toISOString(),
    });

    revalidatePath('/');
    return { success: true, post: updated, scheduledFor: finalScheduled };
  } catch (err: any) {
    return { error: err.message || 'Falha ao aprovar post.' };
  }
}

export async function rejectPostAction(postId: string, reasonText: string, category: 'tone' | 'structure' | 'topics' | 'formatting' = 'tone') {
  try {
    const post = await getCreatorPostById(postId);
    if (!post) throw new Error('Post não encontrado.');

    await saveCreatorPost({
      ...post,
      status: 'REJECTED',
      rejectReason: reasonText,
      updated_at: new Date().toISOString(),
    });

    // Registra a lição de aprendizado para a IA não cometer o mesmo erro
    if (reasonText && reasonText.trim().length > 3) {
      await addAiLearning({
        lesson: `Evitar no futuro: "${reasonText.trim()}". Baseado em rejeição de post sobre [${post.pillar || 'geral'}].`,
        category,
        source: 'rejection',
        created_at: new Date().toISOString(),
      });
    }

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao rejeitar post.' };
  }
}

export async function markPostAsPublishedAction(postId: string, externalUrl?: string) {
  try {
    const post = await getCreatorPostById(postId);
    if (!post) throw new Error('Post não encontrado.');

    await saveCreatorPost({
      ...post,
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      xPostUrl: post.platforms.includes('x') && externalUrl ? externalUrl : post.xPostUrl,
      linkedinPostUrl: post.platforms.includes('linkedin') && externalUrl ? externalUrl : post.linkedinPostUrl,
      updated_at: new Date().toISOString(),
    });

    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao marcar como publicado.' };
  }
}

export async function publishPostNowAction(postId: string) {
  try {
    const post = await getCreatorPostById(postId);
    if (!post) throw new Error('Post não encontrado.');

    const connections = await getConnectionsConfig();
    const results: { platform: string; success: boolean; url?: string; error?: string }[] = [];

    // Publicação no X (Twitter)
    if (post.platforms.includes('x')) {
      const allTweets = [post.text, ...(post.thread || [])].filter((t) => t.trim().length > 0);
      if (allTweets.length > 1) {
        const xRes = await publishXThread(allTweets);
        results.push({
          platform: 'x',
          success: xRes.success,
          url: xRes.firstTweetUrl,
          error: xRes.error,
        });
      } else {
        const xRes = await publishToX(post.text);
        results.push({
          platform: 'x',
          success: xRes.success,
          url: xRes.tweetUrl,
          error: xRes.error,
        });
      }
    }

    // Publicação no LinkedIn
    if (post.platforms.includes('linkedin')) {
      if (connections.linkedin_access_token && connections.linkedin_profile_id) {
        try {
          const fullLinkedInText = [post.text, ...(post.thread || [])].join('\n\n');
          const liRes = await publishToLinkedIn(
            connections.linkedin_access_token,
            connections.linkedin_profile_id,
            fullLinkedInText,
            post.mediaUrls?.[0]
          );
          results.push({
            platform: 'linkedin',
            success: true,
            url: `https://www.linkedin.com/feed/update/urn:li:activity:${liRes.postId}`,
          });
        } catch (err: any) {
          results.push({
            platform: 'linkedin',
            success: false,
            error: err.message,
          });
        }
      } else {
        results.push({
          platform: 'linkedin',
          success: false,
          error: 'Conta do LinkedIn não conectada via API.',
        });
      }
    }

    const anySuccess = results.some((r) => r.success);
    if (anySuccess) {
      const xResult = results.find((r) => r.platform === 'x' && r.success);
      const liResult = results.find((r) => r.platform === 'linkedin' && r.success);

      await saveCreatorPost({
        ...post,
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        xPostUrl: xResult?.url || post.xPostUrl,
        linkedinPostUrl: liResult?.url || post.linkedinPostUrl,
        updated_at: new Date().toISOString(),
      });
    }

    revalidatePath('/');
    return { success: anySuccess, results };
  } catch (err: any) {
    return { error: err.message || 'Erro ao publicar.' };
  }
}

// ==========================================
// AI GENERATION & REWRITING ACTIONS
// ==========================================

export async function generatePostAction(options: {
  sourceType: 'idea' | 'topic' | 'fact' | 'reference' | 'scratch';
  sourceTitle?: string;
  sourceContent?: string;
  pillar?: string;
  platforms: Platform[];
  threadStyle?: ThreadStyle;
  threadLength?: number;
  instruction?: string;
  language?: 'pt-BR' | 'en-US';
}) {
  try {
    const voiceProfile = await getVoiceProfile();
    const facts = await getFacts();
    const references = await getReferences();

    const result = await generateCreatorPost({
      ...options,
      voiceProfile,
      facts,
      references,
    });

    const newPost: Partial<CreatorPost> = {
      text: result.text,
      thread: result.thread,
      linkedinText: result.linkedinText || null,
      threadStyle: options.threadStyle || (result.thread.length > 0 ? 'thread' : 'single'),
      platforms: options.platforms,
      status: 'AWAITING_APPROVAL',
      pillar: result.pillar,
      mediaUrls: [],
      voiceCheck: result.voiceCheck,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saved = await saveCreatorPost(newPost);
    revalidatePath('/');
    return { success: true, post: saved };
  } catch (err: any) {
    console.error('Erro na geração de post:', err);
    return { error: err.message || 'Falha ao gerar post com IA.' };
  }
}

export async function publishScheduledDraftsAction() {
  const now = new Date().toISOString();
  const { getCreatorPosts } = await import('@/lib/db');
  const posts = await getCreatorPosts({ status: 'SCHEDULED' });
  const duePosts = posts.filter((p) => p.scheduledFor && p.scheduledFor <= now);

  let publishedCount = 0;
  for (const post of duePosts) {
    try {
      const res = await publishPostNowAction(post.id);
      if (res.success) publishedCount++;
    } catch (e: any) {
      console.error(`Erro ao publicar post agendado ${post.id}:`, e.message);
    }
  }

  return { publishedCount };
}

export async function rewritePostAction(text: string, instruction?: string, platform?: Platform | 'both'): Promise<{
  success: boolean;
  text: string;
  voiceCheck: any;
  error?: string;
}> {
  try {
    const voiceProfile = await getVoiceProfile();
    const res = await rewriteInVoice(text, voiceProfile, instruction, platform);
    return { success: true, text: res.text, voiceCheck: res.voiceCheck };
  } catch (err: any) {
    return {
      success: false,
      text: '',
      voiceCheck: { level: 'warn', items: [] },
      error: err.message || 'Falha ao reescrever no seu tom.',
    };
  }
}

export async function translatePostAction(params: TranslatePostParams): Promise<{
  success?: boolean;
  translated?: { text: string; thread: string[]; linkedinText?: string };
  error?: string;
}> {
  try {
    const translated = await translateAndLocalizePost(params);
    return { success: true, translated };
  } catch (err: any) {
    return { error: err.message || 'Falha ao traduzir post.' };
  }
}


// ==========================================
// IDEAS & TOPICS ACTIONS
// ==========================================

export async function saveIdeaAction(ideaData: Partial<PostIdea>) {
  try {
    const saved = await saveIdea(ideaData);
    revalidatePath('/');
    return { success: true, idea: saved };
  } catch (err: any) {
    return { error: err.message || 'Falha ao salvar ideia.' };
  }
}

export async function deleteIdeaAction(id: string) {
  try {
    await deleteIdea(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function generateIdeasWithAiAction(count = 5) {
  try {
    const voiceProfile = await getVoiceProfile();
    const facts = await getFacts();
    const references = await getReferences();
    const existingIdeas = await getIdeas();

    const existingTitles = existingIdeas.map((i) => i.title);

    const generated = await generateBrainstormIdeas(
      voiceProfile,
      facts,
      existingTitles,
      references,
      count
    );

    const savedIdeas: PostIdea[] = [];
    for (const item of generated) {
      const saved = await saveIdea({
        title: item.title,
        note: item.note,
        pillar: item.pillar,
        platforms: item.platforms || ['x', 'linkedin'],
        status: 'NEW',
      });
      savedIdeas.push(saved);
    }

    revalidatePath('/');
    return { success: true, ideas: savedIdeas };
  } catch (err: any) {
    console.error('Erro ao gerar ideias com IA:', err);
    return { error: err.message || 'Falha ao gerar ideias com IA.' };
  }
}

export async function generateTopicsAction(count = 5) {
  try {
    const voiceProfile = await getVoiceProfile();
    const generated = await generateTopicsForCreator(voiceProfile, count);

    const savedList: Topic[] = [];
    for (const t of generated) {
      const saved = await saveTopic({
        title: t.title,
        hook_angle: t.hook_angle,
        pillar: t.pillar,
        platforms: ['x', 'linkedin'],
      });
      savedList.push(saved);
    }

    revalidatePath('/');
    return { success: true, topics: savedList };
  } catch (err: any) {
    return { error: err.message || 'Falha ao sugerir novas pautas com IA.' };
  }
}

export async function saveTopicAction(topicData: Partial<Topic>) {
  try {
    const saved = await saveTopic(topicData);
    revalidatePath('/');
    return { success: true, topic: saved };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteTopicAction(id: string) {
  try {
    await deleteTopic(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==========================================
// FACTS & REFERENCES ACTIONS
// ==========================================

export async function saveFactAction(factData: Partial<Fact>) {
  try {
    const saved = await saveFact(factData);
    revalidatePath('/');
    return { success: true, fact: saved };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteFactAction(id: string) {
  try {
    await deleteFact(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function analyzeAndSaveReferenceAction(text: string, platform: Platform, url?: string, author?: string) {
  try {
    const analysis = await analyzeReferencePost(text, url);
    const saved = await saveReference({
      text,
      url: url || '',
      author: author || 'Autor de Referência',
      platform,
      hook_analysis: analysis.hook_analysis,
      structure: analysis.structure,
      reusable_template: analysis.reusable_template,
    });

    revalidatePath('/');
    return { success: true, reference: saved };
  } catch (err: any) {
    return { error: err.message || 'Falha ao analisar referência viral.' };
  }
}

export async function deleteReferenceAction(id: string) {
  try {
    await deleteReference(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

// ==========================================
// VOICE PROFILE & LEARNINGS ACTIONS
// ==========================================

export async function saveVoiceProfileAction(profileData: Partial<VoiceProfile>) {
  try {
    await saveVoiceProfile(profileData);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao salvar perfil de voz.' };
  }
}

export async function deleteAiLearningAction(id: string) {
  try {
    await deleteAiLearning(id);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function saveConnectionsAction(connections: Partial<ConnectionsConfig>) {
  try {
    await saveConnectionsConfig(connections);
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao salvar conexões.' };
  }
}

// ==========================================
// SMART POST SLOTS & SPRAY COMPOSER ACTIONS
// ==========================================

export async function getNextFreeSlotAction() {
  try {
    const slots = await getPostSlots();
    const allPosts = await getCreatorPosts();
    const takenDates = allPosts
      .filter((p) => p.status === 'SCHEDULED' && p.scheduledFor)
      .map((p) => p.scheduledFor as string);
    const slot = nextFreeSlot(slots, takenDates);
    return {
      success: true,
      iso: slot.toISOString(),
      formatted: formatScheduleDatePtBr(slot),
    };
  } catch (err: any) {
    return { error: err.message || 'Falha ao buscar próximo horário livre.' };
  }
}

export async function savePostSlotsAction(slots: string[]) {
  try {
    const saved = await savePostSlots(slots);
    revalidatePath('/');
    return { success: true, slots: saved };
  } catch (err: any) {
    return { error: err.message || 'Falha ao salvar horários de postagem.' };
  }
}

export async function uploadPostImageAction(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { error: 'Nenhum arquivo de imagem fornecido.' };
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${cleanName}`;

    const { error } = await supabase.storage
      .from('post_media')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true,
      });

    if (error) {
      return { error: error.message };
    }

    const { data: publicData } = supabase.storage
      .from('post_media')
      .getPublicUrl(fileName);

    return { success: true, url: publicData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Falha no upload da imagem.' };
  }
}

export async function listMediaAssetsAction(): Promise<{ success?: boolean; assets?: MediaAsset[]; error?: string }> {
  try {
    const { data, error } = await supabase.storage.from('post_media').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      return { error: error.message };
    }

    const assets: MediaAsset[] = (data || []).map((file) => {
      const { data: publicData } = supabase.storage.from('post_media').getPublicUrl(file.name);
      const mimetype = file.metadata?.mimetype || '';
      const isVideo = mimetype.startsWith('video/') || /\.(mp4|webm|mov|avi)$/i.test(file.name);
      const isImage = mimetype.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name);

      return {
        name: file.name,
        url: publicData.publicUrl,
        size: file.metadata?.size || 0,
        mimetype: mimetype || (isVideo ? 'video/mp4' : 'image/png'),
        created_at: file.created_at || new Date().toISOString(),
        type: isVideo ? 'video' : isImage ? 'image' : 'other',
      };
    });

    return { success: true, assets };
  } catch (err: any) {
    return { error: err.message || 'Falha ao listar arquivos de mídia.' };
  }
}

export async function deleteMediaAssetAction(name: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from('post_media').remove([name]);
    if (error) {
      return { error: error.message };
    }
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Falha ao excluir arquivo.' };
  }
}

export async function generateAiImageAction(params: GenerateAiImageParams): Promise<{
  success?: boolean;
  url?: string;
  prompt?: string;
  style?: AiVisualArchetype;
  error?: string;
}> {
  try {
    const { topicOrText, style = 'diagram', aspectRatio = '16:9', customPrompt } = params;
    if (!topicOrText && !customPrompt) {
      return { error: 'Informe um tema, rascunho de post ou prompt para gerar a imagem.' };
    }

    // 1. Gera ou utiliza o prompt de arte otimizado para o modelo FLUX
    const finalPrompt = customPrompt?.trim()
      ? customPrompt.trim()
      : await generateAiVisualPrompt(topicOrText, style);

    // 2. Determina dimensões ideais (16:9 para feeds amplos do X/LinkedIn ou 1:1 quadrado)
    const width = aspectRatio === '1:1' ? 1080 : 1200;
    const height = aspectRatio === '1:1' ? 1080 : 675;

    // 3. Requisita imagem de alta resolução ao motor FLUX
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=flux&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    const response = await fetch(fluxUrl, {
      headers: {
        'User-Agent': 'Createflow-Visual-Engine/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Falha no motor de imagem (HTTP ${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Salva a imagem gerada de forma persistente no bucket de mídia do Supabase
    const fileName = `ai_${Date.now()}_${style}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from('post_media')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Erro ao salvar no acervo de mídia: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage
      .from('post_media')
      .getPublicUrl(fileName);

    revalidatePath('/');

    return {
      success: true,
      url: publicData.publicUrl,
      prompt: finalPrompt,
      style,
    };
  } catch (err: any) {
    console.error('Erro ao gerar imagem com IA:', err);
    return { error: err.message || 'Falha ao gerar imagem com IA.' };
  }
}

export async function generateSprayPackageAction(theme: string, note: string = '') {
  try {
    const [voiceProfile, facts, references] = await Promise.all([
      getVoiceProfile(),
      getFacts(),
      getReferences(),
    ]);

    const spray = await generateSprayPackage(theme, note, voiceProfile, facts, references);
    return { success: true, spray };
  } catch (err: any) {
    console.error('Erro ao atomizar conteúdo (Spray):', err);
    return { error: err.message || 'Falha ao atomizar conteúdo.' };
  }
}

export async function saveSprayVariantsAction(
  variants: SprayVariant[],
  theme: string,
  autoSchedule: boolean = true
) {
  try {
    const slots = await getPostSlots();
    const allPosts = await getCreatorPosts();
    const takenDates: string[] = allPosts
      .filter((p) => p.status === 'SCHEDULED' && p.scheduledFor)
      .map((p) => p.scheduledFor as string);

    const createdPosts: CreatorPost[] = [];

    for (const v of variants) {
      let scheduledFor: string | undefined = undefined;
      let status: 'DRAFT' | 'SCHEDULED' = 'DRAFT';

      if (autoSchedule) {
        const slotDate = nextFreeSlot(slots, takenDates);
        scheduledFor = slotDate.toISOString();
        takenDates.push(scheduledFor); // Enfileira em slots consecutivos!
        status = 'SCHEDULED';
      }

      const isThread = v.type === 'x_thread' && Array.isArray(v.thread) && v.thread.length > 0;

      const saved = await saveCreatorPost({
        platforms: [v.platform],
        threadStyle: isThread ? 'thread' : 'single',
        pillar: theme,
        text: v.text,
        thread: isThread ? (v.thread || []) : [],
        linkedinText: v.platform === 'linkedin' ? (v.linkedinText || v.text) : undefined,
        status,
        scheduledFor,
        voiceCheck: { level: 'ok', items: [], samplesAnalyzed: 0 },
      });

      createdPosts.push(saved);
    }

    revalidatePath('/');
    return { success: true, count: createdPosts.length, posts: createdPosts };
  } catch (err: any) {
    console.error('Erro ao salvar variantes do Spray:', err);
    return { error: err.message || 'Falha ao salvar variantes atomizadas.' };
  }
}

// ==========================================
// BACKGROUND AUTO-DRAFTING PIPELINE
// ==========================================

export async function autoGenerateDraftsAction(count: number = 3) {
  try {
    const [voiceProfile, allIdeas, allTopics, allFacts, allReferences, slots, allPosts] =
      await Promise.all([
        getVoiceProfile(),
        getIdeas(),
        getTopics(),
        getFacts(),
        getReferences(),
        getPostSlots(),
        getCreatorPosts(),
      ]);

    // Busca ideias anotadas que ainda não viraram posts
    const availableIdeas = allIdeas.filter((i) => i.status !== 'DRAFTED');

    const createdPosts: CreatorPost[] = [];
    const isAutonomous = voiceProfile.auto_pilot_mode === 'autonomous';

    // Lista de datas já ocupadas para agendamento sequencial em slots
    const takenDates: string[] = allPosts
      .filter((p) => p.status === 'SCHEDULED' && p.scheduledFor)
      .map((p) => p.scheduledFor as string);

    for (let i = 0; i < count; i++) {
      let sourceType: 'idea' | 'topic' | 'reference' = 'idea';
      let sourceTitle = '';
      let sourceContent = '';
      let pillar = 'tech-insights';
      let ideaToUpdate: PostIdea | null = null;
      let platforms: Platform[] = ['x', 'linkedin'];

      if (availableIdeas.length > i) {
        const idea = availableIdeas[i];
        sourceType = 'idea';
        sourceTitle = idea.title;
        sourceContent = idea.note || '';
        platforms = idea.platforms || ['x', 'linkedin'];
        ideaToUpdate = idea;
      } else if (allTopics.length > i) {
        const topic = allTopics[i % allTopics.length];
        sourceType = 'topic';
        sourceTitle = topic.title;
        sourceContent = topic.hook_angle || '';
        pillar = topic.pillar || 'tech-insights';
      } else if (allReferences.length > 0) {
        const ref = allReferences[i % allReferences.length];
        sourceType = 'reference';
        sourceTitle = `Engenharia Reversa Viral (${ref.author || 'Referência'})`;
        sourceContent = ref.reusable_template || ref.text;
        platforms = [ref.platform];
      } else {
        sourceTitle = 'Decisão técnica e lição de arquitetura na prática';
        sourceContent = 'Otimizando gargalos reais e evitando complexidade acidental';
      }

      const generated = await generateCreatorPost({
        sourceType,
        sourceTitle,
        sourceContent,
        pillar,
        platforms,
        threadStyle: platforms.includes('x') && i % 2 === 1 ? 'thread' : 'single',
        voiceProfile,
        facts: allFacts,
        references: allReferences,
      });

      let status: 'AWAITING_APPROVAL' | 'SCHEDULED' = 'AWAITING_APPROVAL';
      let scheduledFor: string | undefined = undefined;

      // Se o criador estiver em modo 100% autônomo, já agenda direto no próximo Smart Slot
      if (isAutonomous) {
        const slotDate = nextFreeSlot(slots, takenDates);
        scheduledFor = slotDate.toISOString();
        takenDates.push(scheduledFor);
        status = 'SCHEDULED';
      }

      const isThread = generated.thread && generated.thread.length > 0;

      const saved = await saveCreatorPost({
        text: generated.text,
        thread: generated.thread || [],
        linkedinText: generated.linkedinText || null,
        threadStyle: isThread ? 'thread' : 'single',
        platforms: generated.suggestedPlatforms || platforms,
        status,
        pillar: generated.pillar,
        scheduledFor,
        ideaId: ideaToUpdate?.id || null,
        voiceCheck: generated.voiceCheck,
      });

      if (ideaToUpdate) {
        await saveIdea({
          ...ideaToUpdate,
          status: 'DRAFTED',
        });
      }

      createdPosts.push(saved);
    }

    revalidatePath('/');
    return {
      success: true,
      count: createdPosts.length,
      isAutonomous,
      posts: createdPosts,
    };
  } catch (err: any) {
    console.error('Erro na auto-geração de rascunhos da fila:', err);
    return { error: err.message || 'Falha ao auto-gerar rascunhos.' };
  }
}

// ==========================================
// SECURE DATA LOADER (CALLED ONLY AFTER AUTH)
// ==========================================

export async function loadDashboardDataAction() {
  try {
    const [
      posts,
      ideas,
      topics,
      facts,
      references,
      voiceProfile,
      learnings,
      connections,
    ] = await Promise.all([
      getCreatorPosts(),
      getIdeas(),
      getTopics(),
      getFacts(),
      getReferences(),
      getVoiceProfile(),
      getAiLearnings(),
      getConnectionsConfig(),
    ]);

    return {
      posts,
      ideas,
      topics,
      facts,
      references,
      voiceProfile,
      learnings,
      connections,
    };
  } catch (err: any) {
    console.error('Erro ao carregar dados do Dashboard:', err);
    throw new Error('Falha ao carregar dados protegidos.');
  }
}



