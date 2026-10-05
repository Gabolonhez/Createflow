'use client';

import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Send,
  Layers,
  Sparkles,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { CreatorPost } from '@/types';

interface PerformanceViewProps {
  posts: CreatorPost[];
}

export function PerformanceView({ posts }: PerformanceViewProps) {
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
      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-white/40 uppercase">POSTS PUBLICADOS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-white">{publishedPosts.length}</span>
            <span className="text-xs text-emerald-400 font-mono">100% no ar</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">Total acumulado</span>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-white/40 uppercase">AGENDADOS NA FILA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-violet-300">{scheduledPosts.length}</span>
            <span className="text-xs text-white/50 font-mono">próximos dias</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">Prontos para publicação</span>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-white/40 uppercase">AGUARDANDO VOCÊ</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-300">{awaitingPosts.length}</span>
            <span className="text-xs text-amber-400 font-mono">precisam de revisão</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">Gerados pela IA</span>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-1">
          <span className="text-[11px] font-mono text-white/40 uppercase">TAXA DE APROVAÇÃO</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">{approvalRate}%</span>
            <span className="text-xs text-emerald-400/80 font-mono">calibração alta</span>
          </div>
          <span className="text-[11px] text-white/40 mt-1">Alinhamento com seu tom</span>
        </div>
      </div>

      {/* Network Distribution Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* X Distribution Card */}
        <div className="p-5 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-black border border-white/[0.1] text-white">
                <XLogo className="size-4" />
              </span>
              <span className="text-sm font-semibold text-white">X (Twitter)</span>
            </div>
            <span className="text-xs font-mono text-white/50">{xPublishedCount} publicados</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Foco em opiniões afiadas, ganchos imediatos, tópicos de arquitetura e fios de bastidores.
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05] text-[11px] font-mono text-white/40">
            <span>Limite de 280 caracteres respeitado</span>
            <span>·</span>
            <span>Suporte a Fio / Thread ativo</span>
          </div>
        </div>

        {/* LinkedIn Distribution Card */}
        <div className="p-5 rounded-xl bg-[#0f0f15] border border-white/[0.07] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70b5f9]">
                <LinkedInLogo className="size-4 text-[#0A66C2]" />
              </span>
              <span className="text-sm font-semibold text-white">LinkedIn</span>
            </div>
            <span className="text-xs font-mono text-white/50">{linkedinPublishedCount} publicados</span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed">
            Foco em liderança de pensamento, lições de engenharia, tomadas de decisão e cultura de desenvolvimento.
          </p>

          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.05] text-[11px] font-mono text-white/40">
            <span>Ganchos pré-ver mais</span>
            <span>·</span>
            <span>Artigos e feed B2B</span>
          </div>
        </div>
      </div>
    </div>
  );
}
