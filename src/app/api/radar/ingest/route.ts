import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  getConnectionsConfig,
  saveMonitoredProfile,
  upsertCapturedPosts,
} from '@/lib/db';
import type {
  CapturedMediaType,
  CapturedPostSource,
  Platform,
  RadarIngestPayload,
  RadarIngestPostInput,
} from '@/types';

export const dynamic = 'force-dynamic';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CreateFlow-Token',
};

function timingSafeMatch(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const a = Buffer.from(provided.trim());
  const b = Buffer.from(expected.trim());
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function isValidPlatform(val: unknown): val is Platform {
  return val === 'instagram' || val === 'linkedin' || val === 'x' || val === 'tiktok';
}

function isValidMediaType(val: unknown): val is CapturedMediaType {
  return val === 'reel' || val === 'carousel' || val === 'image' || val === 'text' || val === 'video';
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const customToken = req.headers.get('x-createflow-token') || '';
    const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
      ? authHeader.slice(7).trim()
      : '';
    const providedToken = bearerToken || customToken.trim();

    const connections = await getConnectionsConfig();
    const expectedToken = connections.radar_ingest_token || process.env.RADAR_INGEST_TOKEN || '';

    if (!expectedToken || !timingSafeMatch(providedToken, expectedToken)) {
      return NextResponse.json(
        { success: false, error: 'Token de ingestão inválido ou ausente.' },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const body = (await req.json().catch(() => null)) as Partial<RadarIngestPayload> | null;
    if (!body || !Array.isArray(body.posts) || body.posts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Envie uma lista válida de posts em { source, posts }.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const source: CapturedPostSource =
      body.source === 'radar' || body.source === 'dm_share' ? body.source : 'saved';

    let profileId: string | null = null;
    let defaultPlatform: Platform = 'instagram';
    let defaultAuthorHandle: string | null = null;

    if (body.profile && body.profile.handle && isValidPlatform(body.profile.platform)) {
      defaultPlatform = body.profile.platform;
      defaultAuthorHandle = body.profile.handle.replace(/^@/, '').trim();

      if (source === 'radar') {
        const savedProfile = await saveMonitoredProfile({
          platform: body.profile.platform,
          handle: defaultAuthorHandle,
          displayName: body.profile.displayName || undefined,
          profileUrl: body.profile.profileUrl || undefined,
          avatarUrl: body.profile.avatarUrl || undefined,
          nicheTag: body.profile.nicheTag || undefined,
          followersCount: body.profile.followersCount ?? 0,
        });
        profileId = savedProfile.id;
      }
    }

    const sanitizedPosts: RadarIngestPostInput[] = body.posts
      .filter((p): p is RadarIngestPostInput => Boolean(p) && typeof p === 'object')
      .map((p) => ({
        postUrl: p.postUrl || null,
        externalId: p.externalId || null,
        authorName: p.authorName || null,
        authorHandle: p.authorHandle || defaultAuthorHandle || null,
        captionText: String(p.captionText || '').trim(),
        mediaType: isValidMediaType(p.mediaType) ? p.mediaType : 'text',
        mediaUrl: p.mediaUrl || null,
        likesCount: p.likesCount ?? 0,
        commentsCount: p.commentsCount ?? 0,
        viewsCount: p.viewsCount ?? 0,
        sharesCount: p.sharesCount ?? 0,
        publishedAt: p.publishedAt || null,
        aiHookSummary: p.aiHookSummary || null,
        platform: isValidPlatform(p.platform) ? p.platform : defaultPlatform,
      }));

    const result = await upsertCapturedPosts(sanitizedPosts, {
      source,
      platform: defaultPlatform,
      profileId,
      defaultAuthorHandle,
    });

    return NextResponse.json(
      {
        success: true,
        source,
        profileId,
        importedCount: result.importedCount,
        updatedCount: result.updatedCount,
        totalCaptured: result.posts.length,
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno ao ingerir posts no Radar.';
    console.error('[API /radar/ingest] Erro:', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
