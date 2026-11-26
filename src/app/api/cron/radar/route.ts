import { NextResponse } from 'next/server';
import {
  getConnectionsConfig,
  getMonitoredProfiles,
  saveMonitoredProfile,
  upsertCapturedPosts,
} from '@/lib/db';
import { syncProfileViaApify } from '@/lib/radar-engine';

export const dynamic = 'force-dynamic';

/**
 * Daily cron job to sync monitored profiles via Apify when APIFY_API_TOKEN is configured.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      const url = new URL(request.url);
      const queryKey = url.searchParams.get('key');
      if (queryKey !== cronSecret) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
    }

    const connections = await getConnectionsConfig();
    const apifyToken = connections.apify_api_token || process.env.APIFY_API_TOKEN || '';

    if (!apifyToken.trim()) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'APIFY_API_TOKEN não configurado; sincronização via Extensão Chrome continua disponível.',
        timestamp: new Date().toISOString(),
      });
    }

    const profiles = await getMonitoredProfiles();
    if (profiles.length === 0) {
      return NextResponse.json({
        success: true,
        syncedProfiles: 0,
        importedCount: 0,
        timestamp: new Date().toISOString(),
      });
    }

    let importedCount = 0;
    let syncedProfiles = 0;
    const errors: Array<{ handle: string; error: string }> = [];

    for (const profile of profiles) {
      try {
        const synced = await syncProfileViaApify(profile, apifyToken);
        if (synced.profilePatch) {
          await saveMonitoredProfile({ ...profile, ...synced.profilePatch });
        }
        const upserted = await upsertCapturedPosts(synced.posts, {
          source: 'radar',
          platform: profile.platform,
          profileId: profile.id,
          defaultAuthorHandle: profile.handle,
        });
        importedCount += upserted.importedCount;
        syncedProfiles += 1;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        errors.push({ handle: profile.handle, error: msg });
      }
    }

    return NextResponse.json({
      success: true,
      syncedProfiles,
      importedCount,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha no cron do Radar.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
