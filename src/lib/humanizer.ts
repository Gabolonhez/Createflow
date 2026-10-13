/**
 * Humanizer & Anti-AI Watermark Sanitizer
 * Inspired by Jakeschincariol/linkedin-agent-skill & stop-slop heuristics.
 *
 * LLMs (Gemini, ChatGPT, Claude) frequently inject:
 * 1. Zero-width spaces & invisible unicode watermarking tags (e.g. \u200B, \u2060, \uFEFF, \u00AD, Unicode tags)
 * 2. Overused em-dashes ("—") instead of natural punctuation/spacing
 * 3. Dead synthetic buzzwords ("delve", "game-changer", "tapestry", "mergulhe", "alavanque")
 *
 * LinkedIn and X algorithms actively detect and suppress reach for posts flagged with these markers.
 * This utility sterilizes text to guarantee 100% human-like delivery and zero algorithmic penalties.
 */

// Invisible characters and zero-width unicode markers commonly injected by LLMs
const INVISIBLE_CHARS_REGEX = /[\u200B\u200C\u200D\u2060\uFEFF\u00AD\u200E\u200F\u202A-\u202E\u{E0000}-\u{E007F}]/gu;

// Non-standard unusual spaces normalized to standard spaces
const UNUSUAL_SPACES_REGEX = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

// Em-dash and en-dash variations
const EM_DASH_REGEX = /—/g;
const EN_DASH_SPACED_REGEX = / – /g;

// High-confidence dead AI buzzwords that signal synthetic generation
const DEAD_AI_WORDS_PT = [
  'mergulhe',
  'mergulhar',
  'mergulhando',
  'desvende',
  'desvendar',
  'alavanque',
  'alavancar',
  'alavancando',
  'divisor de águas',
  'no mundo de hoje',
  'no cenário atual',
  'cenário em constante evolução',
  'revolucionário',
  'testemunho de',
  'farol de',
  'potencializar',
  'de suma importância',
  'em última análise',
  'tecido de',
  'tapeçaria de',
  'gratidão imensa',
  'humildemente',
];

const DEAD_AI_WORDS_EN = [
  'delve',
  'delving',
  'game-changer',
  'game changer',
  'tapestry',
  'testament',
  'revolutionize',
  'revolutionizing',
  'beacon',
  'foster',
  'fostering',
  'crucial',
  'pivotal',
  'in today\'s digital landscape',
  'in today\'s fast-paced world',
  'unlock the power',
  'seamlessly',
  'ever-evolving',
  'resonate',
  'vibrant',
  'unwavering',
  'spearhead',
  'moreover',
  'furthermore',
];

export interface AiDetectionResult {
  score: number; // 0 to 100 (0 = 100% human, 100 = synthetic/flagged)
  watermarksCount: number;
  emDashesCount: number;
  detectedBuzzwords: string[];
  isFlagged: boolean;
  summary: string;
}

export interface HumanizeOptions {
  cleanWatermarks?: boolean;
  normalizeDashes?: boolean;
  cleanBuzzwords?: boolean;
}

export interface HumanizeResult {
  text: string;
  changesCount: number;
  strippedWatermarks: number;
  replacedDashes: number;
  cleanedBuzzwordsCount: number;
  previousScore: number;
  currentScore: number;
}

/**
 * Detects invisible AI watermarks, em-dashes and dead AI vocabulary.
 */
export function detectAiMarkers(text: string): AiDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      score: 0,
      watermarksCount: 0,
      emDashesCount: 0,
      detectedBuzzwords: [],
      isFlagged: false,
      summary: 'Texto vazio',
    };
  }

  // 1. Check for invisible watermarks
  const invisibleMatches = text.match(INVISIBLE_CHARS_REGEX) || [];
  const watermarksCount = invisibleMatches.length;

  // 2. Check for em-dashes
  const emDashMatches = text.match(EM_DASH_REGEX) || [];
  const emDashesCount = emDashMatches.length;

  // 3. Check for dead AI vocabulary
  const lower = text.toLowerCase();
  const allBuzzwords = [...DEAD_AI_WORDS_PT, ...DEAD_AI_WORDS_EN];
  const detectedBuzzwords: string[] = [];

  for (const word of allBuzzwords) {
    // Word boundary check
    const regex = new RegExp(`\\b${word.replace(/'/g, "\\'")}\\b`, 'i');
    if (regex.test(lower)) {
      if (!detectedBuzzwords.includes(word)) {
        detectedBuzzwords.push(word);
      }
    }
  }

  // Calculate composite synthetic score (0 to 100)
  // Invisible characters are a severe penalty (each counts 30 pts)
  // Em-dashes count 15 pts each
  // Buzzwords count 20 pts each
  let rawScore = (watermarksCount * 30) + (emDashesCount * 15) + (detectedBuzzwords.length * 20);
  const score = Math.min(100, rawScore);
  const isFlagged = score >= 25;

  let summary = '100% Humano e limpo';
  if (watermarksCount > 0) {
    summary = `${watermarksCount} caractere(s) invisível(is) detectado(s)`;
  } else if (emDashesCount > 0 && detectedBuzzwords.length > 0) {
    summary = `Travessões (—) e ${detectedBuzzwords.length} clichê(s) de IA detectados`;
  } else if (emDashesCount > 0) {
    summary = `${emDashesCount} travessão(ões) de IA (—) detectado(s)`;
  } else if (detectedBuzzwords.length > 0) {
    summary = `${detectedBuzzwords.length} clichê(s) de IA detectado(s)`;
  }

  return {
    score,
    watermarksCount,
    emDashesCount,
    detectedBuzzwords,
    isFlagged,
    summary,
  };
}

/**
 * Sanitizes and humanizes content:
 * - Strips all zero-width characters and invisible tags
 * - Normalizes unusual unicode whitespace
 * - Replaces AI em-dashes with natural punctuation/hyphens
 * - Optionally replaces common dead buzzwords with plain-spoken language
 */
export function humanizeText(text: string, options: HumanizeOptions = {}): HumanizeResult {
  if (!text) {
    return {
      text: '',
      changesCount: 0,
      strippedWatermarks: 0,
      replacedDashes: 0,
      cleanedBuzzwordsCount: 0,
      previousScore: 0,
      currentScore: 0,
    };
  }

  const {
    cleanWatermarks = true,
    normalizeDashes = true,
    cleanBuzzwords = true,
  } = options;

  const initialDetection = detectAiMarkers(text);
  let result = text;
  let strippedWatermarks = 0;
  let replacedDashes = 0;
  let cleanedBuzzwordsCount = 0;

  // 1. Remove invisible zero-width and tag characters
  if (cleanWatermarks) {
    const prevLen = result.length;
    result = result.replace(INVISIBLE_CHARS_REGEX, '');
    strippedWatermarks = prevLen - result.length;

    // Normalize unusual unicode whitespace
    result = result.replace(UNUSUAL_SPACES_REGEX, ' ');
  }

  // 2. Normalize AI em-dashes ("—")
  if (normalizeDashes) {
    // " — " with spaces on both sides -> replace with " - "
    const countSpaced = (result.match(/ — /g) || []).length;
    result = result.replace(/ — /g, ' - ');

    // "—" glued to words -> replace with ", " or " - "
    const countGlued = (result.match(EM_DASH_REGEX) || []).length;
    result = result.replace(EM_DASH_REGEX, ' - ');

    // Spaced en-dashes " – " -> standard " - "
    result = result.replace(EN_DASH_SPACED_REGEX, ' - ');

    replacedDashes = countSpaced + countGlued;
  }

  // 3. Clean obvious dead AI buzzwords when requested
  if (cleanBuzzwords) {
    // Replacements map for cleaner human operator vocabulary
    const replacements: Record<string, string> = {
      // PT
      'mergulhe': 'olhe a fundo',
      'mergulhar': 'entender',
      'divisor de águas': 'mudança real',
      'game-changer': 'diferencial',
      'game changer': 'diferencial',
      'alavanque': 'acelere',
      'alavancar': 'escalar',
      'no mundo de hoje': 'na prática',
      'no cenário atual': 'no dia a dia',
      'revolucionário': 'fora da curva',
      'de suma importância': 'crítico',
      'em última análise': 'no fim do dia',

      // EN
      'delve into': 'examine',
      'delve': 'dig into',
      'tapestry of': 'mix of',
      'testament to': 'proof of',
      'revolutionize': 'transform',
      'in today\'s fast-paced world': 'in production',
      'in today\'s digital landscape': 'right now',
      'unlock the power of': 'leverage',
      'seamlessly': 'cleanly',
      'moreover,': 'also,',
      'furthermore,': 'and,',
    };

    for (const [aiWord, humanWord] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${aiWord.replace(/'/g, "\\'")}\\b`, 'gi');
      const matches = result.match(regex);
      if (matches && matches.length > 0) {
        cleanedBuzzwordsCount += matches.length;
        result = result.replace(regex, humanWord);
      }
    }
  }

  // Clean trailing spaces on lines
  result = result
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n');

  const finalDetection = detectAiMarkers(result);
  const changesCount = strippedWatermarks + replacedDashes + cleanedBuzzwordsCount;

  return {
    text: result,
    changesCount,
    strippedWatermarks,
    replacedDashes,
    cleanedBuzzwordsCount,
    previousScore: initialDetection.score,
    currentScore: finalDetection.score,
  };
}
