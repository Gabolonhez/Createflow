import { generateJson, generateText } from './gemini';
import type {
  VoiceProfile,
  Fact,
  Reference,
  VoiceCheck,
  Platform,
  ThreadStyle,
  SprayResult,
  SprayVariant,
  AiVisualArchetype,
} from '@/types';

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
   - PATTERN INTERRUPT: O gancho da primeira linha DEVE quebrar o scroll do feed imediatamente em menos de 6 a 8 palavras.

3. META-PADRÃO DE GANCHOS NUCLEARES (THE NUCLEAR HOOK BLUEPRINT)
   Todo gancho de elite segue a progressão:
   [Crença universal do mercado] → [Inversão agressiva imediata] → [Prova hiper-específica] → [Tensão/curiosidade não resolvida]

   FORMULAS CHAVE DE GANCHO:
   - Fórmula 1 (Mathematical Contradiction):
     "Todo mundo dizendo que [Opção A] é mais barata que [Opção B].
      Vamos fazer a conta real em produção:
      [Opção A]: $X upfront + falha oculta = $Total doloroso
      [Opção B]: $Y simples + alta confiabilidade = $Total enxuto
      [Inversão contraintuitiva]."
   - Fórmula 2 (Transformation Arc / The B-Roll Breakthrough):
     "[Número ruim] → [Número excelente] em [Tempo curto].
      [Multiplicador exato, ex: 23x] mais rápido/eficiente trocando [Ação complexa] por [Ajuste ridiculamente simples].
      A maioria passa meses complicando quando a resposta era 1 linha de código."
   - Fórmula 3 (Operator Speed Arbitrage):
     "Enquanto o mercado/agências passam 14 dias debatendo [Burocracia],
      meu setup de 1 dev colocou [MVP/Feature] em produção em 9 horas.
      Velocidade de iteração em produção > 40 páginas de documentação."
   - Fórmula 4 (Values Warfare / Divisão Tribal 50-50):
     "A sua stack técnica não é 'moderna' se o seu primeiro usuário espera 8 segundos para carregar uma tela.
      Se você precisa de [Complexidade excessiva] antes de ter [Clientes reais], você não tem arquitetura enterprise.
      Você só tem medo de vender."
   - Fórmula 5 (Accidental Genius / Production Discovery):
     "Achávamos que o motivo de [Problema] era a falta de [Feature complexa].
      Removemos [Atrito simples] e a métrica saltou [X%] na mesma tarde.
      Lição dolorosa de quem opera: nunca adicione mais interface para resolver problema de atrito."

4. ARQUITETURA DE CONTEÚDO (REGRA 40/30/20/10):
   - 40% Authority Builders: Segredos de arquitetura, testes reais de carga, exploits de algoritmo, números exatos de produção.
   - 30% Problem Agitators: Custos ocultos que o leitor está sangrando sem saber, ansiedade de status técnica, fricção despercebida.
   - 20% Success Demonstrations: Estudos de caso rápidos com métricas antes vs depois e prazos específicos.
   - 10% Direct Response: Chamadas claras para ação ("Comente X e te envio o setup", "Se você quer implementar isso, me chame na DM").

5. ERGONOMIA VISUAL E REGRAS ANTI-SLOP (STACCATO RHYTHM):
   - RITMO EM STACCATO: Quebras visuais de linha a cada 1 a 3 linhas (espaçamento com linha em branco dupla). NUNCA crie blocos densos de texto!
   - NÚMEROS HIPER-ESPECÍFICOS: NUNCA use "muitos", "vários" ou "bastante". Use sempre números exatos: "18ms", "23x", "94 testes", "48%".
   - ZERO FALSA HUMILDADE: Banido usar "gratidão", "muito feliz em anunciar", "humildemente", "abençoado".
   - PALAVRAS E EXPRESSÕES BANIDAS: ${forbiddenWords}.

6. GROUNDING FACTUAL (ZERO ALUCINAÇÃO):
   - Use como verdade inegociável os seguintes fatos reais do autor:
${factsList}

7. TOM DE VOZ E AMOSTRAS REAIS:
   - Traços: ${toneTraits}
   - Amostras de estilo:
${samples}

8. ESPECIFICAÇÕES CRÍTICAS DE PLATAFORMA:
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
     * Proibido jargões corporativos vazios. Zero hashtags no meio das frases (no máximo 2 ou 3 no final).${benchmarkSection}`;

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

  // Check fake humility / corporate cringe
  const fakeHumility = [
    'gratidão',
    'muito feliz em anunciar',
    'honrado em compartilhar',
    'abençoado',
    'humildemente',
    'orgulho em fazer parte',
  ];

  for (const fh of fakeHumility) {
    if (lower.includes(fh)) {
      items.push({
        code: 'fake_humility',
        message: `Falsa modéstia ou clichê corporativo ("${fh}"). No Elite Ghostwriting, transmita autoridade direta sem bajulação.`,
      });
      break;
    }
  }

  // Check weak closing questions (perguntas engajamento fracas)
  const weakClosings = [
    'o que você acha?',
    'concorda?',
    'e você, concorda?',
    'qual a sua opinião?',
    'deixe nos comentários o que achou',
  ];

  for (const wc of weakClosings) {
    if (lower.includes(wc)) {
      items.push({
        code: 'weak_closing',
        message: `Encerramento com pergunta fraca ("${wc}"). Finalize com uma afirmação de impacto ou CTA direto.`,
      });
      break;
    }
  }

  // Check vague numbers (falta de especificidade)
  const vagueNumbers = [
    'muitos desenvolvedores',
    'vários desenvolvedores',
    'muitos usuários',
    'várias empresas',
    'bastante tempo',
  ];

  for (const vn of vagueNumbers) {
    if (lower.includes(vn)) {
      items.push({
        code: 'vague_number',
        message: `Termo vago detectado ("${vn}"). Substitua por métricas ou dados hiper-específicos (ex: "87% dos devs", "14 horas", "94 testes").`,
      });
      break;
    }
  }

  // Check wall of text (parágrafos excessivamente longos sem respiro staccato)
  const paragraphs = text.split('\n\n');
  for (const p of paragraphs) {
    const lines = p.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length > 4 || p.length > 380) {
      items.push({
        code: 'wall_of_text',
        message: `Parágrafo longo detectado (${p.length} chars). Quebre em blocos de 1 a 3 linhas para ritmo em staccato e escaneabilidade mobile.`,
      });
      break;
    }
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

/**
 * Atomizes (Spray) a single insight/idea into 3 complementary formats:
 * 1. Hot Take / Contrarian Tweet (< 280 chars) for X
 * 2. Behind-the-scenes Thread (3-4 tweets) for X
 * 3. Deep Dive Narrative post (800-1500 chars) for LinkedIn
 */
export async function generateSprayPackage(
  theme: string,
  note: string,
  voiceProfile: VoiceProfile,
  facts: Fact[],
  references: Reference[] = []
): Promise<SprayResult> {
  const systemInstruction = buildSystemInstruction(voiceProfile, facts, references);

  const prompt = `Você é o estrategista de conteúdo autoral de ${voiceProfile.creator_name || 'Gabriel Bolonhez'}.
Sua missão é realizar um DISPARO DE ATOMIZAÇÃO (SPRAY): transformar o seguinte insight/ideia em TRÊS publicações complementares, cada uma explorando um ângulo e formato diferente:

TEMA CENTRAL: "${theme}"
ANOTAÇÃO/DETALHE: "${note || 'Sem anotações prévias'}"

GERAÇÃO DOS 3 FORMATOS:
1. "x_contrarian": Um tweet provocativo e seco no X (< 280 caracteres). Ataca o senso comum ou um erro clássico do mercado com convicção agressiva de operador.
2. "x_thread": Um fio (thread) técnico no X composto por 1 tweet de gancho (< 280 chars) + 2 tweets adicionais (< 280 chars cada) dissecando os bastidores práticos e o passo a passo de como fazer.
3. "linkedin_deep_dive": Um post narrativo profundo no LinkedIn (800 a 1.500 caracteres). Primeiras 2 linhas com gancho forte para forçar o clique em "...ver mais", parágrafos curtos de 1 a 2 linhas com respiro visual, lições acionáveis em marcadores limpos e encerramento de autoridade (zero clichês de IA ou corporativos).

Retorne estritamente um JSON no seguinte formato:
{
  "theme": "${theme}",
  "variants": [
    {
      "type": "x_contrarian",
      "title": "Hot Take Provocativo",
      "badge": "X (Tweet Único)",
      "platform": "x",
      "text": "Tweet completo menor que 280 caracteres"
    },
    {
      "type": "x_thread",
      "title": "Thread Técnica de Bastidores",
      "badge": "X (Fio Completo)",
      "platform": "x",
      "text": "Primeiro tweet do fio (< 280 chars)",
      "thread": ["Tweet 2 (< 280 chars)", "Tweet 3 (< 280 chars)"]
    },
    {
      "type": "linkedin_deep_dive",
      "title": "Deep Dive & Estudo de Caso",
      "badge": "LinkedIn (Narrativo)",
      "platform": "linkedin",
      "text": "Post completo do LinkedIn (800 a 1.500 caracteres com quebras de linha duplas)",
      "linkedinText": "O mesmo post completo do LinkedIn"
    }
  ]
}`;

  const res = await generateJson<SprayResult>(prompt, systemInstruction);
  return {
    theme: res.theme || theme,
    sourceNote: note,
    variants: Array.isArray(res.variants) ? res.variants : [],
  };
}

/**
 * Transforms a creator's post text or topic into a high-converting, anti-slop visual prompt for FLUX.
 * Specifically tuned for tech founders, software engineers, and operators on LinkedIn and X.
 */
export async function generateAiVisualPrompt(
  topicOrText: string,
  style: AiVisualArchetype = 'diagram'
): Promise<string> {
  const archetypeGuides: Record<AiVisualArchetype, string> = {
    diagram: 'High-level system architecture and data flow diagram, glowing nodes, microservice boxes, database cylinders, message queue pipelines, connected by sleek laser vectors on dark obsidian canvas (#0a0a0c), Linear and Vercel aesthetic, no text labels, clean isometric or 2D technical diagram.',
    minimal: 'Minimalist high-tech product visual, dark obsidian glass card (#0a0a0c) floating in dark void, soft ambient edge glow in electric cyan and violet, 1px subtle borders, ultra clean typography aesthetic, Dieter Rams meets Apple HIG, no text errors.',
    metrics: 'Dark mode analytics visualization and performance chart, glowing telemetry line showing massive latency drop or throughput hockey-stick growth, dark matte background, futuristic telemetry dashboard feel, clean vector style, no garbled text.',
    terminal: 'Sleek modern developer terminal and code editor window floating in space, dark charcoal glassmorphism window, subtle neon syntax highlighting accents, glowing cursor, minimal clean IDE mockup, no blurry text.',
    concept: 'Abstract 3D technological metaphor, dark obsidian geometric prisms, refracting laser beam, crystalline silicon wafers, clean metallic reflections, high contrast dark mode wallpaper aesthetic, ultra crisp 8k render.'
  };

  const styleGuide = archetypeGuides[style] || archetypeGuides.diagram;

  const systemInstruction = `You are a world-class visual art director designing viral technical visuals for software engineers, tech founders, and CTOs on LinkedIn and X (Twitter).
Your task is to convert the user's post content into a precise, high-aesthetic FLUX image generation prompt in English.

CRITICAL ANTI-SLOP RULES:
- NEVER output generic smiling 3D Pixar/cartoon people, generic business handshakes, or robot android heads.
- NEVER request legible small text or words inside the image (AI image generators garble text). Specify "no text, abstract geometric nodes and sleek iconography only".
- COLOR PALETTE: Obsidian dark (#0a0a0c, #121216), dark graphite, with accents of electric violet (#8b5cf6), cyan (#06b6d4), or emerald (#10b981).
- FORMAT: Output ONLY the final prompt in English as a single cohesive paragraph (40-80 words). No markdown formatting, no conversational filler.`;

  const prompt = `Post Content / Topic:
"${topicOrText}"

Desired Archetype: ${style.toUpperCase()}
Archetype Description: ${styleGuide}

Create the ultimate English visual prompt for FLUX to accompany this post:`;

  try {
    const visualPrompt = await generateText(prompt, systemInstruction);
    return visualPrompt.trim().replace(/^["']|["']$/g, '');
  } catch (err: any) {
    // Robust fallback if Gemini encounters rate limit
    return `Minimalist dark mode technical illustration about ${topicOrText.slice(0, 80)}, dark obsidian background (#0a0a0c), glowing geometric nodes, laser lines, Linear and Raycast aesthetic, high contrast, clean vector render, no text.`;
  }
}

