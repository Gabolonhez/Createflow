'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { XLogo, LinkedInLogo, InstagramLogo } from './BrandIcons';
import { InstagramAnalyticsView } from './InstagramAnalyticsView';
import type { CreatorPost, DmCampaign } from '@/types';

interface PerformanceViewProps {
  posts: CreatorPost[];
  campaigns?: DmCampaign[];
  onOpenCampaignModal?: (postId?: string) => void;
  initialTab?: 'instagram' | 'posts';
}

export function PerformanceView({
  posts,
  campaigns = [],
  onOpenCampaignModal,
  initialTab = 'instagram',
}: PerformanceViewProps) {
  const [activeTab, setActiveTab] = useState<'instagram' | 'posts'>(initialTab);

  const publishedPosts = posts.filter((p) => p.status === 'PUBLISHED');
  const scheduledPosts = posts.filter((p) => p.status === 'SCHEDULED');
  const awaitingPosts = posts.filter((p) => p.status === 'AWAITING_APPROVAL');
  const rejectedPosts = posts.filter((p) => p.status === 'REJECTED');

  const xPublishedCount = publishedPosts.filter((p) => p.platforms.includes('x')).length;
  const linkedinPublishedCount = publishedPosts.filter((p) => p.platforms.includes('linkedin')).length;

  const totalEvaluated = publishedPosts.length + rejectedPosts.length;
  const approvalRate = totalEvaluated > 0
    ? Math.round((publishedPosts.length / totalEvaluated) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Tab Bar Navigation */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#111114] border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'instagram'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <InstagramLogo className="size-3.5 text-pink-400" />
            <span>Instagram & Auto-DM</span>
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === 'posts'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Layers className="size-3.5 text-zinc-400" />
            <span>Fila & Posts Autorais</span>
            <span className="text-[10px] text-zinc-500 font-mono">({publishedPosts.length})</span>
          </button>
        </div>

        <span className="text-xs font-mono text-zinc-500 hidden md:inline">
          {activeTab === 'instagram'
            ? 'Dados em tempo real via Meta Graph API v25.0'
            : 'Métricas de aprovação e calibração de voz'}
        </span>
      </div>

      {/* Tab 1: Instagram & AutoDM Analytics View */}
      {activeTab === 'instagram' ? (
        <InstagramAnalyticsView
          campaigns={campaigns}
          onOpenCampaignModal={onOpenCampaignModal}
        />
      ) : (
        /* Tab 2: Posts & Queue Performance */
        <div className="flex flex-col gap-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">POSTS PUBLICADOS</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-white">{publishedPosts.length}</span>
                <span className="text-xs text-emerald-400 font-mono">100% no ar</span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1">Total acumulado</span>
            </div>

            {/* KPI 2 */}
            <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">AGENDADOS NA FILA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-violet-300">{scheduledPosts.length}</span>
                <span className="text-xs text-zinc-500 font-mono">próximos dias</span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1">Prontos para publicação</span>
            </div>

            {/* KPI 3 */}
            <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">AGUARDANDO VOCÊ</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-amber-300">{awaitingPosts.length}</span>
                <span className="text-xs text-amber-400 font-mono">precisam de revisão</span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1">Gerados pela IA</span>
            </div>

            {/* KPI 4 */}
            <div className="p-4 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-zinc-500 uppercase">TAXA DE APROVAÇÃO</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-400">{approvalRate}%</span>
                <span className="text-xs text-emerald-400/80 font-mono">calibração alta</span>
              </div>
              <span className="text-[11px] text-zinc-500 mt-1">Alinhamento com seu tom</span>
            </div>
          </div>

          {/* Network Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* X Distribution Card */}
            <div className="p-5 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-black border border-white/[0.1] text-white">
                    <XLogo className="size-4" />
                  </span>
                  <span className="text-sm font-semibold text-white">X (Twitter)</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">{xPublishedCount} publicados</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Foco em opiniões afiadas, ganchos imediatos, tópicos de arquitetura e fios de bastidores.
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                <span>Limite de 280 caracteres respeitado</span>
                <span>·</span>
                <span>Suporte a Fio / Thread ativo</span>
              </div>
            </div>

            {/* LinkedIn Distribution Card */}
            <div className="p-5 rounded-xl bg-[#111114] border border-zinc-800/80 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70b5f9]">
                    <LinkedInLogo className="size-4 text-[#0A66C2]" />
                  </span>
                  <span className="text-sm font-semibold text-white">LinkedIn</span>
                </div>
                <span className="text-xs font-mono text-zinc-400">{linkedinPublishedCount} publicados</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Foco em liderança de pensamento, lições de engenharia, tomadas de decisão e cultura de desenvolvimento.
              </p>

              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60 text-[11px] font-mono text-zinc-500">
                <span>Ganchos pré-ver mais</span>
                <span>·</span>
                <span>Artigos e feed B2B</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
