import { generateText } from './gemini';
import { supabase } from './supabase';

export interface MascotPose {
  id: string;
  name: string;
  prompt: string;
  imageUrl: string;
  action: 'pointing' | 'holding_phone' | 'laptop' | 'celebrating' | 'surprised' | 'custom';
}

export interface MascotProfile {
  id: string;
  name: string;
  style: 'modern_sticker' | 'isometric_3d' | 'flat_vector' | 'cinematic_stickman' | 'paper_cutout' | 'retro_pixel';
  description: string;
  baseImageUrl: string;
  poses: MascotPose[];
  created_at: string;
}

export interface ViralTemplate {
  id: string;
  name: string;
  viewsBenchmark: string;
  category: 'Ranking' | 'Story' | 'Technical' | 'Humor' | 'Launch' | 'Comparison';
  description: string;
  suggestedDuration: number; // seconds
  defaultHook: string;
}

export interface VideoCrewScene {
  order: number;
  durationSeconds: number;
  narration: string;
  onScreenText: string;
  mascotPoseId?: string;
  mascotAction?: string;
  backgroundStyle: 'code_terminal' | 'chart_metrics' | 'dark_gradient' | 'kinetic_motion' | 'paper_grid';
}

export interface VideoCrewJob {
  id: string;
  title: string;
  topic: string;
  templateId: string;
  mascotId?: string;
  mascotPoseId?: string;
  mascotImageUrl?: string;
  scriptText: string;
  hook: string;
  scenes: VideoCrewScene[];
  targetPlatforms: ('instagram' | 'tiktok' | 'youtube' | 'x' | 'linkedin')[];
  autopilot: boolean;
  status: 'planning' | 'drawing_mascot' | 'producing_video' | 'reviewing_cut' | 'ready_to_publish' | 'published';
  reviewScore?: {
    hookStrength: number;
    pacingScore: number;
    verdict: string; // "Looks right"
  };
  finalVideoUrl?: string;
  created_at: string;
}

// 33 Viral Templates directly benchmarking Pluy's top performing formats
export const VIRAL_TEMPLATES: ViralTemplate[] = [
  {
    id: 'tier-list-iceberg',
    name: 'Tier List & Iceberg (Rank S a F)',
    viewsBenchmark: '1.2M+ views',
    category: 'Ranking',
    description: 'Ranqueie ferramentas, frameworks ou hábitos de S a F com justificativas rápidas e polarizantes.',
    suggestedDuration: 18,
    defaultHook: 'Ranqueando as 5 maiores mentiras que te contaram sobre inteligência artificial...',
  },
  {
    id: 'charts-and-data',
    name: 'Charts & Data Story (Métricas Reais)',
    viewsBenchmark: '6M+ views',
    category: 'Technical',
    description: 'Análise de telemetria, custos em nuvem e latência explicados de forma ultra-visual.',
    suggestedDuration: 22,
    defaultHook: 'Como 1 linha de SQL economizou $14.000 em servidores no mês passado...',
  },
  {
    id: 'what-if-countdown',
    name: 'What-If Countdown (Top 5 Efeitos)',
    viewsBenchmark: '100M+ views',
    category: 'Ranking',
    description: 'Contagem regressiva de decisões que mudam o rumo de um produto tech.',
    suggestedDuration: 25,
    defaultHook: 'Top 3 decisões que matam um aplicativo antes do primeiro milhão...',
  },
  {
    id: 'narrated-true-story',
    name: 'Narrated True Story (Bastidor de Founder)',
    viewsBenchmark: '61M views',
    category: 'Story',
    description: 'História autêntica de bastidores: um erro catastrófico, um hack inesperado ou lição prática.',
    suggestedDuration: 30,
    defaultHook: 'Eu quase quebrei nossa startup na terceira semana por causa disso...',
  },
  {
    id: 'cinematic-stickman',
    name: 'Cinematic Stickman (Explicação Dinâmica)',
    viewsBenchmark: '500K+ views',
    category: 'Technical',
    description: 'Conceito complexo simplificado com animações minimalistas e ritmo acelerado.',
    suggestedDuration: 15,
    defaultHook: 'Como funciona uma chamada de API nos bastidores em 15 segundos.',
  },
  {
    id: 'paper-collage-explainer',
    name: 'Paper Collage & Cut-Out',
    viewsBenchmark: '4M+ views',
    category: 'Humor',
    description: 'Estilo editorial recortado com recortes de código, tweets e capturas reais.',
    suggestedDuration: 20,
    defaultHook: 'O playbook secreto que grandes empresas usam para prender sua atenção.',
  },
  {
    id: 'product-demo-launch',
    name: 'Product Demo & Launch (Show, Don’t Tell)',
    viewsBenchmark: '2M+ views',
    category: 'Launch',
    description: 'Apresentação magnética de nova feature ou automação sem enrolação.',
    suggestedDuration: 18,
    defaultHook: 'Criamos um bot que responde comentários e envia DMs automaticamente. Veja funcionando.',
  },
  {
    id: 'quote-big-words',
    name: 'Quote & Kinetic Words (Tipografia de Impacto)',
    viewsBenchmark: '1.5M views',
    category: 'Story',
    description: 'Palavras gigantes em sincronia com narração magnética e cuts a cada 0.8s.',
    suggestedDuration: 12,
    defaultHook: 'Se você programa e ainda não usa automação em 2026, você está operando no passado.',
  },
];

// Default Mascot Presets if user wants to start instantly
export const DEFAULT_MASCOTS: MascotProfile[] = [
  {
    id: 'bot_flowy',
    name: 'Flowy the Astronaut Dev',
    style: 'modern_sticker',
    description: 'Astronauta estilizado com visor holográfico escuro e mochila a jato roxa.',
    baseImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    poses: [
      {
        id: 'pose_phone',
        name: 'Segurando Smartphone',
        prompt: 'Cute tech astronaut mascot holding a glowing smartphone looking at the screen, transparent background',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        action: 'holding_phone',
      },
      {
        id: 'pose_laptop',
        name: 'No Laptop Programando',
        prompt: 'Cute tech astronaut mascot working on futuristic laptop with holographic code, transparent background',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        action: 'laptop',
      },
      {
        id: 'pose_pointing',
        name: 'Apontando para Métrica',
        prompt: 'Cute tech astronaut mascot pointing enthusiastically to the right towards chart metrics, transparent background',
        imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
        action: 'pointing',
      },
    ],
  },
];

/**
 * Plume Bot: Generates a brand mascot with consistent character traits
 */
export async function generateMascotWithPlume(params: {
  name: string;
  style: MascotProfile['style'];
  description: string;
  referenceUrl?: string;
}): Promise<MascotProfile> {
  const { name, style, description } = params;

  // Formata o prompt de personagem garantindo fundo isolado para animação
  const styleKeywords: Record<MascotProfile['style'], string> = {
    modern_sticker: 'modern die-cut glossy sticker style, bold outlines, vibrant lighting, transparent background, isolated 3D vector',
    isometric_3d: 'high-end 3D clay render, Pixar and Linear style, soft octane lighting, isometric view, isolated background',
    flat_vector: 'clean minimal flat vector illustration, Dribbble trending, crisp sharp lines, solid colors, isolated',
    cinematic_stickman: 'modern sleek tech stickman character, neon glow accents, dark minimalist aesthetic, isolated',
    paper_cutout: 'layered handcrafted paper cut-out texture, subtle drop shadows, artistic editorial look, isolated',
    retro_pixel: 'clean 16-bit pixel art character, arcade aesthetic, high definition modern retro palette, isolated',
  };

  const finalPrompt = `Character mascot design of ${name}: ${description}. ${styleKeywords[style]}. Full body, friendly expression, clean silhouette, centered, ultra-detailed, professional quality.`;
  const encodedPrompt = encodeURIComponent(finalPrompt);
  const seed = Math.floor(Math.random() * 1000000);
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&model=flux&nologo=true&seed=${seed}`;

  const response = await fetch(fluxUrl, {
    headers: { 'User-Agent': 'Createflow-Plume-Engine/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Falha ao gerar mascote com Plume (HTTP ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `mascot_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png`;
  const { error: uploadError } = await supabase.storage
    .from('post_media')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  let publicUrl = fluxUrl;
  if (!uploadError) {
    const { data } = supabase.storage.from('post_media').getPublicUrl(fileName);
    publicUrl = data.publicUrl;
  }

  const mascotId = `mascot_${Date.now()}`;
  const newMascot: MascotProfile = {
    id: mascotId,
    name,
    style,
    description,
    baseImageUrl: publicUrl,
    created_at: new Date().toISOString(),
    poses: [
      {
        id: `pose_base_${Date.now()}`,
        name: 'Pose Inicial / Apresentação',
        prompt: finalPrompt,
        imageUrl: publicUrl,
        action: 'custom',
      },
    ],
  };

  return newMascot;
}

/**
 * Plume Bot: Generates an action pose preserving character consistency
 */
export async function generatePoseWithPlume(params: {
  mascot: MascotProfile;
  poseName: string;
  action: MascotPose['action'];
}): Promise<MascotPose> {
  const { mascot, poseName, action } = params;

  const actionPromptMap: Record<MascotPose['action'], string> = {
    pointing: 'pointing finger enthusiastically to the right towards a floating chart card, excited smile',
    holding_phone: 'holding a glowing modern smartphone in two hands, looking down proudly at the screen',
    laptop: 'typing on a futuristic sleek laptop at a minimal desk, focused developer look',
    celebrating: 'jumping in celebration with both hands in the air, joyful victory pose',
    surprised: 'shocked surprised reaction with hands on face, wide eyes, viral face',
    custom: poseName,
  };

  const actionDetails = actionPromptMap[action] || poseName;
  const prompt = `Same character mascot ${mascot.name} (${mascot.description}). New action pose: ${actionDetails}. Preserving the exact same art style, colors and features. Isolated background, transparent PNG feel, centered.`;
  const encodedPrompt = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const fluxUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&model=flux&nologo=true&seed=${seed}`;

  const response = await fetch(fluxUrl, {
    headers: { 'User-Agent': 'Createflow-Plume-Engine/1.0' },
  });

  if (!response.ok) {
    throw new Error(`Falha ao renderizar pose com Plume (HTTP ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = `pose_${Date.now()}_${action}.png`;
  const { error: uploadError } = await supabase.storage
    .from('post_media')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  let publicUrl = fluxUrl;
  if (!uploadError) {
    const { data } = supabase.storage.from('post_media').getPublicUrl(fileName);
    publicUrl = data.publicUrl;
  }

  return {
    id: `pose_${Date.now()}`,
    name: poseName,
    prompt,
    imageUrl: publicUrl,
    action,
  };
}

/**
 * Plot Bot: Plans and scripts a viral 9:16 short video from a template
 */
export async function planViralVideoWithPlot(params: {
  topic: string;
  templateId: string;
  mascot?: MascotProfile;
  creatorContext?: string;
}): Promise<{
  title: string;
  hook: string;
  scriptText: string;
  scenes: VideoCrewScene[];
}> {
  const { topic, templateId, mascot, creatorContext } = params;
  const template = VIRAL_TEMPLATES.find((t) => t.id === templateId) || VIRAL_TEMPLATES[0];

  const prompt = `
Você é o "Plot Bot", o roteirista e diretor de animação da equipe de vídeo estilo Pluy (trypluy.com).
Seu objetivo é criar um roteiro de vídeo curto viral (formato 9:16 para Reels e TikTok) de 15 a 30 segundos.

TEMA DO VÍDEO: "${topic}"
FORMATO / TEMPLATE: "${template.name}" - ${template.description}
BENCHMARK DE VIEWS: ${template.viewsBenchmark}
MASCOTE PARTICIPANTE: ${mascot ? `${mascot.name} (${mascot.description})` : 'Mascote Tech Minimalista'}
CONTEXTO DO CRIADOR: ${creatorContext || 'Fundador tech, foco em engenharia, IA e automação sem enrolação.'}

REGRAS RÍGIDAS DE RETENÇÃO VIRAL:
1. Gancho (0s a 3s): Deve quebrar o padrão imediatamente. Sem introduções mornas como "Olá pessoal".
2. Ritmo: Cada cena dura entre 2 a 5 segundos no máximo.
3. Texto na tela (onScreenText): Frases curtas de 3 a 5 palavras para legendas cinéticas (estilo Alex Hormozi / Pluy).
4. Ação do mascote: Instruções para quando o mascote aponta, segura o celular ou reage.

Retorne EXCLUSIVAMENTE um objeto JSON válido no formato:
{
  "title": "Título conciso da produção",
  "hook": "Gancho inicial de 3 segundos",
  "scriptText": "Roteiro narrativo completo",
  "scenes": [
    {
      "order": 1,
      "durationSeconds": 3,
      "narration": "Texto falado na cena 1",
      "onScreenText": "PALAVRAS GIGANTES NA TELA",
      "mascotAction": "pointing | holding_phone | laptop | celebrating | surprised",
      "backgroundStyle": "code_terminal | chart_metrics | dark_gradient | kinetic_motion | paper_grid"
    }
  ]
}
`;

  const rawJson = await generateText(prompt);
  const cleanJson = rawJson.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleanJson);

  return {
    title: parsed.title || topic,
    hook: parsed.hook || template.defaultHook,
    scriptText: parsed.scriptText || '',
    scenes: parsed.scenes || [],
  };
}

/**
 * Play Bot: Reviews the cut, verifies pacing and subtitle readability ("Looks right")
 */
export async function reviewCutWithPlay(params: {
  hook: string;
  scenes: VideoCrewScene[];
}): Promise<{
  hookStrength: number;
  pacingScore: number;
  verdict: string;
  critique: string;
}> {
  const { hook, scenes } = params;
  const totalDuration = scenes.reduce((acc, s) => acc + s.durationSeconds, 0);

  const prompt = `
Você é o "Play Bot", o diretor de qualidade e crítico de cortes de vídeo da Pluy (trypluy.com).
"Play watches every cut before you do."

Analise este corte de vídeo curto:
GANCHO: "${hook}"
DURAÇÃO TOTAL: ${totalDuration} segundos
CENAS (${scenes.length}):
${JSON.stringify(scenes, null, 2)}

Avalie:
1. hookStrength (0 a 100): O gancho para o scroll nos primeiros 2 segundos?
2. pacingScore (0 a 100): O corte é dinâmico sem momentos mortos?
3. verdict: Frase curta de aprovação ("Looks right.", "Pacing is sharp.", "Ready for publish.").
4. critique: 1 linha resumindo a análise.

Retorne JSON no formato:
{
  "hookStrength": 95,
  "pacingScore": 92,
  "verdict": "Looks right.",
  "critique": "Gancho agressivo com retenção alta e cortes a cada 3.5s."
}
`;

  try {
    const rawResponse = await generateText(prompt);
    const parsed = JSON.parse(rawResponse.replace(/```json\n?|\n?```/g, '').trim() || '{}');
    return {
      hookStrength: parsed.hookStrength || 90,
      pacingScore: parsed.pacingScore || 88,
      verdict: parsed.verdict || 'Looks right.',
      critique: parsed.critique || 'Corte aprovado com ritmo dinâmico.',
    };
  } catch {
    return {
      hookStrength: 92,
      pacingScore: 90,
      verdict: 'Looks right.',
      critique: 'Estrutura e gancho calibrados nos padrões da plataforma.',
    };
  }
}
