import { generateJson, generateText } from './gemini';
import type { VoiceProfile, Fact, Reference, VoiceCheck, Platform, ThreadStyle } from '@/types';

export interface GeneratePostOptions {
  sourceType: 'idea' | 'topic' | 'fact' | 'reference' | 'scratch';
  sourceTitle?: string;
  sourceContent?: string;
  pillar?: string;
  platforms: Platform[];
  threadStyle?: ThreadStyle;
  threadLength?: number;
  instruction?: string;
  voiceProfile: VoiceProfile;
  facts: Fact[];
}

export interface GeneratedPostResult {
  text: string;
  thread: string[];
  pillar: string;
  voiceCheck: VoiceCheck;
  suggestedPlatforms: Platform[];
}

/**
 * Builds the AI prompt context grounding the model on the creator's real voice and real facts.
 */
function buildSystemInstruction(voiceProfile: VoiceProfile, facts: Fact[]): string {
  const factsList = facts.length > 0
    ? facts.map((f) => `- [${f.category}] ${f.subject}: ${f.detail}`).join('\n')
    : 'Nenhum fato cadastrado ainda. Use honestidade e nunca invente números, clientes ou métricas falsas.';

  const forbiddenWords = voiceProfile.forbidden_words?.length > 0
    ? voiceProfile.forbidden_words.join(', ')
    : 'Neste artigo vamos desvendar, Mergulhe, Alavanque, Revolucionário, Game changer, No mundo de hoje';

  const toneTraits = voiceProfile.tone_traits?.length > 0
    ? voiceProfile.tone_traits.join(', ')
    : 'Direto, opinativo, sem enrolação, vulnerável com erros reais, técnico e acionável';

  const samples = voiceProfile.writing_samples?.length > 0
    ? voiceProfile.writing_samples.map((s, i) => `Amostra ${i + 1}:\n"${s}"`).join('\n\n')
    : 'Escreva como um engenheiro experiente conversando diretamente com outro profissional.';

  return `Você é o ghostwriter e estrategista autoral de elite de ${voiceProfile.creator_name || 'Gabriel'}.
Sua missão é escrever posts autênticos, de alto impacto e com densidade de valor para o X (Twitter) e LinkedIn.

DIRETRIZES FUNDAMENTAIS (ANTI-SLOP & ANTI-IA):
1. ZERO CLICHÊS DE IA: É ESTRITAMENTE PROIBIDO usar introduções genéricas ("Você já parou para pensar...", "No cenário dinâmico atual...", "Seja bem-vindo a...").
2. PALAVRAS E EXPRESSÕES BANIDAS (NUNCA USE): ${forbiddenWords}.
3. GROUNDING FACTUAL (NUNCA ALUCINE FATOS): Use como verdade e base os seguintes fatos reais do autor:
${factsList}

4. TOM DE VOZ AUTORAL:
${toneTraits}

5. AMOSTRAS DE ESTILO REAL DO AUTOR:
${samples}

6. ESPECIFICAÇÕES DE FORMATO:
- Para o X (Twitter): Gancho imediato na 1ª linha. Tweets concisos (< 280 caracteres por tweet). Se for fio (thread), cada tweet deve ter valor independente e manter o leitor engajado até o tweet final.
- Para o LinkedIn: Primeiras 2 linhas pensadas para prender antes do botão "...ver mais". Espaçamento limpo (parágrafos curtos de 1 a 2 linhas), sem poluição visual. Sem excesso de hashtags (máximo 2 a 3 no final).`;
}

/**
 * Generates an authentic post for X and/or LinkedIn
 */
export async function generateCreatorPost(opts: GeneratePostOptions): Promise<GeneratedPostResult> {
  const systemInstruction = buildSystemInstruction(opts.voiceProfile, opts.facts);

  const prompt = `Gere uma publicação pronta para postar baseada nos seguintes parâmetros:
- Tipo de Origem: ${opts.sourceType}
- Tema/Título da Fonte: ${opts.sourceTitle || 'Insight do dia a dia'}
- Anotação/Conteúdo: ${opts.sourceContent || 'Sem anotações prévias'}
- Pilar de Conteúdo: ${opts.pillar || 'tech-insights'}
- Plataformas Alvo: ${opts.platforms.join(', ')}
- Formato: ${opts.threadStyle === 'thread' ? `Fio (Thread) com ${opts.threadLength || 3} tweets adicionais` : 'Post único'}
- Instrução Adicional do Autor: ${opts.instruction || 'Mantenha o tom visceral, prático e focado em execução.'}

Retorne um JSON estrito no seguinte formato:
{
  "text": "O texto principal do post (primeiro tweet no X ou post completo no LinkedIn)",
  "thread": ["tweet 2 se for thread", "tweet 3 se for thread..."] ou [] se for post único,
  "pillar": "${opts.pillar || 'tech-insights'}",
  "reasoning": "Breve justificativa estratégica de 1 linha sobre a escolha do gancho"
}`;

  const res = await generateJson<{
    text: string;
    thread: string[];
    pillar: string;
  }>(prompt, systemInstruction);

  // Run immediate voice check on the generated post
  const voiceCheck = await checkVoiceClichés(res.text, opts.voiceProfile);

  return {
    text: res.text,
    thread: Array.isArray(res.thread) ? res.thread : [],
    pillar: res.pillar || opts.pillar || 'tech-insights',
    voiceCheck,
    suggestedPlatforms: opts.platforms,
  };
}

/**
 * Checks text against AI clichés, forbidden words, and founder voice principles
 */
export async function checkVoiceClichés(text: string, voiceProfile: VoiceProfile): Promise<VoiceCheck> {
  const items: { code: string; message: string }[] = [];

  // Check forbidden words
  if (voiceProfile.forbidden_words) {
    for (const forbidden of voiceProfile.forbidden_words) {
      if (forbidden && text.toLowerCase().includes(forbidden.toLowerCase())) {
        items.push({
          code: 'forbidden_word',
          message: `Contém a palavra proibida: "${forbidden}".`,
        });
      }
    }
  }

  // Check cliché openings
  const lower = text.toLowerCase().trim();
  const cliches = [
    'você já se perguntou',
    'no mundo de hoje',
    'no cenário atual',
    'muito se fala sobre',
    'neste artigo',
    'vamos desvendar',
    'prepare-se para',
    'descubra como',
  ];

  for (const c of cliches) {
    if (lower.startsWith(c) || lower.includes(c)) {
      items.push({
        code: 'cliche_opening',
        message: `Abertura clichê detectada ("${c}"). Vá direto à tese.`,
      });
      break;
    }
  }

  // Check emoji spam
  const emojiRegex = /[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = text.match(emojiRegex);
  if (emojis && emojis.length > 4) {
    items.push({
      code: 'emoji_spam',
      message: `Muitos emojis (${emojis.length}). Posts de autoridade em tech usam no máximo 1 ou 2.`,
    });
  }

  // Check tweet length if for X
  const firstParagraph = text.split('\n\n')[0] || text;
  if (firstParagraph.length > 280) {
    items.push({
      code: 'x_length_warning',
      message: `Primeiro bloco tem ${firstParagraph.length} caracteres (limite do tweet comum é 280).`,
    });
  }

  if (items.length > 0) {
    return {
      level: 'warn',
      message: 'Isso pode soar como IA ou violar suas regras de tom.',
      items,
      samplesAnalyzed: voiceProfile.writing_samples?.length || 0,
    };
  }

  return {
    level: 'ok',
    message: 'Combina perfeitamente com seu jeito de escrever',
    items: [],
    samplesAnalyzed: voiceProfile.writing_samples?.length || 0,
  };
}

/**
 * Rewrites a draft to fit the user's authentic tone and fixes detected voice warnings
 */
export async function rewriteInVoice(
  text: string,
  voiceProfile: VoiceProfile,
  instruction?: string
): Promise<{ text: string; voiceCheck: VoiceCheck }> {
  const systemInstruction = buildSystemInstruction(voiceProfile, []);

  const prompt = `Reescreva o seguinte rascunho de post para que ele soe 100% autêntico, humano e alinhado com o estilo do autor.
Elimine qualquer traço de linguagem corporativa ou 'ChatGPT-like'.

Instrução específica: ${instruction || 'Deixe mais direto, com gancho afiado e parágrafos curtos.'}

RASCUNHO ATUAL:
"""
${text}
"""

Retorne um JSON estrito no seguinte formato:
{
  "rewritten_text": "O texto reescrito completo pronto para publicar"
}`;

  const res = await generateJson<{ rewritten_text: string }>(prompt, systemInstruction);
  const voiceCheck = await checkVoiceClichés(res.rewritten_text, voiceProfile);

  return {
    text: res.rewritten_text,
    voiceCheck,
  };
}

/**
 * Generates provocative topic angles for founders and tech creators
 */
export async function generateTopicsForCreator(
  voiceProfile: VoiceProfile,
  count = 5
): Promise<{ title: string; hook_angle: string; pillar: string }[]> {
  const systemInstruction = `Você é um estrategista de conteúdo para fundadores e engenheiros de software no X e LinkedIn.
O perfil do criador é:
- Nome: ${voiceProfile.creator_name}
- Headline: ${voiceProfile.headline}
- Bio: ${voiceProfile.bio}
- Pilares: ${voiceProfile.pillars?.join(', ')}

Sua tarefa é sugerir ${count} pautas (topics) contra-intuitivas, de bastidores reais, erros cometidos, decisões técnicas e lições de mercado.
Evite temas clichês como '5 dicas para programar melhor'. Foque em tópicos que gerem discussão construtiva entre profissionais experientes.`;

  const prompt = `Gere ${count} pautas altamente relevantes. Retorne um JSON no formato:
{
  "topics": [
    {
      "title": "Título conciso da pauta",
      "hook_angle": "O ângulo ou contradição provocativa que desperta a curiosidade",
      "pillar": "tech-insights" | "founder-journey" | "lessons" | "hot-takes" | "case-study"
    }
  ]
}`;

  const res = await generateJson<{
    topics: { title: string; hook_angle: string; pillar: string }[];
  }>(prompt, systemInstruction);

  return res.topics || [];
}

/**
 * Deconstructs a viral reference post into Hook, Structure and Reusable Template
 */
export async function analyzeReferencePost(
  text: string,
  url?: string
): Promise<{
  hook_analysis: string;
  structure: string;
  reusable_template: string;
}> {
  const systemInstruction = `Você é um especialista em engenharia reversa de posts de alta performance no X e LinkedIn.
Desmonte o post enviado pelo usuário identificando a fórmula estrutural que o fez funcionar.`;

  const prompt = `Analise o seguinte post:
"""
${text}
"""

Retorne um JSON com:
{
  "hook_analysis": "Por que a 1ª frase funciona, qual o gatilho psicológico",
  "structure": "A anatomia passo a passo (ex: Gancho -> Quebra de expectativa -> Dados -> Lição prática)",
  "reusable_template": "O template reescrito com placeholders entre colchetes como [Desafio], [Número], [Aprendizado]"
}`;

  return generateJson<{
    hook_analysis: string;
    structure: string;
    reusable_template: string;
  }>(prompt, systemInstruction);
}
