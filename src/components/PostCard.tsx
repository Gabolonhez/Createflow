'use client';

import React from 'react';
import {
  CalendarClock,
  ExternalLink,
  ListOrdered,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Send,
  MoreVertical,
} from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { CreatorPost, PostStatus } from '@/types';

interface PostCardProps {
  post: CreatorPost;
  onOpen: (post: CreatorPost) => void;
  onDelete: (id: string) => void;
  onPublishNow: (id: string) => void;
  onApprove?: (id: string) => void;
}

const STATUS_CONFIG: Record<
  PostStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  DRAFT: {
    label: 'Rascunho',
    bg: 'bg-white/[0.05]',
    text: 'text-white/40',
    border: 'border-white/[0.1]',
  },
  AWAITING_APPROVAL: {
    label: 'Aguardando aprovação',
    bg: 'bg-blue-500/15',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  SCHEDULED: {
    label: 'Agendado',
    bg: 'bg-violet-500/15',
    text: 'text-violet-300',
    border: 'border-violet-500/30',
  },
  PUBLISHING: {
    label: 'Publicando…',
    bg: 'bg-yellow-500/15',
    text: 'text-yellow-400',
    border: 'border-yellow-500/30',
  },
  PUBLISHED: {
    label: 'Publicado',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  REJECTED: {
    label: 'Rejeitado',
    bg: 'bg-rose-500/15',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
  ERROR: {
    label: 'Erro',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
  },
};

const PILLAR_LABELS: Record<string, string> = {
  'founder-journey': 'Jornada de Founder',
  'tech-insights': 'Tech & Arquitetura',
  'lessons': 'Lições Práticas',
  'hot-takes': 'Opinião & Debate',
  'case-study': 'Estudo de Caso',
};

export function PostCard({
  post,
  onOpen,
  onDelete,
  onPublishNow,
  onApprove,
}: PostCardProps) {
  const statusCfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
  const pillarLabel = (post.pillar && PILLAR_LABELS[post.pillar]) || post.pillar || 'Geral';

  const formatSchedule = (isoString?: string | null) => {
    if (!isoString) return null;
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={() => onOpen(post)}
      className="group relative flex flex-col justify-between p-4 rounded-xl bg-[#0f0f14] hover:bg-[#13131a] border border-white/[0.08] hover:border-white/[0.18] transition-all cursor-pointer shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Platforms */}
          <div className="flex items-center gap-1.5">
            {post.platforms.includes('x') && (
              <span className="p-1 rounded bg-black border border-white/[0.15] text-white flex items-center justify-center">
                <XLogo className="size-3" />
              </span>
            )}
            {post.platforms.includes('linkedin') && (
              <span className="p-1 rounded bg-[#0A66C2]/20 border border-[#0A66C2]/40 text-[#70b5f9] flex items-center justify-center">
                <LinkedInLogo className="size-3 text-[#0A66C2]" />
              </span>
            )}
            <span className="text-[11px] font-mono text-white/50 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">
              {pillarLabel}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Post Text Snippet */}
        <p className="text-[13px] text-white/85 line-clamp-3 leading-relaxed font-sans">
          {post.text}
        </p>

        {/* Thread and Voice Check indicators */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {post.thread && post.thread.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
              <ListOrdered size={12} />
              Fio ({post.thread.length + 1} tweets)
            </span>
          )}

          {post.voiceCheck?.level === 'warn' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
              <AlertTriangle size={11} />
              Pode soar como IA
            </span>
          )}

          {post.voiceCheck?.level === 'ok' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md">
              <CheckCircle2 size={11} />
              Tom autoral
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06] text-xs">
        {post.scheduledFor ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-violet-300">
            <CalendarClock size={12} />
            {formatSchedule(post.scheduledFor)}
          </span>
        ) : post.publishedAt ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <CheckCircle2 size={12} />
            Publicado
          </span>
        ) : (
          <span className="font-mono text-[11px] text-white/40">Sem agendamento</span>
        )}

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {post.status === 'AWAITING_APPROVAL' && onApprove && (
            <button
              type="button"
              onClick={() => onApprove(post.id)}
              className="px-2 py-1 rounded bg-violet-600 hover:bg-violet-500 text-white font-medium text-[11px] transition-colors"
            >
              Aprovar
            </button>
          )}

          {post.status !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={() => onPublishNow(post.id)}
              title="Publicar agora"
              className="p-1 rounded text-white/50 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Send size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(post.id)}
            title="Excluir post"
            className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
