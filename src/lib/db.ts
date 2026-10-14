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
  Platform,
  DmCampaign,
  DmLog,
  TrackedLinkItem,
  SocialConversation,
  SocialMessage,
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
      author: 'Gabriel Bolonhez',
      text: 'A maioria dos fundadores passa 80% do tempo construindo coisas que 0 pessoas pediram.\n\nInverta a ordem:\n1. Tweet a dor\n2. Colete quem responde\n3. Construa a solução com eles no DM.',
      hook_analysis: 'Gancho de contraste agressivo (maioria comete erro) seguido de fórmula 1-2-3 acionável.',
      structure: 'Problema comum -> Solução contraintuitiva -> 3 passos diretos.',
      reusable_template: 'A maioria de [Público] passa [Tempo] fazendo [Erro comum].\n\nInverta a ordem:\n1. [Ação 1]\n2. [Ação 2]\n3. [Ação 3].',
      created_at: new Date().toISOString(),
    },
    ref_elite_math_contradiction: {
      id: 'ref_elite_math_contradiction',
      url: 'https://x.com/gabolonhez/status/elite_math_contradiction',
      platform: 'x',
      author: 'Elite Blueprint v3.0 (Mathematical Contradiction)',
      text: 'todo mundo dizendo que construir com IA é mais barato do que contratar um dev sênior\n\nvamos fazer a conta real em produção:\n\nsolução com wrappers de IA:\n$200/mês de assinatura\n1 em 38 fluxos quebra com timeout silencioso\n= 42 horas de debug caótico por mês\n\nengenharia enxuta de verdade:\nNext.js puro + Postgres bem modelado\nzero alucinação\n= 0 horas de bombeiro apagando fogo\n\no barato sai caro quando você automatiza o que nem validou',
      hook_analysis: 'Mathematical Contradiction: Destrói a crença de custo aparente com uma conta simples de bastidores.',
      structure: 'Crença popular -> Desafio ("vamos fazer a conta real") -> Cálculo A vs Cálculo B -> Inversão contraintuitiva.',
      reusable_template: 'Todo mundo dizendo que [Opção A] é [Vantagem aparente] do que [Opção B].\n\nVamos fazer a conta real em produção:\n\n[Opção A]:\n[Métrica de custo 1]\n[Taxa de falha oculta]\n= [Custo real doloroso]\n\n[Opção B]:\n[Métrica simples]\n[Confiabilidade]\n= [Resultado limpo]\n\n[Lição contraintuitiva].',
      created_at: new Date().toISOString(),
    },
    ref_elite_transformation_arc: {
      id: 'ref_elite_transformation_arc',
      url: 'https://x.com/gabolonhez/status/elite_transformation_arc',
      platform: 'x',
      author: 'Elite Blueprint v3.0 (Transformation Arc)',
      text: 'de 420 ms para 18 ms de latência em 48 horas\n\n23x mais rápido trocando 3 chamadas síncronas de LLM por uma fila assíncrona simples com Redis\n\na maioria dos times passa 3 meses querendo mudar de framework quando o gargalo era só 1 await no lugar errado',
      hook_analysis: 'Transformation Arc: [Número ruim] → [Número excelente] em [Prazo curto] por causa de [1 ajuste ridículo].',
      structure: 'Métrica antes -> Métrica depois em X horas/dias -> Multiplicador exato (23x) -> Ação ridiculamente simples -> Ataque à complicação excessiva.',
      reusable_template: 'De [Métrica ruim] para [Métrica excelente] em [Tempo curto].\n\n[Multiplicador exato, ex: 14x] mais [Resultado] trocando [Ação complexa/errada] por [Ajuste ridiculamente simples].\n\nA maioria passa [Tempo longo] [Complicando], quando o segredo era apenas [Ação direta].',
      created_at: new Date().toISOString(),
    },
    ref_elite_speed_arbitrage: {
      id: 'ref_elite_speed_arbitrage',
      url: 'https://x.com/gabolonhez/status/elite_speed_arbitrage',
      platform: 'x',
      author: 'Elite Blueprint v3.0 (Speed Arbitrage)',
      text: 'enquanto a maioria das agências e times gasta 14 dias debatendo design system no figma\n\nmeu setup de 1 dev com Next.js e Tailwind subiu o MVP completo, com auth e stripe, em 9 horas\n\nvelocidade de iteração em produção > 40 páginas de documentação que ninguém vai ler',
      hook_analysis: 'Operator Speed Arbitrage: Contrasta a lentidão e burocracia do mercado com a velocidade brutal de um operador enxuto.',
      structure: 'Enquanto o mercado faz [Processo lento/burocrático] -> O operador faz [Resultado concreto] em [Horas] -> Lição de autoridade.',
      reusable_template: 'Enquanto [Público/Mercado] gasta [Tempo longo] fazendo [Burocracia/Reuniões],\n\nMeu setup de [Equipe pequena/Operador] colocou [Resultado em produção] em [Poucas horas/dias].\n\n[Verdade crua sobre execução vs teoria].',
      created_at: new Date().toISOString(),
    },
    ref_elite_values_warfare: {
      id: 'ref_elite_values_warfare',
      url: 'https://x.com/gabolonhez/status/elite_values_warfare',
      platform: 'x',
      author: 'Elite Blueprint v3.0 (Values Warfare)',
      text: 'a sua stack técnica não é "moderna" se o seu primeiro usuário leva 8 segundos para carregar uma página\n\nse o seu produto precisa de 12 microserviços antes de ter 10 clientes pagantes, você não tem arquitetura enterprise\n\nvocê só tem medo de vender',
      hook_analysis: 'Values Warfare: Desafia agressivamente o conceito de sucesso/qualidade do público e divide opiniões 50/50.',
      structure: 'Redefinição agressiva do termo -> Desafio de critérios 1-2 -> Conclusão visceral de choque de realidade.',
      reusable_template: 'O seu [Elemento/Projeto] não é [Elogio/Status] se [Sintoma real negativo].\n\nSe você precisa de [Complexidade desnecessária] antes de ter [Resultado básico],\n\nVocê não tem [Termo sofisticado]. Você só tem [Verdade crua que ninguém tem coragem de falar].',
      created_at: new Date().toISOString(),
    },
    ref_elite_accidental_discovery: {
      id: 'ref_elite_accidental_discovery',
      url: 'https://linkedin.com/in/gabolonhez/detail/recent-activity/elite_accidental_discovery',
      platform: 'linkedin',
      author: 'Elite Blueprint v3.0 (Accidental Discovery)',
      text: 'achamos que o motivo dos usuários abandonarem o onboarding era a falta de um tour guiado\n\nremovemos 4 campos opcionais do formulário e a conversão saltou 31% na mesma tarde\n\nlição dolorosa de quem constrói: nunca adicione mais interface para resolver um problema de atrito',
      hook_analysis: 'Accidental Discovery: Revela a suposição errada da equipe e a simplicidade extrema da solução real que funcionou.',
      structure: 'Suposição errada do time -> Ação de subtração simples -> Métrica exata de resultado (31%) -> Lição de ouro.',
      reusable_template: 'Achamos que o motivo de [Problema] era a falta de [Solução complexa].\n\nFizemos [Ação de subtração/simplificação] e [Métrica exata de melhora] em [Pouco tempo].\n\nLição de quem opera na prática: [Princípio imutável].',
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
      x_publish_mode: 'manual',
      linkedin_connected: true,
      linkedin_name: 'Gabriel Bolonhez',
      linkedin_publish_mode: 'manual',
      instagram_connected: true,
      instagram_username: 'gabolonhez',
      tiktok_connected: true,
      tiktok_username: 'gabolonhez',
    },
  },
  dm_campaigns: {
    camp_1: {
      id: 'camp_1',
      name: 'Guia de Agentes de IA 2026',
      platform: 'instagram',
      accountId: 'ig_gabolonhez',
      accountUsername: 'gabolonhez',
      postId: 'ig_post_101',
      postUrl: 'https://instagram.com/p/C7x9A1bL90',
      postThumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80',
      scope: 'specific',
      keywords: ['AGENTE', 'GUIA', 'IA'],
      matchType: 'exact',
      dmTriggerEnabled: true,
      dmMessage: 'Fala {username}! Aqui está o Guia Completo de Arquitetura de Agentes de IA que prometi. Toque no botão abaixo para acessar.',
      dmMessages: [
        'Fala {username}! Aqui está o Guia Completo de Arquitetura de Agentes de IA que prometi. Toque no botão abaixo para acessar.',
        'Opa {username}! Conforme prometido no Reels, aqui está o material sobre Agentes em produção.',
      ],
      openingDmEnabled: true,
      openingDmMessage: 'Oi {username}! Quer desbloquear o material direto no navegador?',
      openingDmButtonLabel: 'Sim, me manda! 🚀',
      cardImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
      cardTitle: 'Guia Definitivo: Agentes de IA',
      cardSubtitle: 'Aprenda a construir LLMs em produção sem alucinação e com baixa latência.',
      linkButtonLabel: 'Acessar Guia Gratuito',
      targetUrl: 'https://createflow.ai/docs/agentes-2026',
      secondaryButtonLabel: 'Comunidade Discord',
      secondaryTargetUrl: 'https://discord.gg/createflow',
      requireFollow: true,
      followPromptMessage: 'Ei {username}! Para receber o link, siga @gabolonhez e toque em "Já segui" abaixo!',
      followPromptButtonLabel: 'Já segui ✅',
      followUpEnabled: true,
      followUpMessage: 'E aí {username}, conseguiu abrir o guia? Qualquer dúvida na implementação me dá um toque aqui!',
      followUpDelayMinutes: 15,
      publicReplyEnabled: true,
      publicReplyMessages: [
        'Te mandei no direct! 🚀',
        'Acabei de enviar, confere suas mensagens! ✨',
        'Enviado com sucesso! Dá uma olhada na DM 📩',
      ],
      isActive: true,
      dmsSentCount: 384,
      clicksCount: 112,
      ctr: 29.1,
      createdAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    camp_2: {
      id: 'camp_2',
      name: 'Viral Hooks TikTok (Ebook)',
      platform: 'tiktok',
      accountId: 'tt_gabolonhez',
      accountUsername: 'gabolonhez',
      scope: 'any',
      keywords: ['VIRAL', 'HOOK', 'CREATOR'],
      matchType: 'contains',
      dmTriggerEnabled: true,
      dmMessage: 'Oi {username}! Te mandei a lista dos 50 Hooks de Alta Retenção para TikTok & Reels. Baixe abaixo!',
      dmMessages: ['Oi {username}! Te mandei a lista dos 50 Hooks de Alta Retenção para TikTok & Reels.'],
      openingDmEnabled: false,
      cardTitle: 'Planilha de Hooks Virais',
      cardSubtitle: 'Testados em mais de 10M de visualizações orgânicas.',
      linkButtonLabel: 'Baixar Planilha',
      targetUrl: 'https://createflow.ai/resources/hooks',
      requireFollow: false,
      followUpEnabled: false,
      followUpDelayMinutes: 0,
      publicReplyEnabled: true,
      publicReplyMessages: [
        'Direct enviado! 🔥',
        'Mandei lá no chat! 📱',
        'Prontinho, confere a DM! 💡',
      ],
      isActive: true,
      dmsSentCount: 148,
      clicksCount: 47,
      ctr: 31.7,
      createdAt: new Date(Date.now() - 86400 * 1000 * 5).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    camp_3: {
      id: 'camp_3',
      name: 'Próximo Reels: Template Next.js 16',
      platform: 'instagram',
      accountId: 'ig_gabolonhez',
      accountUsername: 'gabolonhez',
      scope: 'next',
      keywords: ['NEXT', 'REPO', 'BOILERPLATE'],
      matchType: 'exact',
      dmTriggerEnabled: false,
      dmMessage: 'Fala {username}! Aqui está o repositório do starter kit Next.js 16 com Tailwind v4 e Supabase.',
      dmMessages: ['Fala {username}! Aqui está o repositório do starter kit Next.js 16.'],
      openingDmEnabled: false,
      cardTitle: 'Starter Kit Next.js 16',
      cardSubtitle: 'Repositório GitHub limpo e pronto para produção.',
      linkButtonLabel: 'Ver no GitHub',
      targetUrl: 'https://github.com/gabolonhez/createflow-starter',
      requireFollow: true,
      followPromptMessage: 'Fala {username}! Segue o perfil para liberar o repo open-source!',
      followPromptButtonLabel: 'Já segui 🔓',
      followUpEnabled: false,
      followUpDelayMinutes: 0,
      publicReplyEnabled: true,
      publicReplyMessages: ['Mandei o link no direct! 🚀', 'Confere seu direct, link enviado! ✨'],
      isActive: true,
      dmsSentCount: 89,
      clicksCount: 34,
      ctr: 38.2,
      createdAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  dm_logs: {
    log_1: {
      id: 'log_1',
      campaignId: 'camp_1',
      campaignName: 'Guia de Agentes de IA 2026',
      platform: 'instagram',
      commenterId: 'c_user_401',
      commenterUsername: 'lucas_tech',
      commentText: 'Quero muito esse GUIA, parabens pelo conteudo',
      status: 'SENT',
      publicReplySent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    },
    log_2: {
      id: 'log_2',
      campaignId: 'camp_2',
      campaignName: 'Viral Hooks TikTok (Ebook)',
      platform: 'tiktok',
      commenterId: 'tt_user_802',
      commenterUsername: 'marina.creator',
      commentText: 'VIRAL por favor manda',
      status: 'SENT',
      publicReplySent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    log_3: {
      id: 'log_3',
      campaignId: 'camp_1',
      campaignName: 'Guia de Agentes de IA 2026',
      platform: 'instagram',
      commenterId: 'c_user_402',
      commenterUsername: 'andre_devops',
      commentText: 'manda o guia irmao',
      status: 'SENT',
      publicReplySent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    },
    log_4: {
      id: 'log_4',
      campaignId: 'camp_1',
      campaignName: 'Guia de Agentes de IA 2026',
      platform: 'instagram',
      commenterId: 'c_user_403',
      commenterUsername: 'camila_ai',
      commentText: 'AGENTE',
      status: 'SKIPPED_WINDOW',
      errorMessage: 'Usuário com privacidade de mensagens fechada para contas não seguidas',
      publicReplySent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    },
    log_5: {
      id: 'log_5',
      campaignId: 'camp_2',
      campaignName: 'Viral Hooks TikTok (Ebook)',
      platform: 'tiktok',
      commenterId: 'tt_user_803',
      commenterUsername: 'felipe_marketing',
      commentText: 'HOOK quero testar no meu perfil',
      status: 'SENT',
      publicReplySent: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    },
  },
  tracked_links: {
    trk_1: {
      id: 'trk_1',
      campaignId: 'camp_1',
      campaignName: 'Guia de Agentes de IA 2026',
      platform: 'instagram',
      label: 'Guia Agentes 2026',
      destinationUrl: 'https://createflow.ai/docs/agentes-2026',
      shortSlug: 'cf-agt26',
      shortUrl: 'https://createflow.io/r/cf-agt26',
      clicks: 112,
      uniqueClicks: 94,
      ctr: 29.1,
      createdAt: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
    },
    trk_2: {
      id: 'trk_2',
      campaignId: 'camp_2',
      campaignName: 'Viral Hooks TikTok (Ebook)',
      platform: 'tiktok',
      label: 'Planilha Hooks Virais',
      destinationUrl: 'https://createflow.ai/resources/hooks',
      shortSlug: 'cf-hooks',
      shortUrl: 'https://createflow.io/r/cf-hooks',
      clicks: 47,
      uniqueClicks: 42,
      ctr: 31.7,
      createdAt: new Date(Date.now() - 86400 * 1000 * 5).toISOString(),
    },
    trk_3: {
      id: 'trk_3',
      campaignId: 'camp_3',
      campaignName: 'Próximo Reels: Template Next.js 16',
      platform: 'instagram',
      label: 'GitHub Starter Kit',
      destinationUrl: 'https://github.com/gabolonhez/createflow-starter',
      shortSlug: 'cf-next16',
      shortUrl: 'https://createflow.io/r/cf-next16',
      clicks: 34,
      uniqueClicks: 31,
      ctr: 38.2,
      createdAt: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
    },
  },
  social_conversations: {
    conv_1: {
      id: 'conv_1',
      platform: 'instagram',
      participantId: 'user_lucas',
      participantUsername: 'lucas_tech',
      participantName: 'Lucas Ferreira',
      participantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      lastMessageText: 'Caraca mano, o guia de agentes ficou sensacional! Valeu!',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      unreadCount: 1,
      isWindowOpen: true,
      windowExpiresInHours: 23,
      messages: [
        {
          id: 'm1',
          sender: 'me',
          text: 'Fala @lucas_tech! Aqui está o Guia Completo de Arquitetura de Agentes de IA que prometi. Toque no botão abaixo para acessar.',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: 'm2',
          sender: 'user',
          text: 'Caraca mano, o guia de agentes ficou sensacional! Valeu!',
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        },
      ],
    },
    conv_2: {
      id: 'conv_2',
      platform: 'tiktok',
      participantId: 'user_marina',
      participantUsername: 'marina.creator',
      participantName: 'Marina Bastos',
      participantAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
      lastMessageText: 'Tem algum exemplo de hook para nicho de finanças?',
      lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      unreadCount: 0,
      isWindowOpen: true,
      windowExpiresInHours: 21,
      messages: [
        {
          id: 'm3',
          sender: 'me',
          text: 'Oi @marina.creator! Te mandei a lista dos 50 Hooks de Alta Retenção para TikTok & Reels. Baixe abaixo!',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        },
        {
          id: 'm4',
          sender: 'user',
          text: 'Tem algum exemplo de hook para nicho de finanças?',
          timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        },
      ],
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
    const { error } = await supabase.from(collectionName).upsert(updatedData);
    if (error && error.code === 'PGRST204' && collectionName === 'connections_config') {
      // Fallback: PostgREST schema cache does not have linkedin_client_id/secret columns yet.
      // Save known core columns without crashing.
      const safeData = {
        id: 'main_config',
        x_connected: updatedData.x_connected ?? true,
        x_username: updatedData.x_username ?? 'gabolonhez',
        x_publish_mode: updatedData.x_publish_mode ?? 'manual',
        x_bearer_token: updatedData.x_bearer_token ?? null,
        linkedin_connected: updatedData.linkedin_connected ?? false,
        linkedin_name: updatedData.linkedin_name ?? 'Gabriel Bolonhez',
        linkedin_profile_id: updatedData.linkedin_profile_id ?? null,
        linkedin_access_token: updatedData.linkedin_access_token ?? null,
        linkedin_publish_mode: updatedData.linkedin_publish_mode ?? 'manual',
        updated_at: now,
      };
      await supabase.from(collectionName).upsert(safeData);
    }
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
    linkedinText: row.linkedin_text || row.linkedinText || (row.voice_check?.linkedin_text) || null,
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
  if (post.rejectReason !== undefined) payload.rejection_reason = post.rejectReason;

  // Persist linkedinText safely inside voice_check to avoid crashing if linkedin_text column is not yet migrated in Postgres
  if (post.linkedinText !== undefined || post.voiceCheck !== undefined) {
    const vc: Record<string, any> = { ...(post.voiceCheck || {}) };
    if (post.linkedinText !== undefined) {
      vc.linkedin_text = post.linkedinText;
    }
    payload.voice_check = vc;
  }

  delete payload.threadStyle;
  delete payload.mediaUrls;
  delete payload.scheduledFor;
  delete payload.publishedAt;
  delete payload.xPostId;
  delete payload.linkedinPostId;
  delete payload.linkedinText;
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
  const facts = await getCollectionData<Fact>('facts', 'created_at');
  return facts.filter((f: any) => f.category !== 'system');
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

function mapReferenceFromDb(row: any): Reference {
  const metrics = row.metrics || {};
  return {
    id: row.id,
    url: row.url || metrics.url || '',
    platform: (row.platform || 'x') as Platform,
    author: row.author || 'Desconhecido',
    text: row.text || row.original_text || '',
    hook_analysis: row.hook_analysis || metrics.hook_analysis || undefined,
    structure: row.structure || metrics.structure || undefined,
    reusable_template: row.reusable_template || metrics.reusable_template || undefined,
    created_at: row.created_at || new Date().toISOString(),
  };
}

function mapReferenceToDb(ref: Partial<Reference>): Record<string, any> {
  const metrics = {
    url: ref.url || '',
    hook_analysis: ref.hook_analysis || '',
    structure: ref.structure || '',
    reusable_template: ref.reusable_template || '',
  };
  return {
    id: ref.id,
    original_text: ref.text || '',
    platform: ref.platform || 'x',
    author: ref.author || 'Desconhecido',
    takeaways: ref.structure ? [ref.structure] : [],
    metrics,
  };
}

export async function getReferences(): Promise<Reference[]> {
  const raw = await getCollectionData<any>('content_references', 'created_at');
  return raw.map(mapReferenceFromDb);
}

export async function saveReference(ref: Partial<Reference>): Promise<Reference> {
  const dbPayload = mapReferenceToDb(ref);
  if (ref.id) {
    await updateDocData('content_references', ref.id, dbPayload);
    const updated = await getDocById<any>('content_references', ref.id);
    return updated ? mapReferenceFromDb(updated) : (ref as Reference);
  } else {
    const raw = await addDocData('content_references', dbPayload);
    return mapReferenceFromDb(raw);
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

export async function getPostSlots(): Promise<string[]> {
  const profile = await getVoiceProfile();
  if (profile.best_time_slots && profile.best_time_slots.length > 0) {
    return profile.best_time_slots;
  }
  return ['09:00', '14:30', '18:30'];
}

export async function savePostSlots(slots: string[]): Promise<string[]> {
  const profile = await getVoiceProfile();
  await saveVoiceProfile({
    ...profile,
    best_time_slots: slots,
  });
  return slots;
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
  const fallback = inMemoryStore.connections_config.connections_config as ConnectionsConfig;
  const merged: ConnectionsConfig = { ...fallback, ...(cfg || {}) };

  // 1. Fallback to process.env
  if (!merged.linkedin_client_id && process.env.LINKEDIN_CLIENT_ID) {
    merged.linkedin_client_id = process.env.LINKEDIN_CLIENT_ID;
  }
  if (!merged.linkedin_client_secret && process.env.LINKEDIN_CLIENT_SECRET) {
    merged.linkedin_client_secret = process.env.LINKEDIN_CLIENT_SECRET;
  }

  // 2. Fallback to system backup in facts table
  if (!merged.linkedin_client_id || !merged.linkedin_client_secret) {
    try {
      const credFact = await getDocById<{ id: string; statement: string }>('facts', 'cfg_linkedin_credentials');
      if (credFact?.statement) {
        const parsed = JSON.parse(credFact.statement);
        if (!merged.linkedin_client_id && parsed.linkedin_client_id) {
          merged.linkedin_client_id = parsed.linkedin_client_id;
        }
        if (!merged.linkedin_client_secret && parsed.linkedin_client_secret) {
          merged.linkedin_client_secret = parsed.linkedin_client_secret;
        }
      }
    } catch (ignore) {}
  }

  return merged;
}

export async function saveConnectionsConfig(cfg: Partial<ConnectionsConfig>): Promise<void> {
  // 1. If LinkedIn credentials are provided, safely persist in system backup store
  if (cfg.linkedin_client_id || cfg.linkedin_client_secret) {
    try {
      const current = await getConnectionsConfig();
      const statement = JSON.stringify({
        linkedin_client_id: cfg.linkedin_client_id || current.linkedin_client_id || '',
        linkedin_client_secret: cfg.linkedin_client_secret || current.linkedin_client_secret || '',
      });
      await setDocData('facts', 'cfg_linkedin_credentials', {
        id: 'cfg_linkedin_credentials',
        statement,
        category: 'system',
      });
    } catch (ignore) {}
  }

  // 2. Update memory store
  const store = inMemoryStore.connections_config;
  if (store.connections_config) {
    store.connections_config = { ...store.connections_config, ...cfg };
  }
  if (store.main_config) {
    store.main_config = { ...store.main_config, ...cfg };
  }

  // 3. Persist core fields to Postgres connections_config table
  await setDocData('connections_config', 'main_config', cfg);
}

// ==========================================
// AUTO-DM & GROWTH FUNNEL DB ACCESSORS
// ==========================================

export async function getDmCampaigns(): Promise<DmCampaign[]> {
  return getCollectionData<DmCampaign>('dm_campaigns', 'createdAt');
}

export async function saveDmCampaign(campaign: Partial<DmCampaign>): Promise<DmCampaign> {
  const id = campaign.id || `camp_${Date.now()}`;
  const now = new Date().toISOString();
  const existing = await getDocById<DmCampaign>('dm_campaigns', id);

  const fullCampaign: DmCampaign = {
    id,
    name: campaign.name || 'Nova Campanha',
    platform: campaign.platform || 'instagram',
    accountId: campaign.accountId || 'ig_default',
    accountUsername: campaign.accountUsername || 'creator',
    postId: campaign.postId || null,
    postUrl: campaign.postUrl || null,
    postThumbnail: campaign.postThumbnail || null,
    scope: campaign.scope || 'any',
    keywords: campaign.keywords || [],
    matchType: campaign.matchType || 'exact',
    dmTriggerEnabled: campaign.dmTriggerEnabled ?? true,
    dmMessage: campaign.dmMessage || 'Olá {username}! Aqui está o seu acesso exclusivo.',
    dmMessages: campaign.dmMessages || [campaign.dmMessage || 'Olá {username}! Aqui está o seu acesso exclusivo.'],
    openingDmEnabled: campaign.openingDmEnabled ?? false,
    openingDmMessage: campaign.openingDmMessage || null,
    openingDmButtonLabel: campaign.openingDmButtonLabel || null,
    cardImageUrl: campaign.cardImageUrl || null,
    cardTitle: campaign.cardTitle || null,
    cardSubtitle: campaign.cardSubtitle || null,
    linkButtonLabel: campaign.linkButtonLabel || 'Acessar Link',
    targetUrl: campaign.targetUrl || null,
    secondaryButtonLabel: campaign.secondaryButtonLabel || null,
    secondaryTargetUrl: campaign.secondaryTargetUrl || null,
    requireFollow: campaign.requireFollow ?? false,
    followPromptMessage: campaign.followPromptMessage || null,
    followPromptButtonLabel: campaign.followPromptButtonLabel || null,
    followUpEnabled: campaign.followUpEnabled ?? false,
    followUpMessage: campaign.followUpMessage || null,
    followUpDelayMinutes: campaign.followUpDelayMinutes ?? 15,
    publicReplyEnabled: campaign.publicReplyEnabled ?? true,
    publicReplyMessages: campaign.publicReplyMessages || ['Enviado no direct! 🚀'],
    isActive: campaign.isActive ?? true,
    dmsSentCount: existing ? existing.dmsSentCount : 0,
    clicksCount: existing ? existing.clicksCount : 0,
    ctr: existing ? existing.ctr : 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    ...campaign,
  };

  await setDocData('dm_campaigns', id, fullCampaign);
  return fullCampaign;
}

export async function deleteDmCampaign(id: string): Promise<void> {
  await deleteDocData('dm_campaigns', id);
}

export async function toggleDmCampaign(id: string, isActive: boolean): Promise<DmCampaign> {
  const existing = await getDocById<DmCampaign>('dm_campaigns', id);
  if (!existing) {
    throw new Error(`Campanha ${id} não encontrada`);
  }
  const updated: DmCampaign = {
    ...existing,
    isActive,
    updatedAt: new Date().toISOString(),
  };
  await setDocData('dm_campaigns', id, updated);
  return updated;
}

export async function getDmLogs(): Promise<DmLog[]> {
  return getCollectionData<DmLog>('dm_logs', 'createdAt');
}

export async function addDmLog(log: Partial<DmLog>): Promise<DmLog> {
  const id = log.id || `log_${Date.now()}`;
  const fullLog: DmLog = {
    id,
    campaignId: log.campaignId || '',
    campaignName: log.campaignName || 'Campanha',
    platform: log.platform || 'instagram',
    commenterId: log.commenterId || '',
    commenterUsername: log.commenterUsername || 'usuario',
    commentText: log.commentText || '',
    status: log.status || 'SENT',
    errorMessage: log.errorMessage || null,
    publicReplySent: log.publicReplySent ?? true,
    createdAt: new Date().toISOString(),
    ...log,
  };
  await setDocData('dm_logs', id, fullLog);
  return fullLog;
}

export async function getTrackedLinks(): Promise<TrackedLinkItem[]> {
  return getCollectionData<TrackedLinkItem>('tracked_links', 'createdAt');
}

export async function saveTrackedLink(link: Partial<TrackedLinkItem>): Promise<TrackedLinkItem> {
  const id = link.id || `trk_${Date.now()}`;
  const fullLink: TrackedLinkItem = {
    id,
    campaignId: link.campaignId || '',
    campaignName: link.campaignName || 'Campanha',
    platform: link.platform || 'instagram',
    label: link.label || 'Link',
    destinationUrl: link.destinationUrl || 'https://createflow.ai',
    shortSlug: link.shortSlug || `cf-${Date.now().toString(36)}`,
    shortUrl: link.shortUrl || `https://createflow.io/r/${link.shortSlug || Date.now().toString(36)}`,
    clicks: link.clicks || 0,
    uniqueClicks: link.uniqueClicks || 0,
    ctr: link.ctr || 0,
    createdAt: new Date().toISOString(),
    ...link,
  };
  await setDocData('tracked_links', id, fullLink);
  return fullLink;
}

export async function getSocialConversations(): Promise<SocialConversation[]> {
  return getCollectionData<SocialConversation>('social_conversations', 'lastMessageTimestamp');
}

export async function sendSocialMessage(conversationId: string, text: string): Promise<SocialMessage> {
  const conv = await getDocById<SocialConversation>('social_conversations', conversationId);
  const newMsg: SocialMessage = {
    id: `msg_${Date.now()}`,
    sender: 'me',
    text,
    timestamp: new Date().toISOString(),
  };

  if (conv) {
    const updatedConv: SocialConversation = {
      ...conv,
      lastMessageText: text,
      lastMessageTimestamp: newMsg.timestamp,
      messages: [...conv.messages, newMsg],
    };
    await setDocData('social_conversations', conversationId, updatedConv);
  }

  return newMsg;
}

export async function getTrackedLinkBySlug(slug: string): Promise<TrackedLinkItem | null> {
  const links = await getTrackedLinks();
  return links.find((l) => l.shortSlug === slug) || null;
}

export async function recordLinkClick(slug: string): Promise<string | null> {
  const link = await getTrackedLinkBySlug(slug);
  if (!link) return null;

  const clicks = (link.clicks || 0) + 1;
  const uniqueClicks = (link.uniqueClicks || 0) + 1;
  const ctr = Number(((uniqueClicks / Math.max(clicks, 1)) * 100).toFixed(1));

  const updated: TrackedLinkItem = {
    ...link,
    clicks,
    uniqueClicks,
    ctr,
  };
  await setDocData('tracked_links', link.id, updated);
  return link.destinationUrl;
}


