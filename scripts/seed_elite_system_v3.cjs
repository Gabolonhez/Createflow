const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const s = createClient(supabaseUrl, supabaseServiceKey);

const eliteReferences = [
  {
    id: 'ref_elite_math_contradiction',
    original_text: 'todo mundo dizendo que construir com IA é mais barato do que contratar um dev sênior\n\nvamos fazer a conta real em produção:\n\nsolução com wrappers de IA:\n$200/mês de assinatura\n1 em 38 fluxos quebra com timeout silencioso\n= 42 horas de debug caótico por mês\n\nengenharia enxuta de verdade:\nNext.js puro + Postgres bem modelado\nzero alucinação\n= 0 horas de bombeiro apagando fogo\n\no barato sai caro quando você automatiza o que nem validou',
    platform: 'x',
    author: 'Elite Blueprint v3.0 (Mathematical Contradiction)',
    takeaways: ['Crença popular -> Desafio ("vamos fazer a conta real") -> Cálculo A vs Cálculo B -> Inversão contraintuitiva'],
    metrics: {
      url: 'https://x.com/gabolonhez/status/elite_math_contradiction',
      hook_analysis: 'Mathematical Contradiction: Destrói a crença de custo aparente com uma conta simples de bastidores.',
      structure: 'Crença popular -> Desafio ("vamos fazer a conta real") -> Cálculo A vs Cálculo B -> Inversão contraintuitiva.',
      reusable_template: 'Todo mundo dizendo que [Opção A] é [Vantagem aparente] do que [Opção B].\n\nVamos fazer a conta real em produção:\n\n[Opção A]:\n[Métrica de custo 1]\n[Taxa de falha oculta]\n= [Custo real doloroso]\n\n[Opção B]:\n[Métrica simples]\n[Confiabilidade]\n= [Resultado limpo]\n\n[Lição contraintuitiva].'
    }
  },
  {
    id: 'ref_elite_transformation_arc',
    original_text: 'de 420 ms para 18 ms de latência em 48 horas\n\n23x mais rápido trocando 3 chamadas síncronas de LLM por uma fila assíncrona simples com Redis\n\na maioria dos times passa 3 meses querendo mudar de framework quando o gargalo era só 1 await no lugar errado',
    platform: 'x',
    author: 'Elite Blueprint v3.0 (Transformation Arc)',
    takeaways: ['Métrica antes -> Métrica depois em X horas/dias -> Multiplicador exato (23x) -> Ação ridiculamente simples -> Ataque à complicação'],
    metrics: {
      url: 'https://x.com/gabolonhez/status/elite_transformation_arc',
      hook_analysis: 'Transformation Arc: [Número ruim] → [Número excelente] em [Prazo curto] por causa de [1 ajuste ridículo].',
      structure: 'Métrica antes -> Métrica depois em X horas/dias -> Multiplicador exato (23x) -> Ação ridiculamente simples -> Ataque à complicação excessiva.',
      reusable_template: 'De [Métrica ruim] para [Métrica excelente] em [Tempo curto].\n\n[Multiplicador exato, ex: 14x] mais [Resultado] trocando [Ação complexa/errada] por [Ajuste ridiculamente simples].\n\nA maioria passa [Tempo longo] [Complicando], quando o segredo era apenas [Ação direta].'
    }
  },
  {
    id: 'ref_elite_speed_arbitrage',
    original_text: 'enquanto a maioria das agências e times gasta 14 dias debatendo design system no figma\n\nmeu setup de 1 dev com Next.js e Tailwind subiu o MVP completo, com auth e stripe, em 9 horas\n\nvelocidade de iteração em produção > 40 páginas de documentação que ninguém vai ler',
    platform: 'x',
    author: 'Elite Blueprint v3.0 (Speed Arbitrage)',
    takeaways: ['Enquanto o mercado faz [Processo lento/burocrático] -> O operador faz [Resultado concreto] em [Horas] -> Lição de autoridade'],
    metrics: {
      url: 'https://x.com/gabolonhez/status/elite_speed_arbitrage',
      hook_analysis: 'Operator Speed Arbitrage: Contrasta a lentidão e burocracia do mercado com a velocidade brutal de um operador enxuto.',
      structure: 'Enquanto o mercado faz [Processo lento/burocrático] -> O operador faz [Resultado concreto] em [Horas] -> Lição de autoridade.',
      reusable_template: 'Enquanto [Público/Mercado] gasta [Tempo longo] fazendo [Burocracia/Reuniões],\n\nMeu setup de [Equipe pequena/Operador] colocou [Resultado em produção] em [Poucas horas/dias].\n\n[Verdade crua sobre execução vs teoria].'
    }
  },
  {
    id: 'ref_elite_values_warfare',
    original_text: 'a sua stack técnica não é "moderna" se o seu primeiro usuário leva 8 segundos para carregar uma página\n\nse o seu produto precisa de 12 microserviços antes de ter 10 clientes pagantes, você não tem arquitetura enterprise\n\nvocê só tem medo de vender',
    platform: 'x',
    author: 'Elite Blueprint v3.0 (Values Warfare)',
    takeaways: ['Redefinição agressiva do termo -> Desafio de critérios 1-2 -> Conclusão visceral de choque de realidade'],
    metrics: {
      url: 'https://x.com/gabolonhez/status/elite_values_warfare',
      hook_analysis: 'Values Warfare: Desafia agressivamente o conceito de sucesso/qualidade do público e divide opiniões 50/50.',
      structure: 'Redefinição agressiva do termo -> Desafio de critérios 1-2 -> Conclusão visceral de choque de realidade.',
      reusable_template: 'O seu [Elemento/Projeto] não é [Elogio/Status] se [Sintoma real negativo].\n\nSe você precisa de [Complexidade desnecessária] antes de ter [Resultado básico],\n\nVocê não tem [Termo sofisticado]. Você só tem [Verdade crua que ninguém tem coragem de falar].'
    }
  },
  {
    id: 'ref_elite_accidental_discovery',
    original_text: 'achamos que o motivo dos usuários abandonarem o onboarding era a falta de um tour guiado\n\nremovemos 4 campos opcionais do formulário e a conversão saltou 31% na mesma tarde\n\nlição dolorosa de quem constrói: nunca adicione mais interface para resolver um problema de atrito',
    platform: 'linkedin',
    author: 'Elite Blueprint v3.0 (Accidental Discovery)',
    takeaways: ['Suposição errada do time -> Ação de subtração simples -> Métrica exata de resultado (31%) -> Lição de ouro'],
    metrics: {
      url: 'https://linkedin.com/in/gabolonhez/detail/recent-activity/elite_accidental_discovery',
      hook_analysis: 'Accidental Discovery: Revela a suposição errada da equipe e a simplicidade extrema da solução real que funcionou.',
      structure: 'Suposição errada do time -> Ação de subtração simples -> Métrica exata de resultado (31%) -> Lição de ouro.',
      reusable_template: 'Achamos que o motivo de [Problema] era a falta de [Solução complexa].\n\nFizemos [Ação de subtração/simplificação] e [Métrica exata de melhora] em [Pouco tempo].\n\nLição de quem opera na prática: [Princípio imutável].'
    }
  }
];

async function run() {
  for (const ref of eliteReferences) {
    const { error } = await s.from('content_references').upsert(ref);
    if (error) {
      console.error(`Erro ao inserir ${ref.id}:`, error.message);
    } else {
      console.log(`✓ Referência inserida: ${ref.id}`);
    }
  }
  console.log('Finalizado com sucesso!');
}

run();
