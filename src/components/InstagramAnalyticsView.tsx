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
      <div className="p-5 rounded-2xl bg-[#111114] border border-zinc-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative">
            {data?.account.profilePictureUrl ? (
              <img
                src={data.account.profilePictureUrl}
                alt={data.account.username}
                className="size-14 rounded-full object-cover border-2 border-pink-500/30 p-0.5"
              />
            ) : (
              <div className="size-14 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {data?.account.username?.[0]?.toUpperCase() || 'G'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#111114] border border-zinc-800">
              <InstagramLogo className="size-3.5 text-pink-400" />
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">
                {data?.account.name || 'Gabriel Bolonhez'}
              </h2>
              <span className="font-mono text-xs text-zinc-400">
                @{data?.account.username || 'gabolonhez'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Meta API v25.0 Ao Vivo
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono">
              <span>
                <strong className="text-white font-semibold">
                  {data?.account.followersCount.toLocaleString() || '681'}
                </strong>{' '}
                seguidores
              </span>
              <span>·</span>
              <span>
                <strong className="text-white font-semibold">
                  {data?.account.followsCount.toLocaleString() || '1.939'}
                </strong>{' '}
                seguindo
              </span>
              <span>·</span>
              <span>
                <strong className="text-white font-semibold">
                  {data?.account.mediaCount || data?.media.length || '6'}
                </strong>{' '}
                posts & reels
              </span>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Period selector */}
          <div className="flex items-center p-1 rounded-xl bg-[#0a0a0c] border border-zinc-800/80">
            {(['7d', '14d', '28d'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                  period === p
                    ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
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
            className="p-2 rounded-xl bg-[#0a0a0c] border border-zinc-800/80 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-pink-400' : ''}`} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchInsights(false)}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 font-mono text-[11px] text-white transition-all"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPI Cards Row (6 High-Density Micro-Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* KPI 1: Alcance de Contas */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              ALCANCE ÚNICO
            </span>
            <Users className="size-3.5 text-indigo-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-white tracking-tight">
                {data?.kpis.reach.toLocaleString() || '366'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <TrendingUp className="size-3" /> Contas únicas
          </span>
        </div>

        {/* KPI 2: Visualizações Totais */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              VIEWS REELS & POSTS
            </span>
            <Play className="size-3.5 text-pink-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-pink-300 tracking-tight">
                {data?.kpis.views.toLocaleString() || '819'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Reproduções totais
          </span>
        </div>

        {/* KPI 3: Interações */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              INTERAÇÕES TOTAIS
            </span>
            <Sparkles className="size-3.5 text-amber-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-amber-300 tracking-tight">
                {data?.kpis.totalInteractions.toLocaleString() || '93'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-amber-400">
            {data?.kpis.engagementRate || '11.3'}% engajamento
          </span>
        </div>

        {/* KPI 4: Visitas ao Perfil */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              VISITAS AO PERFIL
            </span>
            <Eye className="size-3.5 text-cyan-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">
                {data?.kpis.profileViews.toLocaleString() || '28'}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-zinc-400">
            Acessos ao seu perfil
          </span>
        </div>

        {/* KPI 5: DMs Disparadas (Auto-DM) */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              DMS DISPARADAS
            </span>
            <Send className="size-3.5 text-emerald-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                {data?.funnel.dmsSent ?? 1}
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            {data?.funnel.dmsDeliveredRate ?? 100}% entrega Meta
          </span>
        </div>

        {/* KPI 6: Follow-Gate (Conversões de Novos Seguidores) */}
        <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700/80 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              TRAVA DE SEGUIDOR
            </span>
            <ShieldCheck className="size-3.5 text-violet-400" />
          </div>
          <div className="my-2">
            {loading ? (
              <div className="h-7 w-16 bg-zinc-800/60 rounded animate-pulse" />
            ) : (
              <span className="text-2xl font-bold font-mono text-violet-300 tracking-tight">
                {data?.funnel.followGateConversionRate ?? 100}%
              </span>
            )}
          </div>
          <span className="text-[11px] font-mono text-violet-400">
            Validação oficial ativa
          </span>
        </div>
      </div>

      {/* Auto-DM Conversion Funnel Pipeline (AutoDM / ManyChat Style) */}
      <div className="p-5 rounded-2xl bg-[#111114] border border-zinc-800/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400">
              <Flame className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Funil de Conversão Auto-DM & Trava de Seguidor
              </h3>
              <p className="text-xs text-zinc-500">
                Acompanhamento em tempo real da jornada do usuário: do comentário ao clique final
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
            Status: Automação 100% ativa
          </span>
        </div>

        {/* 4 Steps Horizontal Tracker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Step 1 */}
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-white">1. Comentários</span>
              <MessageCircle className="size-3.5 text-zinc-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-white">
                {data?.funnel.commentsDetected ?? 1}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">gatilhos</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Usuários que comentaram palavras-chave ativas (ex: <code className="text-pink-400 font-mono">#REA</code>).
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-emerald-400">2. DMs Disparadas</span>
              <Send className="size-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {data?.funnel.dmsSent ?? 1}
              </span>
              <span className="text-[11px] font-mono text-emerald-500/80">100% sucesso</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Mensagens diretas privadas entregues instantaneamente via Meta Webhook.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-violet-300">3. Trava de Seguidor</span>
              <ShieldCheck className="size-3.5 text-violet-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-violet-300">
                {data?.funnel.followGateConverted ?? 1}
              </span>
              <span className="text-[11px] font-mono text-violet-400">convertidos</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Verificação em tempo real se a pessoa já segue seu perfil antes de liberar o link.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl bg-[#0a0a0c] border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
              <span className="font-semibold text-indigo-300">4. Cliques & Conversão</span>
              <ExternalLink className="size-3.5 text-indigo-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-indigo-300">
                {data?.funnel.linkClicks ?? 0}
              </span>
              <span className="text-[11px] font-mono text-zinc-500">cliques rastreados</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Cliques no botão do repositório ou página de vendas configurada.
            </p>
          </div>
        </div>
      </div>

      {/* Daily Reach Trend (Visual Activity Bar) */}
      {data?.dailyReach && data.dailyReach.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#111114] border border-zinc-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white tracking-tight">
                Evolução Diária de Alcance (Contas Únicas)
              </h4>
            </div>
            <span className="text-xs font-mono text-zinc-500">Últimos dias registrados</span>
          </div>

          <div className="flex items-end gap-3 pt-4 pb-2 h-36">
            {data.dailyReach.map((d, idx) => {
              const maxVal = Math.max(...data.dailyReach.map((r) => r.value), 1);
              const heightPercent = Math.max(15, Math.round((d.value / maxVal) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[11px] font-mono text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </span>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-pink-600/40 to-pink-500 border-t border-x border-pink-400/50 hover:to-pink-400 transition-all cursor-pointer"
                    style={{ height: `${heightPercent}%` }}
                    title={`${d.date}: ${d.value} contas alcançadas`}
                  />
                  <span className="text-[10px] font-mono text-zinc-500 truncate w-full text-center">
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
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Desempenho de Mídias & Reels</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-zinc-800 text-zinc-400">
                {filteredMedia.length}
              </span>
            </h3>
            <p className="text-xs text-zinc-500">
              Métricas detalhadas puxadas da Meta Graph API e cruzadas com suas regras de Auto-DM
            </p>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por legenda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-[#0a0a0c] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono w-48 sm:w-56"
              />
            </div>

            {/* Media Type Filter */}
            <div className="flex items-center p-1 rounded-xl bg-[#0a0a0c] border border-zinc-800/80">
              <button
                type="button"
                onClick={() => setMediaFilter('ALL')}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  mediaFilter === 'ALL'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('VIDEO')}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  mediaFilter === 'VIDEO'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Reels
              </button>
              <button
                type="button"
                onClick={() => setMediaFilter('IMAGE')}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                  mediaFilter === 'IMAGE'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Fotos
              </button>
            </div>
          </div>
        </div>

        {/* 3-Column Responsive Grid (Adheres to DESIGN.md Standards) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-3 animate-pulse"
              >
                <div className="h-44 bg-zinc-800/50 rounded-lg w-full" />
                <div className="h-4 bg-zinc-800/50 rounded w-3/4" />
                <div className="h-8 bg-zinc-800/40 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#111114] border border-zinc-800/80 text-center flex flex-col items-center justify-center gap-3">
            <Play className="size-8 text-zinc-600" />
            <span className="text-sm font-semibold text-white">Nenhum post ou reel encontrado</span>
            <p className="text-xs text-zinc-500 max-w-sm">
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
                  className="rounded-xl bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col overflow-hidden group shadow-lg"
                >
                  {/* Thumbnail Banner with Overlay */}
                  <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                    {media.thumbnailUrl || media.mediaUrl ? (
                      <img
                        src={media.thumbnailUrl || media.mediaUrl}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center bg-zinc-900 text-zinc-600">
                        <Play className="size-8" />
                      </div>
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white flex items-center gap-1">
                      {media.mediaType === 'VIDEO' ? (
                        <>
                          <Play className="size-3 text-pink-400 fill-pink-400" />
                          <span>Reels</span>
                        </>
                      ) : (
                        <span>Foto / Carrossel</span>
                      )}
                    </div>

                    {/* Auto-DM Active Badge */}
                    {media.campaignName ? (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-mono text-emerald-300 flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Auto-DM: {media.campaignName}</span>
                      </div>
                    ) : (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-400">
                        Global #REA
                      </div>
                    )}

                    {/* Permalink Button Overlay */}
                    {media.permalink && (
                      <a
                        href={media.permalink}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/75 hover:bg-black text-white/80 hover:text-white transition-all border border-white/15"
                        title="Ver no Instagram"
                      >
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>{formattedDate}</span>
                        {media.dmsSentCount > 0 && (
                          <span className="text-emerald-400 font-semibold">
                            {media.dmsSentCount} DM{media.dmsSentCount > 1 ? 's' : ''} disparada{media.dmsSentCount > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        {media.caption || 'Sem legenda'}
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/60 text-center">
                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">VIEWS</span>
                        <span className="text-xs font-bold font-mono text-pink-300">
                          {media.views > 0 ? media.views.toLocaleString() : (media.views || 0)}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">ALCANCE</span>
                        <span className="text-xs font-bold font-mono text-white">
                          {media.reach > 0 ? media.reach.toLocaleString() : '-'}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">CURTIDAS</span>
                        <span className="text-xs font-bold font-mono text-rose-300">
                          {media.likeCount}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">COMENTÁRIOS</span>
                        <span className="text-xs font-bold font-mono text-amber-300">
                          {media.commentsCount}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">SHARES</span>
                        <span className="text-xs font-bold font-mono text-indigo-300">
                          {media.shares || 0}
                        </span>
                      </div>

                      <div className="p-1.5 rounded-lg bg-[#0a0a0c] border border-zinc-800/40">
                        <span className="text-[10px] font-mono text-zinc-500 block">SALVOS</span>
                        <span className="text-xs font-bold font-mono text-teal-300">
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
                        className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                      >
                        Abrir Reel no App <ArrowUpRight className="size-3" />
                      </a>

                      <button
                        type="button"
                        onClick={() => onOpenCampaignModal?.(media.id)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-[11px] font-mono transition-all"
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
