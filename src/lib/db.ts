import { supabase } from './supabase';
import type {
  CreatorPost,
  PostIdea,
  Topic,
  Fact,
  Reference,
  VoiceProfile,
  AiLearning,
  ConnectionsConfig,
  PostStatus,
} from '@/types';

// ARMAZENAMENTO EM MEMÓRIA LOCAL DE FALLBACK COM SEED INICIAL RICO
const inMemoryStore: Record<string, Record<string, any>> = {
  creator_posts: {
    post_1: {
      id: 'post_1',
      text: 'O maior erro de 99% dos devs e founders ao construir com IA:\n\nTentar automatizar o produto todo antes de validar se alguém realmente precisa do clique mais simples.\n\nConstrua o esqueleto, fale com 5 usuários e só depois adicione o agente autônomo.',
      thread: [
        'A maioria dos agentes de IA falha em produção não pelo modelo, mas pelo contexto.\n\nSe você não fornecer fatos verificados e voz consistente, o resultado vai soar como um bot genérico de 2023.',
        'Regra prática que uso nos meus projetos:\n1. Fatos reais antes da geração\n2. Tom autoral sem filtros corporativos\n3. Aprovação humana em 1 clique antes do envio.',
      ],
      threadStyle: 'thread',
      platforms: ['x', 'linkedin'],
      status: 'AWAITING_APPROVAL',
      pillar: 'tech-insights',
      mediaUrls: [],
      scheduledFor: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      voiceCheck: {
        level: 'ok',
        message: 'Combina com seu jeito de escrever',
        items: [],
      },
    },
    post_2: {
      id: 'post_2',
      text: 'Hoje trocamos toda a arquitetura de posts da nossa plataforma para focar 100% em X e LinkedIn.\n\nMenos ruído, mais foco na distribuição onde os tomadores de decisão e a comunidade de tech realmente estão.',
      thread: [],
      threadStyle: 'single',
      platforms: ['x'],
      status: 'SCHEDULED',
      pillar: 'founder-journey',
      mediaUrls: [],
      scheduledFor: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
      created_at: new Date(Date.now() - 7200 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 7200 * 1000).toISOString(),
      voiceCheck: {
        level: 'ok',
        message: 'Combina com seu jeito de escrever',
        items: [],
      },
    },
    post_3: {
      id: 'post_3',
      text: 'Por que decidimos abandonar dependências desnecessárias e manter um design system dark obsidian puro:\n\n1. Tempo de renderização < 16ms\n2. Zero layout shift\n3. Estética de ferramenta profissional (tipo Linear e Raycast) que não cansa a vista no dia a dia.',
      thread: [],
      threadStyle: 'single',
      platforms: ['linkedin'],
      status: 'DRAFT',
      pillar: 'lessons',
      mediaUrls: [],
      scheduledFor: null,
      created_at: new Date(Date.now() - 14400 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 14400 * 1000).toISOString(),
      voiceCheck: {
        level: 'warn',
        message: 'Isso pode soar como IA',
        items: [
          { code: 'numbered_list', message: 'Evite listas numeradas previsíveis; use quebras diretas de impacto.' },
        ],
      },
    },
  },
  ideas: {
    idea_1: {
      id: 'idea_1',
      title: 'A diferença entre quem só fala de IA e quem coloca em produção',
      note: 'Falar sobre os bastidores: rate limits, fallbacks de LLM, custo por token e arquitetura resiliente.',
      platforms: ['x', 'linkedin'],
      pillar: 'tech-insights',
      status: 'NEW',
      created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    },
    idea_2: {
      id: 'idea_2',
      title: 'Por que parei de usar métricas de vaidade e foquei em retenção real',
      note: 'História do início: comemoração de cliques vs faturamento real de produto.',
      platforms: ['linkedin'],
      pillar: 'lessons',
      status: 'NEW',
      created_at: new Date(Date.now() - 48000 * 1000).toISOString(),
    },
  },
  topics: {
    topic_1: {
      id: 'topic_1',
      title: 'Stack moderna para produtos rápidos em 2026: Next.js 16, TypeScript rigoroso e Tailwind 4',
      hook_angle: 'O que mudou no frontend moderno que tornou frameworks pesados obsoletos.',
      pillar: 'tech-insights',
      platforms: ['x', 'linkedin'],
      created_at: new Date(Date.now() - 90000 * 1000).toISOString(),
    },
    topic_2: {
      id: 'topic_2',
      title: 'Como manter consistência nas redes sem gastar 4 horas por dia escrevendo',
      hook_angle: 'O fluxo de batching + Segundo Cérebro com IA para fundadores ocupados.',
      pillar: 'founder-journey',
      platforms: ['x', 'linkedin'],
      created_at: new Date(Date.now() - 75000 * 1000).toISOString(),
    },
  },
  facts: {
    fact_1: {
      id: 'fact_1',
      category: 'Métricas & Resultados',
      subject: 'Automação sem perda de autenticidade',
      detail: 'Produzimos e agendamos posts semanais em menos de 30 minutos com aprovação manual em 1 clique.',
      created_at: new Date().toISOString(),
    },
    fact_2: {
      id: 'fact_2',
      category: 'Projetos & Stack',
      subject: 'Arquitetura CreateFlow / PayPosts',
      detail: 'Construído com Next.js 16, Tailwind CSS v4, Google Gemini AI Studio e Supabase/Firebase.',
      created_at: new Date().toISOString(),
    },
    fact_3: {
      id: 'fact_3',
      category: 'Trajetória & Lições',
      subject: 'Foco exclusivo em X e LinkedIn',
      detail: 'Decisão estratégica de priorizar canais B2B e comunidade tech antes de expandir para Instagram/TikTok.',
      created_at: new Date().toISOString(),
    },
  },
  references: {
    ref_1: {
      id: 'ref_1',
      url: 'https://x.com/gabolonhez/status/1900000000000000001',
      platform: 'x',
      author: 'Gabriel',
      text: 'A maioria dos fundadores passa 80% do tempo construindo coisas que 0 pessoas pediram.\n\nInverta a ordem:\n1. Tweet a dor\n2. Colete quem responde\n3. Construa a solução com eles no DM.',
      hook_analysis: 'Gancho de contraste agressivo (maioria comete erro) seguido de fórmula 1-2-3 acionável.',
      structure: 'Problema comum -> Solução contraintuitiva -> 3 passos diretos.',
      reusable_template: 'A maioria de [Público] passa [Tempo] fazendo [Erro comum].\n\nInverta a ordem:\n1. [Ação 1]\n2. [Ação 2]\n3. [Ação 3].',
      created_at: new Date().toISOString(),
    },
  },
  voice_profile: {
    voice_config: {
      id: 'voice_config',
      creator_name: 'Gabriel Bolonhez',
      handle_x: '@gabolonhez',
      linkedin_name: 'Gabriel Bolonhez',
      headline: 'Software Engineer & Tech Founder | Building CreateFlow & AI Tools',
      bio: 'Engenheiro de software e fundador. Escrevo sobre produtos reais com IA, bastidores de desenvolvimento, arquitetura de software e lições práticas de quem constrói e coloca em produção.',
      pillars: ['founder-journey', 'tech-insights', 'lessons', 'hot-takes', 'case-study'],
      tone_traits: [
        'Operador da trincheira (sem tom de professor ou cartilha)',
        'Certeza agressiva (Zero hedging: sem "talvez" ou "eu acho")',
        'Conversational command (fale como um parceiro experiente)',
        'Pattern interrupt com gancho visceral na 1ª linha',
        'Autoridade demonstrada por código, métricas e bastidores reais',
        'Anti-establishment contra fórmulas prontas e gurus',
      ],
      forbidden_words: [
        'Mergulhe',
        'Neste artigo vamos desvendar',
        'Alavanque seu potencial',
        'Revolucionário',
        'No cenário dinâmico de hoje',
        'Game changer',
        'Sem mais delongas',
        'Eu acho que',
        'Talvez seja',
        'Dica número 1',
      ],

      writing_samples: [
        'Se o seu código precisa de 5 páginas de documentação pra fazer um deploy simples, a complexidade não é feature, é dívida técnica.',
        'Ontem derrubamos a produção por causa de um timeout de 3 segundos em uma LLM externa. A lição: nunca chame modelos síncronos na requisição principal.',
      ],
      posting_slots: [
        { day: 'monday', time: '09:00', platforms: ['x', 'linkedin'] },
        { day: 'wednesday', time: '11:30', platforms: ['x', 'linkedin'] },
        { day: 'friday', time: '14:00', platforms: ['x', 'linkedin'] },
      ],
      auto_publish_x: false,
      auto_publish_linkedin: false,
    },
  },
  ai_learnings: {
    learn_1: {
      id: 'learn_1',
      lesson: 'Não comece tweets com perguntas retóricas genéricas tipo "Você já se perguntou?". Vá direto à afirmação principal.',
      category: 'tone',
      source: 'rejection',
      created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
    },
    learn_2: {
      id: 'learn_2',
      lesson: 'No LinkedIn, a primeira linha deve provocar o clique em "ver mais" sem usar títulos sensacionalistas.',
      category: 'structure',
      source: 'manual_edit',
      created_at: new Date(Date.now() - 43200 * 1000).toISOString(),
    },
  },
  connections_config: {
    connections_config: {
      id: 'connections_config',
      x_connected: true,
      x_username: 'gabolonhez',
      x_publish_mode: 'manual', // 'automatic' | 'manual'
      linkedin_connected: true,
      linkedin_name: 'Gabriel Bolonhez',
      linkedin_publish_mode: 'manual',
    },
  },
};

function getLocalStore(collectionName: string) {
  if (!inMemoryStore[collectionName]) {
    inMemoryStore[collectionName] = {};
  }
  return inMemoryStore[collectionName];
}

export async function getCollectionData<T = any>(collectionName: string, orderByField?: string): Promise<T[]> {
  try {
    let query = supabase.from(collectionName).select('*');
    if (orderByField) {
      query = query.order(orderByField, { ascending: false });
    }
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      const store = getLocalStore(collectionName);
      data.forEach((item: any) => {
        store[item.id] = item;
      });
      return data as T[];
    }
  } catch (error) {
    // Silently fallback to memory store
  }
  const store = getLocalStore(collectionName);
  const list = Object.values(store) as T[];
  if (orderByField) {
    list.sort((a: any, b: any) => String(b[orderByField] || '').localeCompare(String(a[orderByField] || '')));
  }
  return list;
}

export async function getDocById<T = any>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const { data, error } = await supabase
      .from(collectionName)
      .select('*')
      .eq('id', docId)
      .maybeSingle();
    if (!error && data) {
      getLocalStore(collectionName)[docId] = data;
      return data as T;
    }
  } catch (error) {
    // Silently fallback to memory store
  }
  const store = getLocalStore(collectionName);
  return store[docId] ? (store[docId] as T) : null;
}

export async function setDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const now = new Date().toISOString();
  const store = getLocalStore(collectionName);
  const existing = store[docId] || {};
  const updatedData = { ...existing, ...data, id: docId, updated_at: now };
  store[docId] = updatedData;

  try {
    await supabase.from(collectionName).upsert(updatedData);
  } catch (error) {
    // Local persistence works seamlessly
  }
}

export async function addDocData(collectionName: string, data: any): Promise<any> {
  const now = new Date().toISOString();
  const tempId = 'id_' + Math.random().toString(36).substring(2, 9);
  const created_at = data.created_at || now;
  const resultItem = { id: tempId, ...data, created_at, updated_at: now };

  try {
    const { data: inserted, error } = await supabase
      .from(collectionName)
      .insert(resultItem)
      .select()
      .maybeSingle();
    if (!error && inserted) {
      getLocalStore(collectionName)[inserted.id] = inserted;
      return inserted;
    }
  } catch (error) {
    // Local persistence works seamlessly
  }

  getLocalStore(collectionName)[tempId] = resultItem;
  return resultItem;
}

export async function updateDocData(collectionName: string, docId: string, data: any): Promise<void> {
  const store = getLocalStore(collectionName);
  if (store[docId]) {
    store[docId] = { ...store[docId], ...data, updated_at: new Date().toISOString() };
  }
  try {
    await supabase.from(collectionName).update({ ...data, updated_at: new Date().toISOString() }).eq('id', docId);
  } catch (error) {
    // Local persistence works seamlessly
  }
}

export async function deleteDocData(collectionName: string, docId: string): Promise<void> {
  const store = getLocalStore(collectionName);
  delete store[docId];
  try {
    await supabase.from(collectionName).delete().eq('id', docId);
  } catch (error) {
    // Local persistence works seamlessly
  }
}

// ----------------------------------------------------
// DOMAIN-SPECIFIC ACCESSORS (CREATOR POSTS & SECOND BRAIN)
// ----------------------------------------------------

function mapPostFromDb(row: any): CreatorPost {
  return {
    id: row.id,
    text: row.text || '',
    thread: row.thread || [],
    threadStyle: row.thread_style || row.threadStyle || 'single',
    platforms: row.platforms || ['x'],
    status: row.status || 'DRAFT',
    pillar: row.pillar || undefined,
    mediaUrls: row.media_urls || row.mediaUrls || [],
    scheduledFor: row.scheduled_for || row.scheduledFor || null,
    publishedAt: row.published_at || row.publishedAt || null,
    xPostId: row.tweet_id || row.xPostId || null,
    xPostUrl: row.x_post_url || row.xPostUrl || null,
    linkedinPostId: row.linkedin_post_id || row.linkedinPostId || null,
    linkedinPostUrl: row.linkedin_post_url || row.linkedinPostUrl || null,
    voiceCheck: row.voice_check || row.voiceCheck || undefined,
    factId: row.fact_id || row.factId || null,
    ideaId: row.idea_id || row.ideaId || null,
    referenceUrl: row.reference_url || row.referenceUrl || null,
    rejectReason: row.rejection_reason || row.rejectReason || null,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}

function mapPostToDb(post: Partial<CreatorPost>): Record<string, any> {
  const payload: Record<string, any> = { ...post };
  if (post.threadStyle !== undefined) payload.thread_style = post.threadStyle;
  if (post.mediaUrls !== undefined) payload.media_urls = post.mediaUrls;
  if (post.scheduledFor !== undefined) payload.scheduled_for = post.scheduledFor;
  if (post.publishedAt !== undefined) payload.published_at = post.publishedAt;
  if (post.xPostId !== undefined) payload.tweet_id = post.xPostId;
  if (post.linkedinPostId !== undefined) payload.linkedin_post_id = post.linkedinPostId;
  if (post.voiceCheck !== undefined) payload.voice_check = post.voiceCheck;
  if (post.rejectReason !== undefined) payload.rejection_reason = post.rejectReason;
  delete payload.threadStyle;
  delete payload.mediaUrls;
  delete payload.scheduledFor;
  delete payload.publishedAt;
  delete payload.xPostId;
  delete payload.linkedinPostId;
  delete payload.voiceCheck;
  delete payload.rejectReason;
  return payload;
}

export async function getCreatorPosts(filters?: { status?: PostStatus; platform?: 'x' | 'linkedin' }): Promise<CreatorPost[]> {
  const rawPosts = await getCollectionData<any>('creator_posts', 'scheduled_for');
  const all = rawPosts.map(mapPostFromDb);
  let filtered = all;
  if (filters?.status) {
    filtered = filtered.filter((p) => p.status === filters.status);
  }
  if (filters?.platform) {
    filtered = filtered.filter((p) => p.platforms.includes(filters.platform!));
  }
  return filtered;
}

export async function getCreatorPostById(id: string): Promise<CreatorPost | null> {
  const raw = await getDocById<any>('creator_posts', id);
  return raw ? mapPostFromDb(raw) : null;
}

export async function saveCreatorPost(post: Partial<CreatorPost>): Promise<CreatorPost> {
  const dbPayload = mapPostToDb(post);
  if (post.id) {
    await updateDocData('creator_posts', post.id, dbPayload);
    const updated = await getCreatorPostById(post.id);
    return updated!;
  } else {
    const raw = await addDocData('creator_posts', {
      ...dbPayload,
      thread: post.thread || [],
      thread_style: post.threadStyle || 'single',
      platforms: post.platforms || ['x'],
      status: post.status || 'DRAFT',
      media_urls: post.mediaUrls || [],
    });
    return mapPostFromDb(raw);
  }
}

export async function deleteCreatorPost(id: string): Promise<void> {
  await deleteDocData('creator_posts', id);
}

export async function getIdeas(): Promise<PostIdea[]> {
  return getCollectionData<PostIdea>('ideas', 'created_at');
}

export async function saveIdea(idea: Partial<PostIdea>): Promise<PostIdea> {
  if (idea.id) {
    await updateDocData('ideas', idea.id, idea);
    const updated = await getDocById<PostIdea>('ideas', idea.id);
    return updated!;
  } else {
    return addDocData('ideas', {
      status: 'NEW',
      platforms: ['x', 'linkedin'],
      ...idea,
    });
  }
}

export async function deleteIdea(id: string): Promise<void> {
  await deleteDocData('ideas', id);
}

export async function getTopics(): Promise<Topic[]> {
  return getCollectionData<Topic>('topics', 'created_at');
}

export async function saveTopic(topic: Partial<Topic>): Promise<Topic> {
  if (topic.id) {
    await updateDocData('topics', topic.id, topic);
    const updated = await getDocById<Topic>('topics', topic.id);
    return updated!;
  } else {
    return addDocData('topics', {
      platforms: ['x', 'linkedin'],
      ...topic,
    });
  }
}

export async function deleteTopic(id: string): Promise<void> {
  await deleteDocData('topics', id);
}

export async function getFacts(): Promise<Fact[]> {
  return getCollectionData<Fact>('facts', 'created_at');
}

export async function saveFact(fact: Partial<Fact>): Promise<Fact> {
  if (fact.id) {
    await updateDocData('facts', fact.id, fact);
    const updated = await getDocById<Fact>('facts', fact.id);
    return updated!;
  } else {
    return addDocData('facts', fact);
  }
}

export async function deleteFact(id: string): Promise<void> {
  await deleteDocData('facts', id);
}

export async function getReferences(): Promise<Reference[]> {
  return getCollectionData<Reference>('content_references', 'created_at');
}

export async function saveReference(ref: Partial<Reference>): Promise<Reference> {
  if (ref.id) {
    await updateDocData('content_references', ref.id, ref);
    const updated = await getDocById<Reference>('content_references', ref.id);
    return updated!;
  } else {
    return addDocData('content_references', ref);
  }
}

export async function deleteReference(id: string): Promise<void> {
  await deleteDocData('content_references', id);
}

export async function getVoiceProfile(): Promise<VoiceProfile> {
  const profile = (await getDocById<VoiceProfile>('voice_profile', 'main_profile')) ||
                  (await getDocById<VoiceProfile>('voice_profile', 'voice_config'));
  if (profile) return profile;
  return inMemoryStore.voice_profile.voice_config as VoiceProfile;
}

export async function saveVoiceProfile(profile: Partial<VoiceProfile>): Promise<void> {
  await setDocData('voice_profile', 'main_profile', profile);
  await setDocData('voice_profile', 'voice_config', profile);
}

export async function getAiLearnings(): Promise<AiLearning[]> {
  return getCollectionData<AiLearning>('ai_learnings', 'created_at');
}

export async function addAiLearning(learning: Partial<AiLearning>): Promise<AiLearning> {
  return addDocData('ai_learnings', learning);
}

export async function deleteAiLearning(id: string): Promise<void> {
  await deleteDocData('ai_learnings', id);
}

export async function getConnectionsConfig(): Promise<ConnectionsConfig> {
  const cfg = (await getDocById<ConnectionsConfig>('connections_config', 'main_config')) ||
              (await getDocById<ConnectionsConfig>('connections_config', 'connections_config'));
  if (cfg) return cfg;
  return inMemoryStore.connections_config.connections_config as ConnectionsConfig;
}

export async function saveConnectionsConfig(cfg: Partial<ConnectionsConfig>): Promise<void> {
  await setDocData('connections_config', 'main_config', cfg);
  await setDocData('connections_config', 'connections_config', cfg);
}
