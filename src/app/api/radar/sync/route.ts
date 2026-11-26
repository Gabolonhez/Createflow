import { NextRequest, NextResponse } from 'next/server';
import {
  getConnectionsConfig,
  getMonitoredProfiles,
  saveMonitoredProfile,
  upsertCapturedPosts,
} from '@/lib/db';
import { syncProfileViaApify } from '@/lib/radar-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { profileId?: string };
    const connections = await getConnectionsConfig();
    const apifyToken = connections.apify_api_token || process.env.APIFY_API_TOKEN || '';

    if (!apifyToken.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Token da Apify não configurado. Use a Extensão Chrome gratuitamente ou configure seu Apify API Token em Conexões.',
        },
        { status: 400 }
      );
    }

    const profiles = await getMonitoredProfiles();
    const targets = body.profileId
      ? profiles.filter((p) => p.id === body.profileId)
      : profiles;

    if (targets.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Nenhum perfil monitorado encontrado para sincronizar.' },
        { status: 404 }
      );
    }

    let importedTotal = 0;
    let updatedTotal = 0;
    const errors: Array<{ handle: string; platform: string; error: string }> = [];

    for (const profile of targets) {
      try {
        const synced = await syncProfileViaApify(profile, apifyToken);
        if (synced.profilePatch) {
          await saveMonitoredProfile({
            ...profile,
            ...synced.profilePatch,
          });
        }
        const upserted = await upsertCapturedPosts(synced.posts, {
          source: 'radar',
          platform: profile.platform,
          profileId: profile.id,
          defaultAuthorHandle: profile.handle,
        });
        importedTotal += upserted.importedCount;
        updatedTotal += upserted.updatedCount;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro desconhecido ao sincronizar perfil.';
        errors.push({ handle: profile.handle, platform: profile.platform, error: msg });
      }
    }

    return NextResponse.json({
      success: errors.length < targets.length,
      syncedProfiles: targets.length - errors.length,
      importedCount: importedTotal,
      updatedCount: updatedTotal,
      errors,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha na sincronização do Radar.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
