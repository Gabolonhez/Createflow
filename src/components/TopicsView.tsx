'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { Topic } from '@/types';

interface TopicsViewProps {
  topics: Topic[];
  onGenerateNewTopics: () => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onGenerateFromTopic: (topic: Topic) => void;
}

export function TopicsView({
  topics,
  onGenerateNewTopics,
  onDeleteTopic,
  onGenerateFromTopic,
}: TopicsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTopics = async () => {
    setIsGenerating(true);
    try {
      await onGenerateNewTopics();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-900/20 via-indigo-900/15 to-transparent border border-violet-500/20 flex-wrap gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Pautas & Ângulos Estratégicos</h3>
          </div>
          <p className="text-xs text-white/50 mt-0.5">
            Ideias de alto engajamento sugeridas pela IA com base no seu nicho, pilares e tendências de tecnologia.
          </p>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateTopics}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/20 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
        >
          <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Sugerindo pautas…' : 'Sugerir 5 pautas com IA'}</span>
        </button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0f15] border border-white/[0.08] hover:border-violet-500/30 transition-all group"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20">
                  {topic.pillar}
                </span>

                <div className="flex items-center gap-1">
                  {topic.platforms.includes('x') && <XLogo className="size-3 text-white/70" />}
                  {topic.platforms.includes('linkedin') && (
                    <LinkedInLogo className="size-3 text-[#0A66C2]" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-white/90 leading-snug">
                {topic.title}
              </h4>

              <div className="p-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs text-white/60 leading-relaxed">
                <strong className="text-white/80 font-medium">Ângulo provocativo: </strong>
                {topic.hook_angle}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => onGenerateFromTopic(topic)}
                className="flex items-center gap-1.5 text-xs font-semibold text-violet-300 hover:text-violet-200 transition-colors"
              >
                <Sparkles size={13} className="text-violet-400" />
                <span>Gerar post desta pauta</span>
                <ArrowRight size={12} />
              </button>

              <button
                type="button"
                onClick={() => onDeleteTopic(topic.id)}
                className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
