'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Eye,
  Play,
  Sparkles,
  Share2,
  Bookmark,
  Heart,
  MessageCircle,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Send,
  Users,
  Search,
  ExternalLink,
  Layers,
  Flame,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { InstagramLogo } from './BrandIcons';
import type {
  InstagramInsightsPayload,
  InstagramMediaItemWithInsights,
  DmCampaign,
} from '@/types';

interface InstagramAnalyticsViewProps {
  campaigns?: DmCampaign[];
  onOpenCampaignModal?: (postId?: string) => void;
}

export function InstagramAnalyticsView({
  campaigns = [],
  onOpenCampaignModal,
}: InstagramAnalyticsViewProps) {
  const [data, setData] = useState<InstagramInsightsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'7d' | '14d' | '28d'>('28d');
  const [mediaFilter, setMediaFilter] = useState<'ALL' | 'VIDEO' | 'IMAGE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInsights = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/instagram/insights?period=${period}`);
      const json: InstagramInsightsPayload = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha ao carregar dados da Meta Graph API');
      }

      setData(json);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao conectar à API do Instagram';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Filtragem de mídias
  const filteredMedia = (data?.media || []).filter((item) => {
    if (mediaFilter === 'VIDEO' && item.mediaType !== 'VIDEO') return false;
    if (mediaFilter === 'IMAGE' && item.mediaType === 'VIDEO') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.caption.toLowerCase().includes(q) ||
        (item.campaignName && item.campaignName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto pb-12">
      {/* Top Header Card / Profile Strip */}
      <div className="p-5 sm:p-6 rounded-[22px] bg-[#141414] border border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {data?.account.profilePictureUrl ? (
              <img
                src={data.account.profilePictureUrl}
                alt={data.account.username}
                className="size-14 rounded-full object-cover border border-[#323232] p-0.5 bg-[#1c1c1c]"
              />
            ) : (
              <div className="size-14 rounded-full bg-[#212121] border border-[#2e2e2e] flex items-center justify-center text-[#ececec] font-bold text-xl">
                {data?.account.username?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#141414] border border-[#2a2a2a]">
              <InstagramLogo className="size-3.5 text-[#ececec]" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-semibold text-[#ececec] tracking-tight">
                {data?.account.name || 'Gabriel Bolonhez'}
              </h2>
              <span className="font-mono text-xs text-[#7a7a7a]">
                @{data?.account.username || 'gabolonhez'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#212121] text-[#7ae6a0] border border-[#2c2c2c] flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#7ae6a0] animate-pulse" />
                Meta API v25.0 Ao Vivo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7a7a7a] font-mono flex-wrap">
              <span>
                <strong className="text-[#ececec] font-semibold">
                  {data?.account.followersCount.toLocaleString() || '681'}
                </strong>{' '}
                seguidores
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#ececec] font-semibold">
                  {data?.account.followsCount.toLocaleString() || '1.939'}
                </strong>{' '}
                seguindo
              </span>
              <span>·</span>
              <span>
                <strong className="text-[#ececec] font-semibold">
                  {data?.account.mediaCount || data?.media.length || '6'}
                </strong>{' '}
                posts & reels
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Period selector */}
          <div className="flex items-center p-1 rounded-full bg-[#0e0e0e] border border-[#242424]">
            {(['7d', '14d', '28d'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer ${
                  period === p
                    ? 'bg-[#212121] text-[#ececec] font-semibold'
                    : 'text-[#7a7a7a] hover:text-[#ececec]'
                }`}
              >
                {p === '7d' ? '7 dias' : p === '14d' ? '14 dias' : '28 dias'}
              </button>
            ))}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={() => fetchInsights(true)}
            disabled={refreshing || loading}
            aria-label="Atualizar métricas da conta"
            className="px-3.5 py-1.5 rounded-full bg-[#212121] border border-[#2e2e2e] hover:bg-[#2a2a2a] text-[#ececec] transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-mono cursor-pointer active:scale-[0.97]"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-[18px] bg-[#ff5f56]/10 border border-[#ff5f56]/25 text-[#ff5f56] text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchInsights(false)}
            className="px-3 py-1 rounded-full bg-[#212121] hover:bg-[#2a2a2a] font-mono text-[11px] text-[#ececec] border border-[#2e2e2e] transition-all cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPI Cards Row (6 High-Density Micro-Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Alcance de Contas */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              ALCANCE ÚNICO
            </span>
            <Users className="size-3.5 text-[#8a8a8a]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#ececec] tracking-tight">
                {data?.kpis.reach.toLocaleString() || '366'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#7ae6a0] flex items-center gap-1">
            <TrendingUp className="size-3" /> Contas únicas
          </span>
        </div>

        {/* KPI 2: Visualizações Totais */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              VIEWS REELS & POSTS
            </span>
            <Play className="size-3.5 text-[#8a8a8a]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#ececec] tracking-tight">
                {data?.kpis.views.toLocaleString() || '819'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#7a7a7a]">
            Reproduções totais
          </span>
        </div>

        {/* KPI 3: Interações */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              INTERAÇÕES TOTAIS
            </span>
            <Sparkles className="size-3.5 text-[#8a8a8a]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#ececec] tracking-tight">
                {data?.kpis.totalInteractions.toLocaleString() || '93'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#9a9a9a]">
            {data?.kpis.engagementRate || '11.3'}% engajamento
          </span>
        </div>

        {/* KPI 4: Visitas ao Perfil */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              VISITAS AO PERFIL
            </span>
            <Eye className="size-3.5 text-[#8a8a8a]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#ececec] tracking-tight">
                {data?.kpis.profileViews.toLocaleString() || '28'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#7a7a7a]">
            Acessos ao seu perfil
          </span>
        </div>

        {/* KPI 5: DMs Disparadas (Auto-DM) */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              DMS DISPARADAS
            </span>
            <Send className="size-3.5 text-[#7ae6a0]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#7ae6a0] tracking-tight">
                {data?.funnel.dmsSent ?? 1}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#7ae6a0]">
            {data?.funnel.dmsDeliveredRate ?? 100}% entrega Meta
          </span>
        </div>

        {/* KPI 6: Follow-Gate (Conversões de Novos Seguidores) */}
        <div className="p-4 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[#7a7a7a] uppercase tracking-wider">
              TRAVA DE SEGUIDOR
            </span>
            <ShieldCheck className="size-3.5 text-[#0c8ce9]" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-[#212121] rounded-lg animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-[#ececec] tracking-tight">
                {data?.funnel.followGateConversionRate ?? 100}%
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-[#7a7a7a]">
            Validação oficial ativa
          </span>
        </div>
      </div>

      {/* Auto-DM Conversion Funnel Pipeline */}
      <div className="p-5 sm:p-6 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center">
              <Flame className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#ececec] tracking-tight">
                Funil de Conversão Auto-DM & Trava de Seguidor
              </h3>
              <p className="text-xs text-[#7a7a7a]">
                Acompanhamento em tempo real da jornada do usuário: do comentário ao clique final
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-[#7ae6a0] hidden sm:inline px-2.5 py-0.5 rounded-full bg-[#212121] border border-[#2c2c2c]">
            Automação 100% ativa
          </span>
        </div>

        {/* 4 Steps Horizontal Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-[18px] bg-[#161616] border border-[#222222] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-[#9a9a9a] font-mono">
              <span className="font-semibold text-[#ececec]">1. Comentários</span>
              <MessageCircle className="size-3.5 text-[#8a8a8a]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#ececec]">
                {data?.funnel.commentsDetected ?? 1}
              </span>
              <span className="text-[11px] font-mono text-[#6f6f6f]">gatilhos</span>
            </div>
            <p className="text-[11px] text-[#8a8a8a] leading-snug">
              Usuários que comentaram palavras-chave ativas (ex: <code className="text-[#ececec] font-mono">#REA</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-[18px] bg-[#161616] border border-[#222222] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#7ae6a0]">2. DMs Disparadas</span>
              <Send className="size-3.5 text-[#7ae6a0]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#7ae6a0]">
                {data?.funnel.dmsSent ?? 1}
              </span>
              <span className="text-[11px] font-mono text-[#7ae6a0]/80">100% sucesso</span>
            </div>
            <p className="text-[11px] text-[#8a8a8a] leading-snug">
              Mensagens diretas privadas entregues instantaneamente via Meta Webhook.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-[18px] bg-[#161616] border border-[#222222] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#ececec]">3. Trava de Seguidor</span>
              <ShieldCheck className="size-3.5 text-[#0c8ce9]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#ececec]">
                {data?.funnel.followGateConverted ?? 1}
              </span>
              <span className="text-[11px] font-mono text-[#0c8ce9]">convertidos</span>
            </div>
            <p className="text-[11px] text-[#8a8a8a] leading-snug">
              Verificação em tempo real se a pessoa já segue seu perfil antes de liberar o link.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-[18px] bg-[#161616] border border-[#222222] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-[#ececec]">4. Cliques & Conversão</span>
              <ExternalLink className="size-3.5 text-[#8a8a8a]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-[#ececec]">
                {data?.funnel.linkClicks ?? 0}
              </span>
              <span className="text-[11px] font-mono text-[#6f6f6f]">cliques rastreados</span>
            </div>
            <p className="text-[11px] text-[#8a8a8a] leading-snug">
              Cliques no botão do repositório ou página de vendas configurada.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Reach Trend (Visual Activity Bar) */}
      {data?.dailyReach && data.dailyReach.length > 0 && (
        <div className="p-5 sm:p-6 rounded-[22px] bg-[#141414] border border-[#242424]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-[#7ae6a0]" />
              <h4 className="text-sm font-semibold text-[#ececec] tracking-tight">
                Evolução Diária de Alcance (Contas Únicas)
              </h4>
            </div>
            <span className="text-xs font-mono text-[#6f6f6f]">Últimos dias registrados</span>
          </div>

          <div className="flex items-end gap-3 pt-4 pb-2 h-36">
            {data.dailyReach.map((d, idx) => {
              const maxVal = Math.max(...data.dailyReach.map((r) => r.value), 1);
              const heightPercent = Math.max(15, Math.round((d.value / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-[#ececec] opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </span>
                  <div
                    className="w-full rounded-t-[6px] bg-[#e0e0e0]/75 hover:bg-[#f2f2f2] border-t border-x border-[#f2f2f2]/30 transition-all cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.date}: ${d.value} contas alcançadas`}
                  />
                  <span className="text-[10px] font-mono text-[#6f6f6f] truncate w-full text-center">
                    {d.date.split('-').slice(1).join('/')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reels & Posts Performance Leaderboard */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-[#ececec] tracking-tight flex items-center gap-2">
              <span>Desempenho de Mídias & Reels</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#212121] border border-[#2c2c2c] text-[#9a9a9a]">
                {filteredMedia.length}
              </span>
            </h3>
            <p className="text-xs text-[#7a7a7a]">
              Métricas detalhadas puxadas da Meta Graph API e cruzadas com suas regras de Auto-DM
            </p>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#6f6f6f]" />
              <input
                type="text"
                placeholder="Buscar por legenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs bg-[#1c1c1c] border border-[#2a2a2a] rounded-full text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] font-mono w-48 sm:w-56 transition-colors"
              />
            </div>

            {/* Media Type Filter */}
            <div className="flex items-center p-1 rounded-full bg-[#141414] border border-[#242424]">
              <button
                type="button"
                onClick={() => setMediaFilter('ALL')}
                className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer ${
                  mediaFilter === 'ALL'
                    ? 'bg-[#212121] text-[#ececec] font-medium'
                    : 'text-[#7a7a7a] hover:text-[#ececec]'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('VIDEO')}
                className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer ${
                  mediaFilter === 'VIDEO'
                    ? 'bg-[#212121] text-[#ececec] font-medium'
                    : 'text-[#7a7a7a] hover:text-[#ececec]'
                }`}
              >
                Reels
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('IMAGE')}
                className={`px-3 py-1 text-xs font-mono rounded-full transition-all cursor-pointer ${
                  mediaFilter === 'IMAGE'
                    ? 'bg-[#212121] text-[#ececec] font-medium'
                    : 'text-[#7a7a7a] hover:text-[#ececec]'
                }`}
              >
                Fotos
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Responsive Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3 animate-pulse"
              >
                <div className="h-44 bg-[#212121] rounded-[14px] w-full" />
                <div className="h-4 bg-[#212121] rounded-lg w-3/4" />
                <div className="h-8 bg-[#1c1c1c] rounded-lg w-full" />
              </div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 rounded-[22px] bg-[#141414] border border-[#242424] text-center flex flex-col items-center justify-center gap-3">
            <Play className="size-8 text-[#6f6f6f]" />
            <span className="text-sm font-semibold text-[#ececec]">Nenhum post ou reel encontrado</span>
            <p className="text-xs text-[#7a7a7a] max-w-sm">
              Não encontramos mídias correspondentes aos filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMedia.map((media) => {
              const formattedDate = media.timestamp
                ? new Date(media.timestamp).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={media.id}
                  className="rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#343434] transition-all flex flex-col overflow-hidden group"
                >
                  {/* Thumbnail Banner with Overlay */}
                  <div className="relative aspect-video bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
                    {media.thumbnailUrl || media.mediaUrl ? (
                      <img
                        src={media.thumbnailUrl || media.mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-[#1c1c1c] text-[#6f6f6f]">
                        <Play className="size-8" />
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-[#111111]/85 backdrop-blur-md border border-[#2c2c2c] text-[10px] font-mono text-[#ececec] flex items-center gap-1">
                      {media.mediaType === 'VIDEO' ? (
                        <>
                          <Play className="size-3 text-[#ececec]" />
                          <span>Reels</span>
                        </>
                      ) : (
                        <span>Foto / Carrossel</span>
                      )}
                    </div>

                    {/* Auto-DM Active Badge */}
                    {media.campaignName ? (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#111111]/85 backdrop-blur-md border border-[#7ae6a0]/35 text-[10px] font-mono text-[#7ae6a0] flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-[#7ae6a0] animate-pulse" />
                        <span>Auto-DM: {media.campaignName}</span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-[#111111]/80 backdrop-blur-md border border-[#2c2c2c] text-[10px] font-mono text-[#8a8a8a]">
                        Global #REA
                      </div>
                    )}

                    {/* Permalink Button Overlay */}
                    {media.permalink && (
                      <a
                        href={media.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-full bg-[#111111]/85 hover:bg-[#212121] text-[#ececec] transition-all border border-[#2c2c2c]"
                        title="Ver no Instagram"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#6f6f6f]">
                        <span>{formattedDate}</span>
                        {media.dmsSentCount > 0 && (
                          <span className="text-[#7ae6a0] font-semibold">
                            {media.dmsSentCount} DM{media.dmsSentCount > 1 ? 's' : ''} disparada{media.dmsSentCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#d0d0d0] line-clamp-2 leading-relaxed">
                        {media.caption || 'Sem legenda'}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#222222] text-center">
                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">VIEWS</span>
                        <span className="text-xs font-bold font-mono text-[#ececec]">
                          {media.views > 0 ? media.views.toLocaleString() : (media.views || 0)}
                        </span>
                      </div>

                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">ALCANCE</span>
                        <span className="text-xs font-bold font-mono text-[#ececec]">
                          {media.reach > 0 ? media.reach.toLocaleString() : '-'}
                        </span>
                      </div>

                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">CURTIDAS</span>
                        <span className="text-xs font-bold font-mono text-[#ececec]">
                          {media.likeCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">COMENTÁRIOS</span>
                        <span className="text-xs font-bold font-mono text-[#ececec]">
                          {media.commentsCount}
                        </span>
                      </div>

                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">SHARES</span>
                        <span className="text-xs font-bold font-mono text-[#ececec]">
                          {media.shares || 0}
                        </span>
                      </div>

                      <div className="p-2 rounded-[12px] bg-[#1c1c1c] border border-[#262626]">
                        <span className="text-[10px] font-mono text-[#6f6f6f] block">SALVOS</span>
                        <span className="text-xs font-bold font-mono text-[#7ae6a0]">
                          {media.saved || 0}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="pt-2 flex items-center justify-between text-xs font-mono">
                      <a
                        href={media.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#8a8a8a] hover:text-[#ececec] transition-colors flex items-center gap-1 text-[11px]"
                      >
                        Abrir Reel no App <ArrowUpRight className="size-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onOpenCampaignModal?.(media.id)}
                        className="px-3 py-1 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] text-[11px] font-mono transition-all cursor-pointer active:scale-[0.97]"
                      >
                        Configurar DM
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
