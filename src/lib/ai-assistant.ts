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
  references?: Reference[];
}

export interface GeneratedPostResult {
  text: string;
  thread: string[];
  linkedinText?: string;
  pillar: string;
  voiceCheck: VoiceCheck;
  suggestedPlatforms: Platform[];
  reasoning?: string;
}

/**
 * Builds the AI prompt context grounding the model on the creator's real voice, real facts,
 * and high-performing benchmark reference structures.
 */
function buildSystemInstruction(
  voiceProfile: VoiceProfile,
  facts: Fact[],
  references: Reference[] = []
): string {
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

  const benchmarkSection = references.length > 0
    ? `\n7. BENCHMARKS E FORMATOS COMPROVADOS (ESTRUTURAS DE ALTA PERFORMANCE):
Modele a cadência, o gancho e a escaneabilidade dos seguintes formatos reais que performaram com alto engajamento (NUNCA copie o assunto ou texto, use apenas a engenharia reversa do formato):
${references.slice(0, 4).map((r, i) => `[Referência ${i + 1} - ${r.platform.toUpperCase()} por ${r.author || 'Autor'}]:
Gancho: ${r.hook_analysis || 'Gancho de contraste/tensão imediata'}
Estrutura: ${r.structure || 'Problema -> Quebra de padrão -> Solução'}
Texto Exemplo:
"""
${r.text.slice(0, 320)}...
"""`).join('\n\n')}`
    : '';

  return `Você é o ghostwriter e estrategista autoral de elite de ${voiceProfile.creator_name || 'Gabriel'}.
Sua missão é operar sob o ELITE X GHOSTWRITING SYSTEM v3.0, produzindo conteúdo autêntico, de autoridade inquestionável e alto engajamento no X (Twitter) e LinkedIn.

======================================================================
ELITE X GHOSTWRITING SYSTEM v3.0 — CORE IDENTITY & PRINCIPLES
======================================================================
1. CORE IDENTITY: OPERADOR DA TRINCHEIRA (OPERATOR, NÃO EDUCATOR)
   - Escreva como um OPERADOR que quebrou a cabeça e colocou em produção, NÃO como um professor lendo um livro didático.
   - Zero energia de iniciante. Transmita domínio conquistado com repetições, bugs reais, falhas superadas e vitórias técnicas.
   - Autoridade demonstrada por resultados, bastidores e provas específicas (código, métricas, arquitetura), NUNCA teoria vazia.

2. CALIBRAÇÃO DE TOM: CERTEZA AGRESSIVA & ZERO HEDGING
   - ZERO HEDGING: É PROIBIDO usar palavras de dúvida ("talvez", "eu acho", "pode ser que", "na minha humilde opinião"). Afirme com convicção e clareza cirúrgica.
   - CONVERSATIONAL COMMAND: Escreva como uma mensagem direta para um colega experiente que respeita sua liderança técnica.
   - ANTI-ESTABLISHMENT: Desafie o senso comum preguiçoso de gurus, fórmulas mágicas e conselhos clichês com a realidade crua de quem constrói.
   - PATTERN INTERRUPT: O gancho da primeira linha DEVE quebrar o scroll do feed imediatamente.

3. DIRETRIZES ANTI-IA & ANTI-SLOP:
   - ZERO CLICHÊS DE IA: Banido usar aberturas artificiais ("Você já parou para pensar...", "No cenário dinâmico de hoje...", "Descubra como...").
   - PALAVRAS E EXPRESSÕES BANIDAS: ${forbiddenWords}.

4. GROUNDING FACTUAL (ZERO ALUCINAÇÃO):
   - Use como verdade inegociável os seguintes fatos reais do autor:
${factsList}

5. TOM DE VOZ E AMOSTRAS REAIS:
   - Traços: ${toneTraits}
   - Amostras de estilo:
${samples}

6. ESPECIFICAÇÕES CRÍTICAS DE PLATAFORMA (FORMATOS E TAMANHOS SÃO DISTINTOS):
   - NO X (TWITTER):
     * Limite rígido: estritamente < 280 caracteres por tweet.
     * Gancho imediato e seco na 1ª linha (pattern interrupt sem enrolação).
     * Se for Fio (Thread): Tweet 1 vende o clique no fio; tweets 2+ trazem dados, decisões e bastidores; tweet final sintetiza a regra prática.
   - NO LINKEDIN:
     * TAMANHO IDEAL: 800 a 1.800 caracteres (150 a 350 palavras). NUNCA gere posts curtos de 200 caracteres para o LinkedIn!
     * Primeiras 2 linhas (~140 caracteres): Gancho com alta tensão dramática/técnica desenhado para forçar o clique em "...ver mais".
     * Parágrafos curtos de 1 a 2 linhas com espaçamento visual (linha em branco dupla entre parágrafos) para escaneabilidade mobile.
     * Desenvolvimento profundo de narrativa: o problema real, o que quebrou na prática, métricas antes vs depois, a decisão difícil tomada.
     * Marcadores limpos (• ou 1-2-3) para os aprendizados centrais, sem tom de cartilha.
     * Proibido jargões corporativos vazios ("Muito feliz em anunciar", "Parabéns ao time", "Gratidão").
     * Zero hashtags no meio das frases (no máximo 2 ou 3 no final).${benchmarkSection}`;

}

/**
 * Generates an authentic post for X and/or LinkedIn with platform-specific lengths and structures
 */
export async function generateCreatorPost(opts: GeneratePostOptions): Promise<GeneratedPostResult> {
  const systemInstruction = buildSystemInstruction(opts.voiceProfile, opts.facts, opts.references || []);

  const isLinkedIn = opts.platforms.includes('linkedin');
  const isX = opts.platforms.includes('x');
  const isBoth = isLinkedIn && isX;

  let platformInstructions = '';
  if (isBoth) {
    platformInstructions = `ATENÇÃO: O post é para AMBAS AS REDES (X e LinkedIn). Como elas têm tamanhos e formatos completamente diferentes:
- Gere "text" para o X: tweet conciso com gancho visceral, ESTRITAMENTE menor que 280 caracteres.
- Se for Thread, gere "thread" com tweets adicionais (< 280 chars cada). Se post único, "thread" deve ser [].
- Gere "linkedinText" para o LinkedIn: post completo, profundo e narrativo (800 a 1.800 caracteres), com as primeiras 2 linhas forçando o clique em "...ver mais", parágrafos curtos de 1 a 2 linhas com respiro visual, bastidores técnicos/lições e fechamento de autoridade.`;
  } else if (isLinkedIn) {
    platformInstructions = `ATENÇÃO: O post é EXCLUSIVO PARA LINKEDIN:
- Gere o post em formato longo e profundo (800 a 1.800 caracteres).
- Primeiras 2 linhas devem forçar o clique em "...ver mais".
- Parágrafos curtos de 1 a 2 linhas com respiro visual.
- Coloque esse post completo tanto em "text" quanto em "linkedinText". "thread" deve ser [].`;
  } else {
    platformInstructions = `ATENÇÃO: O post é EXCLUSIVO PARA O X (TWITTER):
- "text" deve ser estritamente menor que 280 caracteres com gancho imediato na 1ª linha.
- Se for Thread, preencha "thread" com os tweets seguintes (< 280 chars cada).
- "linkedinText" deve ser null.`;
  }

  const prompt = `Gere uma publicação pronta para postar baseada nos seguintes parâmetros:
- Tipo de Origem: ${opts.sourceType}
- Tema/Título da Fonte: ${opts.sourceTitle || 'Insight do dia a dia'}
- Anotação/Conteúdo: ${opts.sourceContent || 'Sem anotações prévias'}
- Pilar de Conteúdo: ${opts.pillar || 'tech-insights'}
- Plataformas Alvo: ${opts.platforms.join(', ')}
- Formato X: ${opts.threadStyle === 'thread' ? `Fio (Thread) com ${opts.threadLength || 3} tweets adicionais` : 'Post único (< 280 chars)'}
- Instrução Adicional do Autor: ${opts.instruction || 'Mantenha o tom visceral, prático e focado em execução de operador.'}

${platformInstructions}

Retorne um JSON estrito no seguinte formato:
{
  "text": "Primeiro tweet no X (< 280 chars) ou o post completo se for exclusivo para LinkedIn",
  "thread": ["tweet 2", "tweet 3..."] ou [],
  "linkedinText": "Texto completo, profundo e formatado para o LinkedIn (800 a 1.800 caracteres) ou null se for só X",
  "pillar": "${opts.pillar || 'tech-insights'}",
  "reasoning": "Breve justificativa estratégica de 1 linha sobre a escolha do gancho e formato"
}`;

  const res = await generateJson<{
    text: string;
    thread: string[];
    linkedinText?: string | null;
    pillar: string;
    reasoning?: string;
  }>(prompt, systemInstruction);

  // If exclusively LinkedIn, ensure linkedinText has the full post
  const finalLinkedinText = isLinkedIn ? (res.linkedinText || res.text) : undefined;
  const primaryText = (!isX && isLinkedIn) ? (res.linkedinText || res.text) : res.text;

  // Run immediate voice check on the generated post (network-aware)
  const voiceCheck = await checkVoiceClichés(
    isX ? primaryText : (finalLinkedinText || primaryText),
    opts.voiceProfile,
    isX ? 'x' : 'linkedin'
  );

  return {
    text: primaryText,
    thread: Array.isArray(res.thread) ? res.thread : [],
    linkedinText: finalLinkedinText || undefined,
    pillar: res.pillar || opts.pillar || 'tech-insights',
    voiceCheck,
    suggestedPlatforms: opts.platforms,
    reasoning: res.reasoning,
  };
}

/**
 * Checks text against AI clichés, forbidden words, and founder voice principles
 */
export async function checkVoiceClichés(
  text: string,
  voiceProfile: VoiceProfile,
  platform?: Platform | 'both'
): Promise<VoiceCheck> {
  const items: { code: string; message: string }[] = [];
  const lower = text.toLowerCase().trim();

  // Check forbidden words
  if (voiceProfile.forbidden_words) {
    for (const forbidden of voiceProfile.forbidden_words) {
      if (forbidden && lower.includes(forbidden.toLowerCase())) {
        items.push({
          code: 'forbidden_word',
          message: `Contém a palavra proibida: "${forbidden}".`,
        });
      }
    }
  }

  // Check hedging (hesitação e fraqueza de convicção)
  const hedgingPhrases = [
    'eu acho que',
    'talvez seja',
    'pode ser que',
    'na minha humilde opinião',
    'acredito que talvez',
    'não tenho certeza, mas',
  ];

  for (const h of hedgingPhrases) {
    if (lower.includes(h)) {
      items.push({
        code: 'hedging_detected',
        message: `Hesitação detectada ("${h}"). No X, use Certeza Agressiva: afirme sua tese sem meias-palavras.`,
      });
      break;
    }
  }

  // Check educator/didactic tone (cartilha didática)
  const educatorPhrases = [
    'neste post você vai aprender',
    'aqui estão 5 lições',
    'dica número 1',
    'dica 1:',
    'siga este passo a passo',
  ];

  for (const ep of educatorPhrases) {
    if (lower.includes(ep)) {
      items.push({
        code: 'educator_tone',
        message: `Tom didático de cartilha ("${ep}"). Escreva como um Operador de trincheira com provas práticas.`,
      });
      break;
    }
  }

  // Check cliché openings


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

  // Check tweet length ONLY if for X
  if (platform !== 'linkedin') {
    const firstParagraph = text.split('\n\n')[0] || text;
    if (firstParagraph.length > 280) {
      items.push({
        code: 'x_length_warning',
        message: `Primeiro bloco tem ${firstParagraph.length} caracteres (limite do tweet comum no X é 280).`,
      });
    }
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
  instruction?: string,
  platform?: Platform | 'both'
): Promise<{ text: string; voiceCheck: VoiceCheck }> {
  const systemInstruction = buildSystemInstruction(voiceProfile, []);

  const prompt = `Reescreva o seguinte rascunho de post para que ele soe 100% autêntico, humano e alinhado com o estilo do autor.
Elimine qualquer traço de linguagem corporativa ou 'ChatGPT-like'.

Plataforma Alvo: ${platform === 'linkedin' ? 'LinkedIn (post completo de 800 a 1.800 caracteres com gancho em 2 linhas para "...ver mais" e respiro visual)' : platform === 'x' ? 'X / Twitter (< 280 caracteres)' : 'X e/ou LinkedIn'}
Instrução específica: ${instruction || (platform === 'linkedin' ? 'Formate como post de autoridade para LinkedIn: 800 a 1.500 caracteres, gancho forte nas primeiras 2 linhas para "...ver mais", parágrafos curtos de 1-2 linhas e lições acionáveis.' : 'Deixe mais direto, com gancho afiado e parágrafos curtos.')}

RASCUNHO ATUAL:
"""
${text}
"""

Retorne um JSON estrito no seguinte formato:
{
  "rewritten_text": "O texto reescrito completo pronto para publicar"
}`;

  const res = await generateJson<{ rewritten_text: string }>(prompt, systemInstruction);
  const voiceCheck = await checkVoiceClichés(res.rewritten_text, voiceProfile, platform);

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

/**
 * Brainstorms fresh, high-impact post ideas grounded on the creator's profile,
 * real facts, references, and existing idea backlog (avoiding duplicates).
 */
export async function generateBrainstormIdeas(
  voiceProfile: VoiceProfile,
  facts: Fact[],
  existingTitles: string[],
  references: Reference[] = [],
  count = 5
): Promise<{ title: string; note: string; pillar: string; platforms: Platform[] }[]> {
  const systemInstruction = buildSystemInstruction(voiceProfile, facts);

  const existingSample = existingTitles.slice(0, 40).map((t) => `- ${t}`).join('\n');
  const refSample = references.slice(0, 5).map((r) => `- [${r.platform}] ${r.text.slice(0, 100)}...`).join('\n');

  const prompt = `Você é o estrategista de conteúdo autoral de ${voiceProfile.creator_name || 'Gabriel Bolonhez'}.
Gere ${count} NOVAS ideias de publicações de alto impacto para o X (Twitter) e LinkedIn.

DIRETRIZES FUNDAMENTAIS:
1. MENTALIDADE: Operador técnico / founder na trincheira (sem clichês de livro ou tom didático de professor).
2. NUNCA REPITA TEMAS: Analise o que o autor já possui anotado e gere ângulos inéditos, contrários (hot takes) ou aprofundamentos práticos:
${existingSample || 'Nenhum tema prévio.'}

3. REFERÊNCIAS ESTRUTURAIS:
${refSample || 'Foco em ganchos viscerais e valor acionável.'}

4. DIVERSIFIQUE OS PILARES:
- 'tech-insights' (arquitetura, IA em produção, engenharia de software, código limpo sem enrolação)
- 'founder-journey' (produtos reais, métricas, lições de startups, decisões de produto)
- 'career-lessons' (consistência, soft skills em tech, rotina de estudos, vulnerabilidade real)

Retorne estritamente um JSON no seguinte formato:
{
  "ideas": [
    {
      "title": "Gancho central ou título provocativo e direto",
      "note": "Contexto acionável do post, qual a tese principal e o payoff para quem ler",
      "pillar": "tech-insights",
      "platforms": ["x", "linkedin"]
    }
  ]
}`;

  const res = await generateJson<{
    ideas: { title: string; note: string; pillar: string; platforms: Platform[] }[];
  }>(prompt, systemInstruction);

  return res.ideas || [];
}
