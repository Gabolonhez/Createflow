import { generateMultimodalJson } from './gemini';
import type {
  CapturedMediaType,
  CapturedPost,
  MonitoredProfile,
  Platform,
  RadarIngestPostInput,
} from '@/types';

const APIFY_BASE_URL = 'https://api.apify.com/v2';

/**
 * Parses compact metric strings (e.g. "1,2 mil", "14.5K", "2,3M", "1.204") or numbers into a non-negative integer.
 */
export function parseCompactMetric(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }
  if (typeof value !== 'string') return 0;

  const raw = value.trim().toLowerCase();
  if (!raw) return 0;

  const multiplierMatch = raw.match(/(milhão|milhões|mil|k|m|b)\b/);
  let multiplier = 1;
  if (multiplierMatch) {
    const unit = multiplierMatch[1];
    if (unit === 'mil' || unit === 'k') multiplier = 1_000;
    else if (unit === 'm' || unit === 'milhão' || unit === 'milhões') multiplier = 1_000_000;
    else if (unit === 'b') multiplier = 1_000_000_000;
  }

  let numericPart = raw.replace(/[^0-9.,]/g, '');
  if (!numericPart) return 0;

  if (multiplier > 1) {
    // Decimal separator when paired with suffix (e.g. "1,2 mil" -> 1.2)
    numericPart = numericPart.replace(',', '.');
    const parsed = parseFloat(numericPart);
    return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * multiplier) : 0;
  }

  // Without suffix, dots/commas with 3 trailing digits are thousand separators (e.g. "1.204")
  if (/^\d{1,3}([.,]\d{3})+$/.test(numericPart)) {
    const cleanInt = parseInt(numericPart.replace(/[.,]/g, ''), 10);
    return Number.isFinite(cleanInt) && cleanInt > 0 ? cleanInt : 0;
  }

  const normalized = parseFloat(numericPart.replace(',', '.'));
  return Number.isFinite(normalized) && normalized > 0 ? Math.round(normalized) : 0;
}

/**
 * Computes weighted engagement score prioritizing comments and shares over passive views.
 */
export function computeEngagementScore(metrics: {
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
}): number {
  const likes = Math.max(0, Number(metrics.likesCount) || 0);
  const comments = Math.max(0, Number(metrics.commentsCount) || 0);
  const shares = Math.max(0, Number(metrics.sharesCount) || 0);
  const views = Math.max(0, Number(metrics.viewsCount) || 0);
  return likes + comments * 3 + shares * 4 + Math.round(views * 0.02);
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Groups captured posts by profile/author and calculates each post's outlier multiplier vs the group median.
 */
export function recalculateOutlierScores(posts: CapturedPost[]): {
  posts: CapturedPost[];
  profileBaselines: Record<string, number>;
} {
  const grouped = new Map<string, number[]>();

  const enriched = posts.map((post) => {
    const engagementScore = computeEngagementScore({
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      viewsCount: post.viewsCount,
      sharesCount: post.sharesCount,
    });
    const groupKey =
      post.profileId ||
      `${post.platform}:${(post.authorHandle || post.authorName || 'unknown').replace(/^@/, '').toLowerCase()}`;

    const scores = grouped.get(groupKey) || [];
    scores.push(engagementScore);
    grouped.set(groupKey, scores);

    return {
      ...post,
      engagementScore,
      _groupKey: groupKey,
    };
  });

  const profileBaselines: Record<string, number> = {};
  for (const [key, scores] of grouped.entries()) {
    const nonZero = scores.filter((s) => s > 0);
    const baseline = nonZero.length > 0 ? computeMedian(nonZero) : computeMedian(scores);
    profileBaselines[key] = Math.round(baseline * 100) / 100;
  }

  const scoredPosts: CapturedPost[] = enriched.map(({ _groupKey, ...post }) => {
    const scores = grouped.get(_groupKey) || [];
    if (scores.length < 2) {
      return { ...post, outlierScore: 1.0 };
    }
    const baseline = Math.max(1, profileBaselines[_groupKey] || 1);
    const rawRatio = post.engagementScore / baseline;
    const outlierScore = Math.min(99.9, Math.max(0.1, Math.round(rawRatio * 10) / 10));
    return {
      ...post,
      outlierScore,
    };
  });

  return {
    posts: scoredPosts,
    profileBaselines,
  };
}

interface ExtractedScreenshotPayload {
  captionText: string;
  authorHandle?: string;
  platform?: Platform;
  hookSummary?: string;
}

/**
 * Extracts caption, author handle, platform and hook summary from a base64 image data URL using Gemini Vision.
 */
export async function extractTextFromScreenshot(base64DataUrl: string): Promise<ExtractedScreenshotPayload> {
  const match = base64DataUrl.match(/^data:([^;]+);base64,(.+)$/);
  const mimeType = match ? match[1] : 'image/png';
  const data = match ? match[2] : base64DataUrl;

  if (!data || data.length < 32) {
    throw new Error('Imagem inválida ou vazia para análise.');
  }

  const prompt = `Analise este print/imagem de um post ou carrossel de rede social (Instagram, LinkedIn, X ou TikTok).
Extraia exatamente todo o texto visível da legenda ou slides, identifique a rede social e o @ do autor se aparecerem, e escreva um resumo curto de 1 linha explicando por que o gancho chama atenção.

Responda estritamente no formato JSON:
{
  "captionText": "texto completo extraído do post/carrossel preservando quebras de linha",
  "authorHandle": "handle_sem_arroba ou vazio",
  "platform": "instagram" | "linkedin" | "x" | "tiktok",
  "hookSummary": "resumo de 1 frase do gancho principal"
}`;

  const parsed = await generateMultimodalJson<Partial<ExtractedScreenshotPayload>>([
    {
      inlineData: {
        mimeType,
        data,
      },
    },
    { text: prompt },
  ]);

  const validPlatform: Platform | undefined =
    parsed.platform === 'instagram' ||
    parsed.platform === 'linkedin' ||
    parsed.platform === 'x' ||
    parsed.platform === 'tiktok'
      ? parsed.platform
      : undefined;

  return {
    captionText: (parsed.captionText || '').trim(),
    authorHandle: parsed.authorHandle?.replace(/^@/, '').trim() || undefined,
    platform: validPlatform,
    hookSummary: parsed.hookSummary?.trim() || undefined,
  };
}

type JsonRecord = Record<string, unknown>;

function readString(obj: JsonRecord, keys: string[]): string | undefined {
  for (const k of keys) {
    const val = obj[k];
    if (typeof val === 'string' && val.trim().length > 0) {
      return val.trim();
    }
  }
  return undefined;
}

function readMetric(obj: JsonRecord, keys: string[]): number {
  for (const k of keys) {
    const val = obj[k];
    if (val !== undefined && val !== null) {
      const parsed = parseCompactMetric(val);
      if (parsed > 0 || val === 0 || val === '0') return parsed;
    }
  }
  return 0;
}

function inferMediaType(platform: Platform, raw: JsonRecord): CapturedMediaType {
  const typeStr = (readString(raw, ['type', 'mediaType', 'productType', 'postType']) || '').toLowerCase();
  if (typeStr.includes('reel') || typeStr.includes('clips') || platform === 'tiktok') return 'reel';
  if (typeStr.includes('video')) return 'video';
  if (typeStr.includes('sidecar') || typeStr.includes('carousel')) return 'carousel';
  if (raw.childPosts && Array.isArray(raw.childPosts) && raw.childPosts.length > 1) return 'carousel';
  if (readString(raw, ['videoUrl', 'video_url'])) return platform === 'instagram' ? 'reel' : 'video';
  if (readString(raw, ['displayUrl', 'imageUrl', 'thumbnailUrl', 'mediaUrl'])) return 'image';
  return 'text';
}

function normalizeApifyItem(
  profile: MonitoredProfile,
  raw: JsonRecord
): (RadarIngestPostInput & { platform: Platform }) | null {
  const captionText =
    readString(raw, [
      'caption',
      'text',
      'fullText',
      'full_text',
      'commentary',
      'postText',
      'description',
      'title',
    ]) || '';

  const postUrl =
    readString(raw, ['url', 'postUrl', 'permalink', 'link', 'webVideoUrl']) ||
    (readString(raw, ['shortCode']) && profile.platform === 'instagram'
      ? `https://www.instagram.com/p/${readString(raw, ['shortCode'])}/`
      : undefined);

  if (!captionText && !postUrl) return null;

  const cleanHandle = profile.handle.replace(/^@/, '');
  const likesCount = readMetric(raw, [
    'likesCount',
    'likeCount',
    'numLikes',
    'favoriteCount',
    'diggCount',
    'reactionsCount',
  ]);
  const commentsCount = readMetric(raw, [
    'commentsCount',
    'commentCount',
    'numComments',
    'replyCount',
  ]);
  const viewsCount = readMetric(raw, [
    'videoViewCount',
    'videoPlayCount',
    'viewCount',
    'viewsCount',
    'playCount',
  ]);
  const sharesCount = readMetric(raw, [
    'sharesCount',
    'shareCount',
    'numShares',
    'repostCount',
    'retweetCount',
  ]);

  return {
    platform: profile.platform,
    postUrl: postUrl || null,
    externalId: readString(raw, ['id', 'shortCode', 'urn']) || null,
    authorName:
      readString(raw, ['ownerFullName', 'authorName', 'name']) ||
      profile.displayName ||
      cleanHandle,
    authorHandle:
      (readString(raw, ['ownerUsername', 'authorHandle', 'username']) || cleanHandle).replace(/^@/, ''),
    captionText: captionText || '(Post sem legenda textual)',
    mediaType: inferMediaType(profile.platform, raw),
    mediaUrl:
      readString(raw, ['displayUrl', 'thumbnailUrl', 'imageUrl', 'coverUrl', 'mediaUrl']) || null,
    likesCount,
    commentsCount,
    viewsCount,
    sharesCount,
    publishedAt: readString(raw, ['timestamp', 'createdAt', 'postedAt', 'date']) || null,
  };
}

function buildApifyActorRequest(profile: MonitoredProfile): {
  actorId: string;
  input: Record<string, unknown>;
} {
  const cleanHandle = profile.handle.replace(/^@/, '').trim();
  switch (profile.platform) {
    case 'instagram':
      return {
        actorId: 'apify~instagram-post-scraper',
        input: {
          username: [cleanHandle],
          resultsLimit: 12,
        },
      };
    case 'linkedin': {
      const targetUrl =
        profile.profileUrl && profile.profileUrl.startsWith('http')
          ? profile.profileUrl
          : `https://www.linkedin.com/in/${cleanHandle}/`;
      return {
        actorId: 'harvestapi~linkedin-profile-posts',
        input: {
          targetUrls: [targetUrl],
          maxPosts: 12,
        },
      };
    }
    case 'x':
      return {
        actorId: 'apidojo~tweet-scraper',
        input: {
          twitterHandles: [cleanHandle],
          maxItems: 12,
        },
      };
    case 'tiktok':
      return {
        actorId: 'clockworks~tiktok-scraper',
        input: {
          profiles: [cleanHandle],
          resultsPerPage: 12,
        },
      };
  }
}

/**
 * Syncs public posts from a monitored profile using the user's Apify API token.
 */
export async function syncProfileViaApify(
  profile: MonitoredProfile,
  apifyToken: string
): Promise<{
  posts: (RadarIngestPostInput & { platform: Platform })[];
  profilePatch?: Partial<MonitoredProfile>;
}> {
  const token = apifyToken.trim();
  if (!token) {
    throw new Error('Token da Apify não configurado. Adicione em Conexões ou no Setup do Radar.');
  }

  const { actorId, input } = buildApifyActorRequest(profile);
  const endpoint = `${APIFY_BASE_URL}/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=60`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(65_000),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Falha na Apify (${res.status}) para @${profile.handle}: ${errText.slice(0, 180) || res.statusText}`);
  }

  const rawData: unknown = await res.json();
  if (!Array.isArray(rawData)) {
    throw new Error(`Resposta inesperada da Apify para @${profile.handle}.`);
  }

  const items = rawData.filter((entry): entry is JsonRecord => Boolean(entry) && typeof entry === 'object');
  const posts: (RadarIngestPostInput & { platform: Platform })[] = [];

  for (const item of items) {
    const normalized = normalizeApifyItem(profile, item);
    if (normalized) posts.push(normalized);
  }

  const first = items[0];
  const profilePatch: Partial<MonitoredProfile> | undefined = first
    ? {
        displayName:
          readString(first, ['ownerFullName', 'authorName']) || profile.displayName || undefined,
        followersCount:
          readMetric(first, ['followersCount', 'ownerFollowersCount', 'authorFollowersCount']) ||
          profile.followersCount,
        lastSyncedAt: new Date().toISOString(),
      }
    : { lastSyncedAt: new Date().toISOString() };

  return { posts, profilePatch };
}
