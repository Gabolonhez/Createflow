const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase ausentes no env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rawList = [
  // Bloco 1 - Produto, IA e Mentalidade de Criador
  {
    title: 'Saber de produto é característica valiosa: decidir, analisar e ter senso crítico',
    note: 'Não basta apenas codar; entender o produto, trade-offs e métricas de negócio é o que separa um dev júnior de um construtor de alto impacto.',
    pillar: 'founder-journey'
  },
  {
    title: 'Há 1 ano atrás eu não sabia nem como construir um app',
    note: 'Jornada de evolução e aprendizado acelerado. Onde estava há 12 meses vs hoje entregando produtos reais em produção.',
    pillar: 'career-lessons'
  },
  {
    title: 'A importância de testes A/B no desenvolvimento de produtos',
    note: 'Como dados reais de conversão e comportamento de usuário vencem opiniões subjetivas de qualquer um no time.',
    pillar: 'founder-journey'
  },
  {
    title: 'A IA vai substituir desenvolvedores ou criar uma nova categoria de construtores?',
    note: 'Visão de quem usa na prática: a IA substitui tarefas repetitivas, mas eleva drasticamente a exigência de senso crítico e arquitetura.',
    pillar: 'tech-insights'
  },
  {
    title: 'Curadoria de APIs e ferramentas essenciais para desenvolvedores no GitHub',
    note: 'Repositório organizado com recursos que aceleram o setup inicial de qualquer projeto moderno.',
    pillar: 'tech-insights'
  },
  {
    title: 'Não adianta criar projetos inúteis: crie algo com uso e tração real',
    note: 'Esqueça clones vazios da Netflix ou tutoriais copiados; construa ferramentas que resolvem dores reais de pessoas reais.',
    pillar: 'founder-journey'
  },
  {
    title: 'Por que testar é inegociável em sistemas de produção',
    note: 'Testes automatizados e de integração não atrasam o projeto; eles garantem noites de sono tranquilas e velocidade sustentável.',
    pillar: 'tech-insights'
  },
  {
    title: 'O que aprendi após meses sendo responsável por apps com milhares de usuários ativos',
    note: 'Lições sobre monitoramento, observabilidade, escala, custos de cloud e a responsabilidade de manter tudo no ar.',
    pillar: 'founder-journey'
  },
  {
    title: 'Desde que comecei a usar IA no dia a dia, não passei a programar menos: passei a pensar mais no problema',
    note: 'A mudança de paradigma: menos tempo digitando sintaxe repetitiva e muito mais tempo modelando dados e lógica de negócio.',
    pillar: 'tech-insights'
  },
  {
    title: 'Análise do The Founder\'s Playbook da Anthropic',
    note: 'Insights práticos e lições de quem está na fronteira dos modelos de linguagem e produtos de inteligência artificial.',
    pillar: 'founder-journey'
  },
  {
    title: 'Como tirar a cara de IA do código e das postagens',
    note: 'Evitar alucinações genéricas, código inchado e textos robóticos; cultivar uma voz autoral com opiniões fortes e provas reais.',
    pillar: 'tech-insights'
  },
  {
    title: 'Graphify e visualização de arquitetura de dados',
    note: 'Ferramentas visuais para mapear fluxos complexos e comunicação entre serviços.',
    pillar: 'tech-insights'
  },
  {
    title: 'Feedback não é crítica: é a ferramenta mais rápida de evolução técnica',
    note: 'Como transformar retornos de code review e comentários de usuários em aceleradores de maturidade profissional.',
    pillar: 'career-lessons'
  },
  {
    title: 'Não confie cegamente em tudo que a IA gera sem validar',
    note: 'A importância de auditar segurança, performance e edge cases em cada trecho de código sugerido por assistentes.',
    pillar: 'tech-insights'
  },
  {
    title: 'Com a IA, o padrão subiu: criar projetos completos e bem-acabados virou o novo básico',
    note: 'Projetos meia-boca qualquer um gera com prompt. O diferencial está no polimento, acabamento visual e robustez.',
    pillar: 'tech-insights'
  },
  {
    title: 'Construa, apenas construa: vencendo a paralisia por análise',
    note: 'Colocar um MVP no ar em 48h ensina mais do que passar 3 semanas debatendo qual framework utilizar.',
    pillar: 'founder-journey'
  },
  {
    title: 'Por onde começar com IA no desenvolvimento de software?',
    note: 'Guia prático para sair da inércia: comece integrando APIs simples antes de tentar construir pipelines de agentes complexos.',
    pillar: 'tech-insights'
  },
  {
    title: 'Pressão é privilégio: a mentalidade de quem constrói sob demanda real',
    note: 'Quando há usuários dependendo da sua entrega, o aprendizado é multiplicado por 10.',
    pillar: 'career-lessons'
  },
  {
    title: 'Construindo um app ou SaaS? Você precisa de métricas para entender onde investir',
    note: 'Analytics de produto, taxa de ativação e retenção como bússola para não gastar tempo em features inúteis.',
    pillar: 'founder-journey'
  },
  {
    title: 'Se a IA já faz o código bruto, o papel do dev mudou para arquiteto e piloto',
    note: 'Menos digitação, mais governança de contexto, validação e refinamento de requisitos.',
    pillar: 'tech-insights'
  },
  {
    title: 'O feed está cheio de "Criei esse SaaS em 3 horas com IA": a realidade por trás do marketing',
    note: 'Gerar um frontend bonitinho é fácil; manter autenticação, banco, webhooks, pagamentos e clientes reais é o jogo verdadeiro.',
    pillar: 'founder-journey'
  },
  {
    title: 'A verdade crua sobre trabalhar no ritmo de startups',
    note: 'Velocidade, pragmatismo, autonomia e a habilidade indispensável de se virar sem documentação pronta.',
    pillar: 'career-lessons'
  },
  {
    title: 'Todo dia alguém lança algo novo e revolucionário: como não se perder no hype',
    note: 'Como filtrar novidades e focar no que realmente melhora seus produtos e sua entrega técnica diária.',
    pillar: 'tech-insights'
  },
  {
    title: 'Afinal, qual é o verdadeiro impacto da IA no nosso dia a dia como desenvolvedores?',
    note: 'Visão pragmática sem fanatismo: ganhos reais de velocidade e os novos gargalos que surgiram.',
    pillar: 'tech-insights'
  },
  {
    title: 'Não se constrói nada de valor do dia para a noite: consistência vence intensidade',
    note: 'O poder dos hábitos diários de programação e aprendizado contínuo ao longo de meses e anos.',
    pillar: 'career-lessons'
  },
  {
    title: 'Não é sobre escrever linhas de código: é sobre construir produtos de ponta a ponta',
    note: 'Do design system ao banco de dados e deploy: a visão 360 do engenheiro de produto.',
    pillar: 'founder-journey'
  },
  {
    title: 'No momento em que o mercado só fala de IA, a sua maior vantagem competitiva são as Soft Skills',
    note: 'Comunicação precisa, clareza em reuniões, capacidade de síntese e alinhamento de expectativas.',
    pillar: 'career-lessons'
  },
  {
    title: 'Utilizar outros softwares e produtos consolidados como referência para evoluir o seu',
    note: 'Engenharia reversa de UX, fluxos de onboarding e decisões de design para acelerar seu próprio produto.',
    pillar: 'tech-insights'
  },
  {
    title: 'O ciclo do "Tutorial Hell": comprava vários cursos e não terminava nenhum',
    note: 'A virada de chave: só aprendi de verdade quando parei de assistir aulas passivas e comecei a quebrar a cabeça em projetos autorais.',
    pillar: 'career-lessons'
  },
  {
    title: 'Você não precisa reinventar a roda toda vez que vai criar uma funcionalidade nova',
    note: 'Aproveite componentes consolidados, bibliotecas maduras e APIs testadas para focar no core do seu negócio.',
    pillar: 'tech-insights'
  },

  // Bloco 2 - Engenharia, Agentes e Arquitetura
  {
    title: 'Como utilizar agentes de IA na prática sem perder o controle da base de código',
    note: 'Pipelines controlados, verificações determinísticas e aprovação humana em 1 clique antes de qualquer publicação.',
    pillar: 'tech-insights'
  },
  {
    title: 'A diferença entre entregar uma feature e entregar valor real para o negócio',
    note: 'Código bem escrito que ninguém usa não tem valor. Como focar no que move as métricas do produto.',
    pillar: 'founder-journey'
  },
  {
    title: 'O desafio de manter código limpo num ambiente ágil de startup que precisa de velocidade',
    note: 'Como equilibrar débito técnico intencional com refatorações pontuais sem travar o time.',
    pillar: 'tech-insights'
  },
  {
    title: 'Como tomar decisões de arquitetura focadas na experiência do usuário (UX) e não apenas no conforto do dev',
    note: 'O usuário não quer saber se o backend é elegante; ele quer latência zero e interface intuitiva.',
    pillar: 'tech-insights'
  },
  {
    title: 'Comparativo dos melhores modelos de IA atualmente: quando usar cada um',
    note: 'Gemini, Claude, GPT e modelos locais: custo por token, latência e especialidade de cada motor.',
    pillar: 'tech-insights'
  },
  {
    title: 'O papel da comunicação e da proatividade numa equipe técnica: como pedir ajuda do jeito certo',
    note: 'Explicar o contexto, o que já foi tentado e como facilitar a vida de quem vai te destravar.',
    pillar: 'career-lessons'
  },
  {
    title: 'O impacto do treino físico e mental na capacidade de focar em problemas complexos de código',
    note: 'Como o exercício aeróbico e musculação recarregam o foco e clareiam a resolução de bugs difíceis.',
    pillar: 'career-lessons'
  },
  {
    title: 'Canais do YouTube sobre TI e desenvolvimento que acompanho e recomendo',
    note: 'Lista com criadores técnicos que vão além do básico e mostram código real e bastidores.',
    pillar: 'tech-insights'
  },
  {
    title: 'A tecnologia muda rápido: a necessidade de se manter atualizado sem ansiedade',
    note: 'Filtrar o ruído e focar nos fundamentos perenes enquanto acompanha as novidades essenciais.',
    pillar: 'career-lessons'
  },
  {
    title: 'Importância da qualidade de software e boas práticas desde o início do projeto',
    note: 'Tipagem estrita, linters e padrões claros economizam centenas de horas no futuro.',
    pillar: 'tech-insights'
  },
  {
    title: 'Aprender ensinando e compartilhando: o método mais potente de retenção',
    note: 'Explicar um conceito técnico em um post público te força a dominá-lo de verdade.',
    pillar: 'career-lessons'
  },
  {
    title: 'Bancos de dados gratuitos na web: comparativo prático',
    note: 'Supabase, Neon, Turso e Firebase: qual escolher de acordo com o caso de uso do seu app.',
    pillar: 'tech-insights'
  },
  {
    title: 'Bastidores do FluenteIA: desafios e lições aprendidas',
    note: 'A jornada de construir, testar e colocar um produto com IA em produção.',
    pillar: 'founder-journey'
  },
  {
    title: 'Utilize a IA para aprender como se ela fosse seu Tech Lead pessoal',
    note: 'Prompts eficazes para fazer a IA desafiar suas escolhas arquiteturais e apontar falhas.',
    pillar: 'tech-insights'
  },
  {
    title: 'A lição de negócio mais importante que aprendi esta semana',
    note: 'Não é só sobre código. Como pequenas mudanças de posicionamento destravam tração.',
    pillar: 'founder-journey'
  },
  {
    title: 'Como organizo meu tempo entre faculdade, projetos próprios e criação de conteúdo',
    note: 'Gestão de energia e blocos de tempo para manter alta produtividade sem estresse.',
    pillar: 'career-lessons'
  },
  {
    title: 'Erros que cometi no início da faculdade de Sistemas de Informação (e como evitá-los)',
    note: 'Não se limite à sala de aula: crie projetos próprios e busque vivência prática desde o dia 1.',
    pillar: 'career-lessons'
  },
  {
    title: 'Refatoração na prática: quando é investimento e quando vira procrastinação',
    note: 'Como refatorar com foco em clareza e testes sem cair na armadilha da perfeição infinita.',
    pillar: 'tech-insights'
  },
  {
    title: 'Automação de testes: comece pelo simples antes que o sistema cresça',
    note: 'Testes que garantem que os fluxos vitais do produto nunca quebrem após um deploy.',
    pillar: 'tech-insights'
  },

  // Bloco 3 - Carreira, Fundamentos e Hard Skills
  {
    title: 'A importância de um portfólio web próprio: case do clone da HBO Max',
    note: 'Apresentar projetos visuais completos e interativos no GitHub para demonstrar capricho técnico.',
    pillar: 'career-lessons'
  },
  {
    title: 'A "Curva de Aprendizado" na TI: por que parece tão difícil no início e como superá-la',
    note: 'Entendendo o vale do desânimo e mantendo o foco até os conceitos começarem a se conectar.',
    pillar: 'career-lessons'
  },
  {
    title: 'Desmistificando a lógica de programação: por que os fundamentos são tudo',
    note: 'Quem domina lógica e estruturas de dados aprende qualquer framework ou linguagem nova com facilidade.',
    pillar: 'tech-insights'
  },
  {
    title: 'Como a Web funciona por baixo dos panos: DNS, HTTP, TCP/IP e o ciclo da requisição',
    note: 'O conhecimento essencial que separa quem entende a plataforma de quem apenas copia código.',
    pillar: 'tech-insights'
  },
  {
    title: 'Comandos essenciais de terminal que todo dev deveria dominar',
    note: 'Produtividade máxima na linha de comando: pipes, grep, gerenciamento de processos e atalhos.',
    pillar: 'tech-insights'
  },
  {
    title: 'APIs desmistificadas: o que são, verbos HTTP e boas práticas de contratos',
    note: 'Como desenhar APIs previsíveis, com status codes semânticos e respostas padronizadas.',
    pillar: 'tech-insights'
  },
  {
    title: 'Chrome DevTools: como usar o Inspecionar para debugar requisições e performance',
    note: 'Análise de payload, rede, layout shifts e breakpoints na prática.',
    pillar: 'tech-insights'
  },
  {
    title: 'HTML, CSS e JavaScript: a base sólida que sustenta todo o ecossistema',
    note: 'Por que dominar os fundamentos da web te torna um dev front-end infinitamente superior.',
    pillar: 'tech-insights'
  },
  {
    title: 'O poder dos pequenos e médios projetos no GitHub',
    note: 'Como organizar repositórios com bons READMEs, prints e deploy ativo para atrair oportunidades.',
    pillar: 'career-lessons'
  },
  {
    title: 'Como uso o Notion para organizar meus estudos, projetos e metas',
    note: 'Estrutura simples de acompanhamento diário sem complexidade desnecessária.',
    pillar: 'career-lessons'
  },
  {
    title: 'Como o inglês se tornou parte orgânica do meu dia a dia em tecnologia',
    note: 'Documentações oficiais, fóruns globais e como isso abre portas imediatas na carreira tech.',
    pillar: 'career-lessons'
  },
  {
    title: 'Dica de ouro no GitHub: aperte "." no repositório para abrir o VS Code web',
    note: 'Agilidade para ler e inspecionar código alheio sem precisar clonar nada localmente.',
    pillar: 'tech-insights'
  },
  {
    title: 'Livros de tecnologia que realmente moldaram minha mentalidade como engenheiro',
    note: 'Leituras essenciais sobre pragmatismo, clean code e arquitetura de sistemas.',
    pillar: 'career-lessons'
  },
  {
    title: 'Trabalhar e aprender com pessoas mais experientes: o maior catalisador de crescimento',
    note: 'A postura certa para absorver o conhecimento dos seniores e evoluir 3x mais rápido.',
    pillar: 'career-lessons'
  },
  {
    title: 'Seu plano de estudos tech: como montar uma rotina consistente que funciona',
    note: 'Por que estudar 45 minutos todo dia dá 10x mais resultado do que estudar 8 horas em um único dia.',
    pillar: 'career-lessons'
  },
  {
    title: 'Liderança além do cargo: como gerar impacto e influenciar mesmo sendo júnior',
    note: 'Proatividade, documentação voluntária e postura colaborativa que chamam a atenção do time.',
    pillar: 'career-lessons'
  },
  {
    title: 'Benefícios e desafios do trabalho remoto em tecnologia',
    note: 'Autonomia e qualidade de vida vs necessidade de comunicação assíncrona impecável.',
    pillar: 'career-lessons'
  },
  {
    title: 'Pequenos hábitos, grandes resultados: construindo uma rotina de sucesso na carreira tech',
    note: 'Organização, pausas inteligentes e consistência de código diária.',
    pillar: 'career-lessons'
  },
  {
    title: 'Metodologias ágeis sem burocracia: Scrum e Kanban na vida real',
    note: 'Como focar na cadência de entregas contínuas em vez de rituais engessados.',
    pillar: 'tech-insights'
  },

  // Bloco 4 - Vulnerabilidade, Hard Skills & Bastidores
  {
    title: 'Por que parei de postar certificados de cursos: o que vale é código rodando no ar',
    note: 'A diferença entre colecionar certificados e colocar produtos funcionais à prova do mercado.',
    pillar: 'career-lessons'
  },
  {
    title: 'Síndrome do Impostor no primeiro cargo de Dev: como estou lidando com isso',
    note: 'Reconhecer que ninguém sabe tudo e que o trabalho do dev é justamente resolver o desconhecido.',
    pillar: 'career-lessons'
  },
  {
    title: 'O que o atendimento e suporte ao usuário me ensinou sobre código de qualidade',
    note: 'A empatia com a dor do cliente final transforma a forma como você trata erros no backend.',
    pillar: 'career-lessons'
  },
  {
    title: 'Full-Stack na prática: a ponte entre Front-end e Back-end',
    note: 'Minhas primeiras impressões conectando bancos de dados, APIs e interfaces fluidas.',
    pillar: 'tech-insights'
  },
  {
    title: 'Do Requisito ao Deploy: a visão completa da jornada de entrega de software',
    note: 'Compreender o produto como um organismo vivo desde a concepção até a observabilidade em produção.',
    pillar: 'founder-journey'
  },
  {
    title: 'Desvendando async/await em JavaScript: como o conceito finalmente fez sentido',
    note: 'Explicação visual e direta sobre Event Loop, Promises e código não-bloqueante.',
    pillar: 'tech-insights'
  },
  {
    title: 'C# .NET vs Node.js: primeiras impressões comparando os dois ecossistemas',
    note: 'A solidez tipada do .NET corporativo vs a agilidade e ecossistema do Node.js.',
    pillar: 'tech-insights'
  },
  {
    title: 'Azure DevOps para desenvolvedores: as funcionalidades essenciais do dia a dia',
    note: 'Gestão de branches, PRs e automação de pipelines sem atrito.',
    pillar: 'tech-insights'
  },
  {
    title: 'O que é Estado e Componente em React: a explicação simples que eu queria ter ouvido no início',
    note: 'Desmistificando o ciclo de vida e re-renderização com analogias do mundo real.',
    pillar: 'tech-insights'
  },
  {
    title: 'A importância do descanso: a solução de bugs difíceis quase nunca vem com mais uma xícara de café',
    note: 'A ciência do modo difuso: como se afastar da tela resolve o que 4 horas encarando o código não resolveram.',
    pillar: 'career-lessons'
  },
  {
    title: 'O poder de uma boa documentação: um favor para o time e para o seu eu do futuro',
    note: 'Comentários que explicam a razão das escolhas e READMEs que qualquer dev consegue rodar em 5 minutos.',
    pillar: 'tech-insights'
  }
];

async function run() {
  console.log(`Carregando ${rawList.length} ideias extraídas do Notion...`);
  
  const items = rawList.map((item, idx) => ({
    id: `idea_notion_${idx + 1}`,
    title: item.title,
    note: item.note,
    platforms: ['linkedin', 'x'],
    pillar: item.pillar,
    status: 'NEW',
    created_at: new Date(Date.now() - (rawList.length - idx) * 3600000).toISOString()
  }));

  const { data, error } = await supabase
    .from('ideas')
    .upsert(items, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Erro ao salvar no Supabase:', error);
    process.exit(1);
  }

  console.log(`✅ Sucesso total! ${data.length} ideias gravadas com sucesso no Supabase!`);
}

run();
