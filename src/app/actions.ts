'use server';

import { revalidatePath } from 'next/cache';
import {
  saveCreatorPost,
  deleteCreatorPost,
  getCreatorPostById,
  saveIdea,
  deleteIdea,
  saveTopic,
  deleteTopic,
  saveFact,
  deleteFact,
  saveReference,
  deleteReference,
  getVoiceProfile,
  saveVoiceProfile,
  addAiLearning,
  deleteAiLearning,
  getFacts,
  getConnectionsConfig,
  saveConnectionsConfig,
} from '@/lib/db';
import {
  generateCreatorPost,
  rewriteInVoice,
  checkVoiceClichés,
  generateTopicsForCreator,
  analyzeReferencePost,
} from '@/lib/ai-assistant';
import { publishToX, publishXThread } from '@/lib/twitter';
import { publishToLinkedIn } from '@/lib/linkedin';
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

    const voiceProfile = await getVoiceProfile();
    let finalScheduled = scheduledFor;

    // Se nenhuma data foi fornecida, calcula o próximo horário de slot do perfil
    if (!finalScheduled) {
      const now = new Date();
      now.setHours(now.getHours() + 2);
      finalScheduled = now.toISOString();
    }

    const updated = await saveCreatorPost({
      ...post,
      status: 'SCHEDULED',
      scheduledFor: finalScheduled,
      updated_at: new Date().toISOString(),
    });

    revalidatePath('/');
    return { success: true, post: updated };
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
}) {
  try {
    const voiceProfile = await getVoiceProfile();
    const facts = await getFacts();

    const result = await generateCreatorPost({
      ...options,
      voiceProfile,
      facts,
    });

    const newPost: Partial<CreatorPost> = {
      text: result.text,
      thread: result.thread,
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

export async function rewritePostAction(text: string, instruction?: string): Promise<{
  success: boolean;
  text: string;
  voiceCheck: any;
  error?: string;
}> {
  try {
    const voiceProfile = await getVoiceProfile();
    const res = await rewriteInVoice(text, voiceProfile, instruction);
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
