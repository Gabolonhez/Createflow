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
      <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-1 p-1 rounded-full bg-[#141414] border border-[#242424]">
          <button
            type="button"
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'instagram'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <InstagramLogo className="size-3.5" />
            <span>Instagram & Auto-DM</span>
            <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'bg-[#212121] text-[#ececec]'
                : 'text-[#8a8a8a] hover:text-[#ececec]'
            }`}
          >
            <Layers className="size-3.5 text-[#a0a0a0]" />
            <span>Fila & Posts Autorais</span>
            <span className="text-[10px] text-[#7a7a7a] font-mono">({publishedPosts.length})</span>
          </button>
        </div>

        <span className="text-xs font-mono text-[#6f6f6f] hidden md:inline">
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
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#7a7a7a] uppercase">POSTS PUBLICADOS</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#ececec]">{publishedPosts.length}</span>
                <span className="text-xs text-[#7ae6a0] font-mono">100% no ar</span>
              </div>
              <span className="text-[11px] text-[#6f6f6f] mt-1">Total acumulado</span>
            </div>

            {/* KPI 2 */}
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#7a7a7a] uppercase">AGENDADOS NA FILA</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#ececec]">{scheduledPosts.length}</span>
                <span className="text-xs text-[#7a7a7a] font-mono">próximos dias</span>
              </div>
              <span className="text-[11px] text-[#6f6f6f] mt-1">Prontos para publicação</span>
            </div>

            {/* KPI 3 */}
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#7a7a7a] uppercase">AGUARDANDO VOCÊ</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#ffbd2e]">{awaitingPosts.length}</span>
                <span className="text-xs text-[#ffbd2e] font-mono">precisam de revisão</span>
              </div>
              <span className="text-[11px] text-[#6f6f6f] mt-1">Gerados pela IA</span>
            </div>

            {/* KPI 4 */}
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-1">
              <span className="text-[11px] font-mono text-[#7a7a7a] uppercase">TAXA DE APROVAÇÃO</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-[#7ae6a0]">{approvalRate}%</span>
                <span className="text-xs text-[#7ae6a0]/80 font-mono">calibração alta</span>
              </div>
              <span className="text-[11px] text-[#6f6f6f] mt-1">Alinhamento com seu tom</span>
            </div>
          </div>

          {/* Network Distribution Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* X Distribution Card */}
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center">
                    <XLogo className="size-3.5" />
                  </span>
                  <span className="text-sm font-semibold text-[#ececec]">X (Twitter)</span>
                </div>
                <span className="text-xs font-mono text-[#8a8a8a]">{xPublishedCount} publicados</span>
              </div>

              <p className="text-xs text-[#8a8a8a] leading-relaxed">
                Foco em opiniões afiadas, ganchos imediatos, tópicos de arquitetura e fios de bastidores.
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-[#222222] text-[11px] font-mono text-[#6f6f6f]">
                <span>Limite de 280 caracteres respeitado</span>
                <span>·</span>
                <span>Suporte a Fio / Thread ativo</span>
              </div>
            </div>

            {/* LinkedIn Distribution Card */}
            <div className="p-5 rounded-[20px] bg-[#161616] border border-[#222222] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="size-8 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center">
                    <LinkedInLogo className="size-3.5 text-[#0A66C2]" />
                  </span>
                  <span className="text-sm font-semibold text-[#ececec]">LinkedIn</span>
                </div>
                <span className="text-xs font-mono text-[#8a8a8a]">{linkedinPublishedCount} publicados</span>
              </div>

              <p className="text-xs text-[#8a8a8a] leading-relaxed">
                Foco em liderança de pensamento, lições de engenharia, tomadas de decisão e cultura de desenvolvimento.
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-[#222222] text-[11px] font-mono text-[#6f6f6f]">
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
