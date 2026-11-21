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
    bg: 'bg-[#212121]',
    text: 'text-[#8a8a8a]',
    border: 'border-[#2c2c2c]',
  },
  AWAITING_APPROVAL: {
    label: 'Aguardando aprovação',
    bg: 'bg-[#ffbd2e]/12',
    text: 'text-[#ffbd2e]',
    border: 'border-[#ffbd2e]/25',
  },
  SCHEDULED: {
    label: 'Agendado',
    bg: 'bg-[#242424]',
    text: 'text-[#ececec]',
    border: 'border-[#333333]',
  },
  PUBLISHING: {
    label: 'Publicando…',
    bg: 'bg-[#ffbd2e]/12',
    text: 'text-[#ffbd2e]',
    border: 'border-[#ffbd2e]/25',
  },
  PUBLISHED: {
    label: 'Publicado',
    bg: 'bg-[#7ae6a0]/12',
    text: 'text-[#7ae6a0]',
    border: 'border-[#7ae6a0]/25',
  },
  REJECTED: {
    label: 'Rejeitado',
    bg: 'bg-[#ff5f56]/12',
    text: 'text-[#ff8a84]',
    border: 'border-[#ff5f56]/25',
  },
  ERROR: {
    label: 'Erro',
    bg: 'bg-[#ff5f56]/12',
    text: 'text-[#ff8a84]',
    border: 'border-[#ff5f56]/25',
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
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-[20px] bg-[#161616] hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#333333] transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex flex-col gap-2.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Platforms */}
          <div className="flex items-center gap-1.5">
            {post.platforms.includes('x') && (
              <span className="p-1.5 rounded-lg bg-[#212121] border border-[#2c2c2c] text-white flex items-center justify-center">
                <XLogo className="size-3" />
              </span>
            )}
            {post.platforms.includes('linkedin') && (
              <span className="p-1.5 rounded-lg bg-[#212121] border border-[#2c2c2c] text-[#0A66C2] flex items-center justify-center">
                <LinkedInLogo className="size-3 text-[#0A66C2]" />
              </span>
            )}
            <span className="text-[10px] font-mono text-[#9a9a9a] px-2 py-0.5 rounded-[5px] bg-[#212121] border border-[#2c2c2c]">
              {pillarLabel}
            </span>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Post Text Snippet */}
        <p className="text-[13px] text-[#ececec] line-clamp-3 leading-relaxed font-sans">
          {post.text}
        </p>

        {/* Thread and Voice Check indicators */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {post.thread && post.thread.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#ececec] bg-[#242424] border border-[#303030] px-2 py-0.5 rounded-[5px]">
              <ListOrdered size={11} />
              Fio ({post.thread.length + 1} tweets)
            </span>
          )}

          {post.voiceCheck?.level === 'warn' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#ffbd2e] bg-[#ffbd2e]/10 border border-[#ffbd2e]/25 px-2 py-0.5 rounded-[5px]">
              <AlertTriangle size={11} />
              Pode soar como IA
            </span>
          )}

          {post.voiceCheck?.level === 'ok' && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#7ae6a0] bg-[#7ae6a0]/10 border border-[#7ae6a0]/25 px-2 py-0.5 rounded-[5px]">
              <CheckCircle2 size={11} />
              Tom autoral
            </span>
          )}
        </div>
      </div>

      {/* Footer Info & Actions */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#222222] text-xs">
        {post.scheduledFor ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#ececec]">
            <CalendarClock size={12} className="text-[#9a9a9a]" />
            {formatSchedule(post.scheduledFor)}
          </span>
        ) : post.publishedAt ? (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#7ae6a0]">
            <CheckCircle2 size={12} />
            Publicado
          </span>
        ) : (
          <span className="font-mono text-[11px] text-[#6f6f6f]">Sem agendamento</span>
        )}

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {post.status === 'AWAITING_APPROVAL' && onApprove && (
            <button
              type="button"
              onClick={() => onApprove(post.id)}
              className="px-3 py-1 rounded-full bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] font-medium text-[11px] transition-all active:scale-[0.97]"
            >
              Aprovar
            </button>
          )}

          {post.status !== 'PUBLISHED' && (
            <button
              type="button"
              onClick={() => onPublishNow(post.id)}
              title="Publicar agora"
              className="p-1.5 rounded-full text-[#8a8a8a] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
            >
              <Send size={13} />
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(post.id)}
            title="Excluir post"
            className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
