const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
for (const line of env.split('\n')) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) envVars[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
}

const s = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const benchmarkRefs = [
  {
    id: 'ref_x_contrarian_arch',
    original_text: '99% dos problemas de arquitetura de software em startups não são causados por escolha errada de banco de dados.\n\nSão causados por criar abstrações prematuras para problemas que você ainda não tem.\n\nEscreva código direto. Otimize quando doer.',
    platform: 'x',
    author: 'Tech Operator Benchmark',
    takeaways: ['Afirmação contrária -> Causa raiz real -> Regra de ouro acionável'],
    metrics: {
      url: 'https://x.com/tech_lead/status/170001',
      hook_analysis: 'Quebra de padrão agressiva atacando crença comum de engenharia com gancho de 99%.',
      structure: 'Afirmação contrária -> Causa raiz real -> Regra de ouro acionável',
      reusable_template: '99% dos problemas de [Área] não são causados por [Causa comum].\n\nSão causados por [Causa raiz real].\n\n[Regra de ouro direta].'
    }
  },
  {
    id: 'ref_x_teardown_perf',
    original_text: 'Levamos 6 meses para entender por que nosso sistema de IA ficava lento em pico.\n\nNão era o modelo. Era o overhead de serialização e conexões sem pool no edge.\n\nComo reduzimos a latência de 1.8s para 240ms sem gastar 1 centavo a mais:',
    platform: 'x',
    author: 'AI Engineering Benchmark',
    takeaways: ['Problema caro -> Revelação do vilão real -> Promessa de métrica antes/depois'],
    metrics: {
      url: 'https://x.com/ai_builder/status/170002',
      hook_analysis: 'Tensão temporal e revelação contraintuitiva com métricas numéricas claras.',
      structure: 'Problema caro -> Vilão real descoberto -> Transição para o case de otimização',
      reusable_template: 'Levamos [Tempo] para entender por que [Sistema] ficava [Problema].\n\nNão era [Suspeito óbvio]. Era [Vilão real].\n\nComo fomos de [Métrica ruim] para [Métrica boa]:'
    }
  },
  {
    id: 'ref_linkedin_architecture_case',
    original_text: `A decisão técnica mais difícil que tomei este ano foi apagar 4.000 linhas de código.

Tínhamos construído uma pipeline com microserviços e filas assíncronas para algo que recebia 50 requisições por minuto.

O resultado? Gastávamos mais tempo depurando contratos de mensageria do que entregando valor aos usuários.

Voltamos para um monólito enxuto em Next.js com Postgres no Supabase. O que aconteceu:

• Tempo de deploy caiu de 14 minutos para 80 segundos
• Complexidade de tracing praticamente zerou
• 1 engenheiro agora mantém o que antes dividia a atenção de 3 pessoas

Em engenharia de produto, maturidade não é o quanto de tecnologia você consegue empilhar.
É o quanto você consegue remover mantendo o produto impecável.`,
    platform: 'linkedin',
    author: 'Staff Engineer Benchmark',
    takeaways: ['Gancho de alta tensão em 2 linhas -> Contexto do erro -> Decisão pragmática -> Métricas objetivas com marcadores -> Lição de liderança'],
    metrics: {
      url: 'https://linkedin.com/posts/architecture-case-01',
      hook_analysis: 'Gancho dramático nas primeiras 2 linhas forçando clique em "...ver mais", parágrafos curtos de respiro visual e métricas reais.',
      structure: 'Gancho de impacto -> Contexto do erro -> Decisão pragmática -> Métricas antes/depois -> Lição de maturidade técnica',
      reusable_template: `A decisão técnica mais difícil que tomei este ano foi [Ação radical].

Tínhamos construído [Solução complexa] para [Problema modesto].

O resultado? [Dor real gerada pela superengenharia].

Voltamos para [Solução simples e direta]. O que aconteceu:

• [Métrica positiva 1]
• [Métrica positiva 2]
• [Métrica positiva 3]

Em [Área], maturidade não é [Ilusão do mercado].
É [Verdade pragmática de quem está em produção].`
    }
  },
  {
    id: 'ref_linkedin_founder_execution',
    original_text: `Pare de tentar automatizar antes de ter alguém implorando pela solução manual.

Quando comecei a construir produtos com IA, cometi o erro clássico: passei 3 semanas configurando agentes autônomos e integrações complexas antes de ter 3 usuários ativos.

Na prática:
Se você não consegue resolver a dor de alguém manualmente via DM ou planilha, colocar um LLM no meio só vai automatizar a sua irrelevância.

Hoje, nossa régua de engenharia é simples:
1. Resolva na mão para 5 pessoas
2. Descubra onde dói de verdade no fluxo
3. Só então escreva o código da automação

Código é alavanca. Mas alavanca sem tração real só levanta poeira.`,
    platform: 'linkedin',
    author: 'Founder & Tech Lead Benchmark',
    takeaways: ['Comando provocador na 1ª linha -> História de falha pessoal -> Tese sem filtro -> Framework prático 1-2-3 -> Frase de ancoragem final'],
    metrics: {
      url: 'https://linkedin.com/posts/founder-execution-02',
      hook_analysis: 'Comando imperativo na primeira linha que rompe com a ilusão do feed, seguido de vulnerabilidade de founder e lição prática.',
      structure: 'Comando provocador -> Vulnerabilidade com erro real -> Tese central -> Framework em 3 passos -> Ancoragem final',
      reusable_template: `Pare de [Ação comum e errada] antes de [Validação básica e indispensável].

Quando comecei a [Atividade], cometi o erro clássico: [Erro de esforço prematuro].

Na prática:
Se você não consegue [Resultado simples manual], usar [Tecnologia avançada] só vai [Consequência negativa].

Hoje, nossa régua é simples:
1. [Passo 1]
2. [Passo 2]
3. [Passo 3]

[Metáfora ou frase de efeito de operador].`
    }
  }
];

async function seed() {
  console.log('Seeding benchmark references into Supabase content_references...');
  for (const ref of benchmarkRefs) {
    const { data, error } = await s.from('content_references').upsert(ref).select();
    if (error) {
      console.error(`Error inserting ${ref.id}:`, error.message);
    } else {
      console.log(`✓ Inserted benchmark reference: ${ref.id} (${ref.platform})`);
    }
  }
  const { data: all } = await s.from('content_references').select('id, platform, author');
  console.log('\nTotal references in Supabase now:', all?.length);
}

seed();
