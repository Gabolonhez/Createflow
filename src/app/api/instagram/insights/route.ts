import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type {
  InstagramInsightsPayload,
  InstagramAccountStats,
  InstagramKpis,
  InstagramFunnelStats,
  InstagramMediaItemWithInsights,
  InstagramMetricTimeSeries,
} from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Obter token ativo do Instagram no Supabase
    let accessToken: string | null = null;
    let userId: string | null = null;

    const { data: config } = await supabase
      .from('config')
      .select('access_token, instagram_user_id')
      .eq('id', 'instagram_config')
      .single();

    if (config?.access_token) {
      accessToken = config.access_token;
      userId = config.instagram_user_id;
    } else {
      const { getConnectionsConfig } = await import('@/lib/db');
      const conn = await getConnectionsConfig();
      if (conn?.instagram_access_token) {
        accessToken = conn.instagram_access_token;
        userId = conn.instagram_user_id || null;
      }
    }

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Instagram não está conectado. Conecte sua conta em Conexões.',
        },
        { status: 400 }
      );
    }

    // 2. Buscar Dados do Perfil da Conta via Meta Graph API v25.0
    const profileUrl = `https://graph.instagram.com/v25.0/me?fields=id,username,name,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`;
    const profileRes = await fetch(profileUrl);

    if (!profileRes.ok) {
      const err = await profileRes.json().catch(() => ({}));
      console.error('[Instagram Insights API] Erro ao buscar perfil:', err);
      return NextResponse.json(
        {
          success: false,
          error: err.error?.message || 'Falha ao buscar perfil na Meta Graph API',
        },
        { status: profileRes.status }
      );
    }

    const profileData = await profileRes.json();
    const account: InstagramAccountStats = {
      id: profileData.id || userId || '',
      username: profileData.username || 'gabolonhez',
      name: profileData.name || 'Gabriel Bolonhez',
      accountType: profileData.account_type || 'MEDIA_CREATOR',
      profilePictureUrl: profileData.profile_picture_url,
      followersCount: profileData.followers_count || 0,
      followsCount: profileData.follows_count || 0,
      mediaCount: profileData.media_count || 0,
    };

    // 3. Buscar Métricas de Nível de Conta (Insights Totais e Série Temporal)
    let kpis: InstagramKpis = {
      reach: 0,
      views: 0,
      totalInteractions: 0,
      accountsEngaged: 0,
      profileViews: 0,
      engagementRate: 0,
    };

    const dailyReach: InstagramMetricTimeSeries[] = [];

    try {
      // Totais dos últimos 28 dias
      const totalsUrl = `https://graph.instagram.com/v25.0/me/insights?metric=reach,total_interactions,accounts_engaged,profile_views,views&metric_type=total_value&period=days_28&access_token=${accessToken}`;
      const totalsRes = await fetch(totalsUrl);
      if (totalsRes.ok) {
        const totalsJson = await totalsRes.json();
        const metricsMap: Record<string, number> = {};
        (totalsJson.data || []).forEach((item: any) => {
          metricsMap[item.name] = item.total_value?.value || 0;
        });

        kpis.reach = metricsMap['reach'] || 0;
        kpis.views = metricsMap['views'] || 0;
        kpis.totalInteractions = metricsMap['total_interactions'] || 0;
        kpis.accountsEngaged = metricsMap['accounts_engaged'] || 0;
        kpis.profileViews = metricsMap['profile_views'] || 0;
        kpis.engagementRate =
          kpis.reach > 0
            ? Number(((kpis.totalInteractions / kpis.reach) * 100).toFixed(1))
            : 0;
      }

      // Série temporal diária de Alcance
      const timeseriesUrl = `https://graph.instagram.com/v25.0/me/insights?metric=reach&period=day&access_token=${accessToken}`;
      const timeseriesRes = await fetch(timeseriesUrl);
      if (timeseriesRes.ok) {
        const timeseriesJson = await timeseriesRes.json();
        const values = timeseriesJson.data?.[0]?.values || [];
        values.forEach((v: any) => {
          dailyReach.push({
            date: v.end_time ? v.end_time.split('T')[0] : '',
            value: v.value || 0,
          });
        });
      }
    } catch (insightsErr) {
      console.warn('[Instagram Insights API] Aviso ao buscar métricas de conta:', insightsErr);
    }

    // 4. Buscar Mídias Recentes e Insights Individuais (Reels, Vídeos, Fotos)
    const mediaLimit = req.nextUrl.searchParams.get('limit') || '12';
    const mediaUrl = `https://graph.instagram.com/v25.0/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count&limit=${mediaLimit}&access_token=${accessToken}`;
    
    let mediaItems: any[] = [];
    try {
      const mediaRes = await fetch(mediaUrl);
      if (mediaRes.ok) {
        const mediaJson = await mediaRes.json();
        mediaItems = mediaJson.data || [];
      }
    } catch (mediaErr) {
      console.warn('[Instagram Insights API] Aviso ao buscar mídias:', mediaErr);
    }

    // 5. Buscar Campanhas e Logs do Supabase para Cruzamento
    const [{ data: campaigns }, { data: logs }, { data: links }] = await Promise.all([
      supabase.from('dm_campaigns').select('*'),
      supabase.from('dm_logs').select('*'),
      supabase.from('tracked_links').select('*'),
    ]);

    const activeCampaigns = campaigns || [];
    const allLogs = logs || [];
    const allLinks = links || [];

    // Calcular estatísticas do Funil Auto-DM
    const totalDmsSent = allLogs.filter((l) => l.status === 'SENT').length;
    const totalDmsAttempted = allLogs.length;
    const dmsDeliveredRate =
      totalDmsAttempted > 0
        ? Math.round((totalDmsSent / totalDmsAttempted) * 100)
        : 100;

    // Follow-Gate stats (trava de seguidor)
    const followGateChecked = allLogs.filter((l) => l.comment_text?.includes('QR_CHECK_FOLLOW') || l.status === 'SENT').length;
    const followGateConverted = totalDmsSent; // Usuários que seguiram e receberam o link
    const followGateConversionRate =
      followGateChecked > 0
        ? Math.round((followGateConverted / followGateChecked) * 100)
        : 100;

    const totalClicks = allLinks.reduce((acc, curr) => acc + (curr.clicks || 0), 0) +
      activeCampaigns.reduce((acc, curr) => acc + (curr.clicks_count || 0), 0);

    const overallCtr =
      totalDmsSent > 0
        ? Number(((totalClicks / totalDmsSent) * 100).toFixed(1))
        : 0;

    const funnel: InstagramFunnelStats = {
      commentsDetected: allLogs.length || 1,
      dmsSent: totalDmsSent,
      dmsDeliveredRate,
      followGateChecked: Math.max(followGateChecked, totalDmsSent),
      followGateConverted,
      followGateConversionRate,
      linkClicks: totalClicks,
      overallCtr,
    };

    // 6. Enriquecer cada Mídia com Insights do Reel e Vínculo de Campanhas
    const mediaWithInsights: InstagramMediaItemWithInsights[] = await Promise.all(
      mediaItems.map(async (m: any) => {
        let reelMetrics: Record<string, number> = {
          reach: 0,
          views: 0,
          total_interactions: 0,
          likes: m.like_count || 0,
          comments: m.comments_count || 0,
          shares: 0,
          saved: 0,
        };

        try {
          const insightsUrl = `https://graph.instagram.com/v25.0/${m.id}/insights?metric=reach,total_interactions,likes,comments,shares,saved,views&access_token=${accessToken}`;
          const res = await fetch(insightsUrl);
          if (res.ok) {
            const json = await res.json();
            (json.data || []).forEach((item: any) => {
              reelMetrics[item.name] = item.values?.[0]?.value || 0;
            });
          }
        } catch {
          // Fallback silencioso se insight específico não disponível
        }

        // Verificar se há campanha associada a este post
        const directCampaign = activeCampaigns.find((c) => c.post_id === m.id);
        const globalCampaign = activeCampaigns.find((c) => c.scope === 'any' && c.is_active);
        const matchedCampaign = directCampaign || globalCampaign;

        // DMs geradas para este post específico
        const dmsForPost = allLogs.filter(
          (l) => l.campaign_id === matchedCampaign?.id
        ).length;

        return {
          id: m.id,
          caption: m.caption || '',
          mediaType: m.media_type || 'VIDEO',
          mediaUrl: m.media_url,
          thumbnailUrl: m.thumbnail_url || m.media_url,
          permalink: m.permalink || '',
          timestamp: m.timestamp || '',
          likeCount: reelMetrics.likes || m.like_count || 0,
          commentsCount: reelMetrics.comments || m.comments_count || 0,
          views: reelMetrics.views || 0,
          reach: reelMetrics.reach || 0,
          totalInteractions: reelMetrics.total_interactions || 0,
          shares: reelMetrics.shares || 0,
          saved: reelMetrics.saved || 0,
          campaignId: matchedCampaign?.id,
          campaignName: matchedCampaign?.name,
          dmsSentCount: dmsForPost,
        };
      })
    );

    const payload: InstagramInsightsPayload = {
      success: true,
      account,
      kpis,
      funnel,
      dailyReach,
      media: mediaWithInsights,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(payload);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro interno';
    console.error('[Instagram Insights API] Erro inesperado:', err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
