'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  AlertCircle,
  Clock,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { PostCard } from './PostCard';
import type { CreatorPost, PostStatus } from '@/types';

interface PostsQueueViewProps {
  posts: CreatorPost[];
  onOpenPost: (post: CreatorPost) => void;
  onDeletePost: (id: string) => void;
  onPublishNow: (id: string) => void;
  onApprovePost: (id: string) => void;
  onOpenGenerate: () => void;
  onOpenComposer: () => void;
}

export function PostsQueueView({
  posts,
  onOpenPost,
  onDeletePost,
  onPublishNow,
  onApprovePost,
  onOpenGenerate,
  onOpenComposer,
}: PostsQueueViewProps) {
  const [activeStatus, setActiveStatus] = useState<PostStatus | 'ALL'>('AWAITING_APPROVAL');

  // Filter posts by status tab
  const filteredPosts =
    activeStatus === 'ALL'
      ? posts
      : posts.filter((p) => p.status === activeStatus);

  // Counts for tabs
  const awaitingCount = posts.filter((p) => p.status === 'AWAITING_APPROVAL').length;
  const scheduledCount = posts.filter((p) => p.status === 'SCHEDULED').length;
  const publishedCount = posts.filter((p) => p.status === 'PUBLISHED').length;
  const draftCount = posts.filter((p) => p.status === 'DRAFT').length;

  const tabs: { id: PostStatus | 'ALL'; label: string; count?: number }[] = [
    { id: 'AWAITING_APPROVAL', label: 'Aguardando aprovação', count: awaitingCount },
    { id: 'SCHEDULED', label: 'Agendados', count: scheduledCount },
    { id: 'PUBLISHED', label: 'Publicados', count: publishedCount },
    { id: 'DRAFT', label: 'Rascunhos', count: draftCount },
    { id: 'ALL', label: 'Todos', count: posts.length },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Due Posts Banner (PayPosts Inspired) */}
      {awaitingCount > 0 && (
        <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200">
          <div className="flex items-center gap-2.5">
            <Clock size={16} className="text-amber-400 shrink-0" />
            <span className="text-xs font-medium">
              Você tem <strong className="text-amber-300 font-bold">{awaitingCount} {awaitingCount === 1 ? 'post' : 'posts'}</strong> aguardando sua revisão e aprovação antes de ir para o ar.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveStatus('AWAITING_APPROVAL')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 transition-all shrink-0"
          >
            Revisar agora
          </button>
        </div>
      )}

      {/* Action Controls & Status Tabs Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 overflow-x-auto p-1 rounded-lg bg-white/[0.03] border border-white/[0.07] max-w-full">
          {tabs.map((tab) => {
            const isSelected = activeStatus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatus(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-white/[0.10] text-white shadow-sm font-semibold'
                    : 'text-white/50 hover:text-white/80'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-violet-500/30 text-violet-200' : 'bg-white/[0.08] text-white/50'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 transition-all active:scale-[0.98]"
          >
            <Sparkles size={14} className="text-violet-400" />
            <span>Gerar post com IA</span>
          </button>

          <button
            type="button"
            onClick={onOpenComposer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 transition-all shadow-sm active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Novo post</span>
          </button>
        </div>
      </div>

      {/* Grid of Post Cards */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={onOpenPost}
              onDelete={onDeletePost}
              onPublishNow={onPublishNow}
              onApprove={onApprovePost}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/[0.015] border border-white/[0.06] my-6">
          <div className="size-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 mb-3">
            <Layers size={22} />
          </div>
          <h3 className="text-sm font-semibold text-white/90 mb-1">Nenhum post nesta aba</h3>
          <p className="text-xs text-white/45 max-w-sm mb-4">
            Crie um novo rascunho manualmente ou deixe a IA gerar conteúdos autorais com base nas suas ideias e fatos.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenGenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-md transition-all"
            >
              <Sparkles size={13} />
              Gerar post com IA
            </button>
            <button
              type="button"
              onClick={onOpenComposer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.1] transition-all"
            >
              <Plus size={13} />
              Escrever rascunho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
