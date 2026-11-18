import { generateMultimodalJson, generateJson } from './gemini';
import type { VideoAnalysisResult, VideoSubtitleCue, VideoCutSegment, VoiceProfile } from '@/types';

function secondsToSrtTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)},${pad(millis, 3)}`;
}

function secondsToVttTimestamp(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds % 1) * 1000);

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(millis, 3)}`;
}

export function buildSrtFromCues(cues: VideoSubtitleCue[]): string {
  return cues
    .map((cue, idx) => {
      const start = secondsToSrtTimestamp(cue.startSeconds);
      const end = secondsToSrtTimestamp(cue.endSeconds);
      return `${idx + 1}\n${start} --> ${end}\n${cue.text}\n`;
    })
    .join('\n');
}

export function buildVttFromCues(cues: VideoSubtitleCue[]): string {
  const body = cues
    .map((cue, idx) => {
      const start = secondsToVttTimestamp(cue.startSeconds);
      const end = secondsToVttTimestamp(cue.endSeconds);
      return `${idx + 1}\n${start} --> ${end}\n${cue.text}\n`;
    })
    .join('\n');
  return `WEBVTT\n\n${body}`;
}

export function buildFfmpegCutCommand(cuts: VideoCutSegment[], totalDurationSeconds: number): string {
  if (!cuts || cuts.length === 0) {
    return '# Nenhuma pausa longa detectada. O vídeo original já está com ritmo dinâmico!';
  }

  // Calcula segmentos mantidos
  const keepSegments: Array<{ start: number; end: number }> = [];
  let currentStart = 0;

  for (const cut of cuts) {
    if (cut.startSeconds > currentStart + 0.3) {
      keepSegments.push({
        start: Math.max(0, currentStart),
        end: Math.max(0, cut.startSeconds),
      });
    }
    currentStart = cut.endSeconds;
  }

  if (currentStart < totalDurationSeconds) {
    keepSegments.push({
      start: currentStart,
      end: totalDurationSeconds,
    });
  }

  if (keepSegments.length === 0) {
    return '# Segmentos mantidos insuficientes.';
  }

  // Gera comando FFmpeg com select filter ou concat
  const filterParts = keepSegments
    .map((seg, i) => `[0:v]trim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},setpts=PTS-STARTPTS[v${i}]; [0:a]atrim=start=${seg.start.toFixed(2)}:end=${seg.end.toFixed(2)},asetpts=PTS-STARTPTS[a${i}];`)
    .join(' ');

  const concatInputs = keepSegments.map((_, i) => `[v${i}][a${i}]`).join('');
  const concatFilter = `${concatInputs}concat=n=${keepSegments.length}:v=1:a=1[outv][outa]`;

  return `ffmpeg -i input.mp4 -filter_complex "${filterParts} ${concatFilter}" -map "[outv]" -map "[outa]" -c:v libx264 -crf 18 -preset fast output_cortado.mp4`;
}

interface ProcessVideoOptions {
  videoBase64?: string;
  mimeType?: string;
  videoUrl?: string;
  scriptContext?: string;
  voiceProfile?: VoiceProfile;
}

const VIDEO_SYSTEM_INSTRUCTION = `Você é o Editor Chefe e Especialista em Vídeos Virais de Alta Retenção para Devs e Founders (Gabriel Bolonhez).
Sua missão é transformar um vídeo gravado (áudio/vídeo técnico de tela ou talking head) em uma peça de conteúdo viral completa para Instagram Reels, TikTok, LinkedIn e X.

DIRETRIZES DE RETENÇÃO E ENGENHARIA:
1. LEGENDA DINÂMICA (SUBTITLES):
- As legendas devem ser divididas em frases curtas de 2 a 5 palavras no máximo por bloco (pacing acelerado estilo Alex Hormozi / Ali Abdaal).
- Timestamps em segundos decimais exatos (ex: startSeconds: 0.0, endSeconds: 1.4).
- Identifique palavras de choque ou termos-chave para destaque visual (highlightWords), como métricas, ferramentas ou contradições.

2. DETECÇÃO DE PAUSAS / CORTE AUTOMÁTICO (JUMP-CUTS):
- Identifique pausas silenciosas, respirações longas (> 1.0s) ou hesitações ("éee", "humm") para corte cirúrgico.
- Indique os segundos de início e fim da pausa.

3. GANCHOS VISUAIS PARA O VÍDEO (HOOKS DE TELA):
- 3 opções de ganchos curtos para sobrepor no topo do vídeo nos primeiros 3 segundos.
- Hook 1: Contraintuitivo / Quebra de crença.
- Hook 2: Métrica ou resultado chocante.
- Hook 3: Pergunta / Interrupção de padrão.

4. COPY MULTIPLATAFORMA ADAPTADA:
- Instagram Reels: Gancho forte nas primeiras 2 linhas (antes do "...mais"), parágrafos respirados, chamada para ação no comentário para receber no direct ("Comente [PALAVRA] que te envio"), e palavra-chave recomendada (ex: CODIGO, VOX, REPO, GUIA).
- TikTok: Gancho visceral, texto ultra-conciso, hashtags de tech (#programacao #dev #ia #tecnologia).
- LinkedIn: Transformação do aprendizado do vídeo em um artigo de bastidores técnicos profundo (800 a 1.500 caracteres), tom de operador sênior sem clichês corporativos.
- X: Tweet único impactante com o núcleo da lição técnica.`;

export async function processRecordedVideo(options: ProcessVideoOptions): Promise<VideoAnalysisResult> {
  const { videoBase64, mimeType = 'video/mp4', videoUrl, scriptContext, voiceProfile } = options;

  let rawResult: any;

  if (videoBase64 && videoBase64.length > 50) {
    // Processamento multimodal direto com Gemini 2.5 Flash
    const prompt = `Analise este vídeo gravado com áudio em Português do Brasil.
Transcreva o áudio com timestamps precisos, detecte as pausas para corte, crie legendas dinâmicas, gere 3 ganchos de texto para sobrepor no vídeo e as copies para Instagram Reels, TikTok, LinkedIn e X.
Contexto adicional do criador: ${scriptContext || 'Vídeo de tecnologia, código ou bastidores de produto'}.

Retorne ESTRITAMENTE um JSON no seguinte formato:
{
  "title": "Título curto descritivo",
  "transcript": "Transcrição completa do que foi falado",
  "durationEstimateSeconds": 45,
  "cues": [
    {
      "id": 1,
      "start": "00:00.000",
      "end": "00:01.800",
      "startSeconds": 0.0,
      "endSeconds": 1.8,
      "text": "Você ainda edita vídeo na mão?",
      "highlightWords": ["edita", "mão"]
    }
  ],
  "cuts": [
    {
      "start": "00:04.200",
      "end": "00:05.600",
      "startSeconds": 4.2,
      "endSeconds": 5.6,
      "reason": "dead_air",
      "recommendation": "Cortar pausa de silêncio para acelerar ritmo"
    }
  ],
  "hooks": {
    "hook1": "Você ainda cria vídeo na mão? Essa IA gera animação em código.",
    "hook2": "De 4 horas editando para 30 segundos no terminal.",
    "hook3": "A ferramenta que ninguém no Brasil está usando ainda."
  },
  "captions": {
    "instagram": {
      "hookLine": "Você ainda edita vídeo na mão?",
      "caption": "Gancho forte...\\n\\nExplicação em 3 parágrafos curtos...\\n\\nComente CÓDIGO que te envio o repositório no direct.",
      "dmTriggerKeyword": "CODIGO",
      "hashtags": ["#programacao", "#ia", "#dev", "#tecnologia"]
    },
    "tiktok": {
      "hookLine": "Gerando vídeo com código puro no terminal",
      "caption": "Essa IA cria vídeos no estilo Vox usando código Remotion. Comente pra receber.",
      "hashtags": ["#dev", "#programacao", "#inteligenciaartificial", "#tech"]
    },
    "linkedin": {
      "headline": "Como automatizamos a geração de vídeo programático",
      "articleText": "Texto aprofundado com a lição técnica de bastidores..."
    },
    "x": {
      "tweetText": "Vídeo gerado 100% em código. Menos edição manual, mais automação na prática.",
      "threadFollowUp": "Stack usada: Remotion + Claude Code + Gemini."
    }
  }
}`;

    rawResult = await generateMultimodalJson<any>(
      [
        {
          inlineData: {
            mimeType,
            data: videoBase64,
          },
        },
        {
          text: prompt,
        },
      ],
      VIDEO_SYSTEM_INSTRUCTION
    );
  } else {
    // Processamento textual / contextual com base na URL ou roteiro fornecido
    const prompt = `O criador gravou um vídeo com as seguintes informações ou contexto:
URL / Arquivo: ${videoUrl || 'Vídeo gravado pelo operador'}
Contexto / Roteiro inicial: ${scriptContext || 'Demonstração de ferramenta de IA, código no terminal e engenharia de software na prática'}
Criador: ${voiceProfile?.creator_name || 'Gabriel Bolonhez'} (${voiceProfile?.headline || 'Software Engineer'})

Gere a estrutura completa de edição, transcrição simulada com timestamps para legendagem dinâmica, pontos de jump-cut, 3 ganchos para o topo do vídeo e copies otimizadas para Instagram Reels, TikTok, LinkedIn e X.

Retorne ESTRITAMENTE um JSON seguindo exatamente a mesma interface estruturada.`;

    rawResult = await generateJson<any>(prompt, VIDEO_SYSTEM_INSTRUCTION);
  }

  // Normalização e validação das legendas
  const cues: VideoSubtitleCue[] = (rawResult.cues || []).map((c: any, idx: number) => {
    const startSec = typeof c.startSeconds === 'number' ? c.startSeconds : idx * 2.0;
    const endSec = typeof c.endSeconds === 'number' ? c.endSeconds : startSec + 1.8;
    return {
      id: idx + 1,
      start: c.start || secondsToVttTimestamp(startSec),
      end: c.end || secondsToVttTimestamp(endSec),
      startSeconds: Number(startSec.toFixed(2)),
      endSeconds: Number(endSec.toFixed(2)),
      text: String(c.text || '').trim(),
      highlightWords: Array.isArray(c.highlightWords) ? c.highlightWords : [],
    };
  });

  const cuts: VideoCutSegment[] = (rawResult.cuts || []).map((cut: any) => ({
    start: cut.start || `${(cut.startSeconds || 0).toFixed(1)}s`,
    end: cut.end || `${(cut.endSeconds || 0).toFixed(1)}s`,
    startSeconds: Number(cut.startSeconds || 0),
    endSeconds: Number(cut.endSeconds || 0),
    reason: cut.reason || 'dead_air',
    recommendation: cut.recommendation || 'Remover pausa para acelerar o ritmo',
  }));

  const durationEstimate = rawResult.durationEstimateSeconds || (cues.length > 0 ? cues[cues.length - 1].endSeconds : 45);

  const srtContent = buildSrtFromCues(cues);
  const vttContent = buildVttFromCues(cues);
  const ffmpegCutCommand = buildFfmpegCutCommand(cuts, durationEstimate);

  return {
    title: rawResult.title || 'Vídeo Técnico Curto',
    transcript: rawResult.transcript || cues.map((c) => c.text).join(' '),
    cues,
    cuts,
    durationEstimateSeconds: durationEstimate,
    srtContent,
    vttContent,
    ffmpegCutCommand,
    hooks: {
      hook1: rawResult.hooks?.hook1 || 'Você ainda faz isso na mão?',
      hook2: rawResult.hooks?.hook2 || 'De horas de trabalho para 30 segundos com IA.',
      hook3: rawResult.hooks?.hook3 || 'O que ninguém te conta sobre essa stack.',
    },
    captions: {
      instagram: {
        hookLine: rawResult.captions?.instagram?.hookLine || rawResult.hooks?.hook1 || 'Vídeo na prática',
        caption: rawResult.captions?.instagram?.caption || rawResult.transcript || '',
        dmTriggerKeyword: (rawResult.captions?.instagram?.dmTriggerKeyword || 'CODIGO').toUpperCase().replace(/[^A-Z0-9]/g, ''),
        hashtags: rawResult.captions?.instagram?.hashtags || ['#programacao', '#dev', '#ia'],
      },
      tiktok: {
        hookLine: rawResult.captions?.tiktok?.hookLine || rawResult.hooks?.hook1 || 'Tutorial Dev',
        caption: rawResult.captions?.tiktok?.caption || '',
        hashtags: rawResult.captions?.tiktok?.hashtags || ['#programacao', '#dev', '#tecnologia'],
      },
      linkedin: {
        headline: rawResult.captions?.linkedin?.headline || rawResult.title || 'Arquitetura e IA',
        articleText: rawResult.captions?.linkedin?.articleText || rawResult.transcript || '',
      },
      x: {
        tweetText: rawResult.captions?.x?.tweetText || rawResult.hooks?.hook1 || '',
        threadFollowUp: rawResult.captions?.x?.threadFollowUp,
      },
    },
  };
}
